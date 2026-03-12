import sharp from "sharp";

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
];

export function isImageMime(mimetype: string): boolean {
  return IMAGE_MIME_TYPES.includes(mimetype.toLowerCase());
}

export async function optimizeImage(
  buffer: Buffer,
  mimetype: string,
): Promise<{ buffer: Buffer; mimetype: string; extension: string }> {
  if (!isImageMime(mimetype)) {
    return { buffer, mimetype, extension: "" };
  }

  const optimized = await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer();

  return {
    buffer: optimized,
    mimetype: "image/webp",
    extension: ".webp",
  };
}
