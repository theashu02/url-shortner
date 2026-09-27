export interface IpResolverConfig {
  behindCloudflare?: boolean;
  trustedProxyCount?: number;
}

export function getClientIp(
  headers: Headers,
  config: IpResolverConfig = {},
): string | null {
  const { behindCloudflare = false, trustedProxyCount = 0 } = config;

  if (behindCloudflare) {
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  }

  if (trustedProxyCount > 0) {
    const xff = headers.get("x-forwarded-for");
    if (xff) {
      const chain = xff.split(",").map((ip) => ip.trim()).filter(Boolean);
      const index = chain.length - trustedProxyCount;
      if (index >= 0) return chain[index];
    }

    const xRealIp = headers.get("x-real-ip");
    if (xRealIp) return xRealIp.trim();
  }

  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  return headers.get("x-real-ip")?.trim() ?? null;
}

export function isPrivateOrInvalidIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (ip.startsWith("fc00:") || ip.startsWith("fe80:")) return true;
  return false;
}
