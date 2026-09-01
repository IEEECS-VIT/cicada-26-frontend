import { supabase } from "../lib/supabase";

const BUCKET = "assets";

const typeFromMime = (mime = "") => {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  return "file";
};

export async function uploadChallengeAsset(file) {
  const filePath = `uploads/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: true });

  if (error) throw new Error("Upload failed: " + error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return {
    type: typeFromMime(file.type),
    name: file.name,
    url: data.publicUrl,
  };
}

export const getStoredObjectPath = (assetUrl = "") => {
  try {
    const url = new URL(assetUrl);
    const marker = "/storage/v1/object/public/assets/";
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
    return path || null;
  } catch {
    return null;
  }
};
