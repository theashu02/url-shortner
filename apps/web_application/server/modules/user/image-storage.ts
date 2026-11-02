import { uploadImage, deleteImageByUrl } from "@/server/services/cloudinary";

/**
 * ISP/DIP: image storage seam. Cloudinary today, anything tomorrow (OCP/LSP).
 */
export interface IImageStorage {
  upload(file: File): Promise<string>;
  deleteByUrl(url: string): Promise<void>;
}

export class CloudinaryImageStorage implements IImageStorage {
  upload(file: File): Promise<string> {
    return uploadImage(file);
  }

  async deleteByUrl(url: string): Promise<void> {
    await deleteImageByUrl(url);
  }
}
