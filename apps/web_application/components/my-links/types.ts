export type LinkItem = {
  _id: string;
  shortCode: string;
  url: string;
  clicks: number;
  deviceCapture: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  __v?: number;
};