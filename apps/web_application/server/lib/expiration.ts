import { URL_TTL_SECONDS } from "./url";

export function calculateRedisTTL(expiresAtIso?: string | null): number {
  if (!expiresAtIso) return URL_TTL_SECONDS;

  const expirationDate = new Date(expiresAtIso);
  
  if (isNaN(expirationDate.getTime())) {
    return URL_TTL_SECONDS;
  }

  const now = new Date();
  
  if (expirationDate <= now) {
    return 0;
  }

  const secondsUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);

  return Math.min(URL_TTL_SECONDS, secondsUntilExpiration);
}
