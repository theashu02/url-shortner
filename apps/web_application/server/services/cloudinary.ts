import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "url-shortener-profiles" }, (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error("No result from Cloudinary"));
      })
      .end(buffer);
  });
}

export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    if (!url.includes("cloudinary.com")) return;

    const parts = url.split("/");
    const filename = parts.pop();
    const folder = parts.pop();
    
    if (!filename || !folder) return;

    const publicId = filename.split(".")[0];
    const fullPublicId = `${folder}/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error("Failed to delete old image from Cloudinary:", error);
  }
}
