import { API_BASE_URL } from "@/lib/api/config";

export function resolveApiImageUrl(url?: string | null) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/([^:]\/)\/+/g, "$1");
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}
