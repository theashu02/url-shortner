import { redis } from "@/server/redis/redis";
import { connectToDatabase } from "@/server/db/mongoose";
import { UrlModel } from "@/server/models/url";
import { generateShortCode } from "@/server/lib/base62";
import { CUSTOM_SLUG_RE, CreateResult, LinkDTO, PaginationMeta, URL_TTL_SECONDS, escapeRegex, toDTO, DeleteResult, UpdateResult } from "@/server/lib/url";

export async function createShortUrl(
  url: string,
  customSlug: string | undefined,
  userId: string | null,
  ip: string
): Promise<CreateResult> {
  // Rate limit
  
  const rateLimitKey = `ratelimit:${ip}`;
  const requests = await redis.incr(rateLimitKey);
  if (requests === 1) await redis.expire(rateLimitKey, 60);
  if (requests > 100) return { status: 429, message: "Rate limit exceeded (100 req/min)." };

  let shortCode: string;

  if (customSlug) {
    if (!CUSTOM_SLUG_RE.test(customSlug))
      return { status: 400, message: "Custom alias must be 3–50 characters (letters, numbers, hyphens only)." };

    // Redis fast-path check
    const cachedTaken = await redis.get(`slug:taken:${customSlug}`).catch(() => null);
    if (cachedTaken) return { status: 409, message: "This custom alias is already taken. Please choose another." };

    await connectToDatabase();
    if (await UrlModel.exists({ shortCode: customSlug })) {
      redis.set(`slug:taken:${customSlug}`, "1").catch(() => {});
      return { status: 409, message: "This custom alias is already taken. Please choose another." };
    }

    shortCode = customSlug;
  } else {
    await connectToDatabase();
    shortCode = "";
    for (let i = 0; i < 10; i++) {
      const candidate = generateShortCode();
      if (!(await UrlModel.exists({ shortCode: candidate }))) {
        shortCode = candidate;
        break;
      }
    }
    if (!shortCode) return { status: 500, message: "Failed to generate unique short code. Try again." };
  }

  await Promise.all([
    UrlModel.create({ shortCode, url, userId: userId ?? undefined }),
    redis.setex(`url:${shortCode}`, URL_TTL_SECONDS, url),
    redis.set(`slug:taken:${shortCode}`, "1"),
  ]);

  return { shortCode, originalUrl: url };
}

// List (paginated)

export async function getUserLinks(
  userId: string,
  query: { page?: string; limit?: string; search?: string; sortBy?: string; order?: string }
): Promise<{ links: LinkDTO[]; pagination: PaginationMeta }> {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "15", 10) || 15));
  const search = (query.search ?? "").trim();
  const sortBy = query.sortBy === "clicks" ? "clicks" : "createdAt";
  const order = query.order === "asc" ? 1 : -1;

  await connectToDatabase();

  const filter: Record<string, unknown> = { userId };
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { shortCode: { $regex: escaped, $options: "i" } },
      { url: { $regex: escaped, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    UrlModel.find(filter).sort({ [sortBy]: order }).skip((page - 1) * limit).limit(limit).lean(),
    UrlModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    links: docs.map(toDTO),
    pagination: { total, page, limit, totalPages, hasMore: page < totalPages },
  };
}

// Update

export async function updateLink(
  id: string,
  url: string,
  customSlug: string | undefined,
  userId: string
): Promise<UpdateResult> {
  await connectToDatabase();

  const link = await UrlModel.findOne({ _id: id, userId });
  if (!link) return { status: 404, message: "Link not found or access denied." };

  let updatedShortCode = link.shortCode;

  if (customSlug && customSlug !== link.shortCode) {
    if (!CUSTOM_SLUG_RE.test(customSlug))
      return { status: 400, message: "Custom alias must be 3–50 characters (letters, numbers, hyphens only)." };

    if (await UrlModel.findOne({ shortCode: customSlug, _id: { $ne: id } }))
      return { status: 409, message: "This custom alias is already taken. Please choose another." };

    await Promise.all([
      redis.del(`url:${link.shortCode}`).catch(() => {}),
      redis.del(`slug:taken:${link.shortCode}`).catch(() => {}),
      redis.setex(`url:${customSlug}`, URL_TTL_SECONDS, url),
      redis.set(`slug:taken:${customSlug}`, "1").catch(() => {}),
    ]);

    updatedShortCode = customSlug;
  } else {
    await redis.setex(`url:${link.shortCode}`, URL_TTL_SECONDS, url);
  }

  link.url = url;
  link.shortCode = updatedShortCode;
  await link.save();

  return { message: "Link updated successfully", link: toDTO(link) };
}

// Delete

export async function deleteLink(id: string, userId: string): Promise<DeleteResult> {
  await connectToDatabase();

  const link = await UrlModel.findOneAndDelete({ _id: id, userId });
  if (!link) return { status: 404, message: "Link not found or access denied." };

  await Promise.all([
    redis.del(`url:${link.shortCode}`).catch(() => {}),
    redis.del(`slug:taken:${link.shortCode}`).catch(() => {}),
  ]);

  return { message: "Link deleted successfully", id };
}
