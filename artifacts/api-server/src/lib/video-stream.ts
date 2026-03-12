import { Router, type Request, type Response } from "express";
import { firebaseStorage } from "@workspace/db";

const router = Router();

router.get("/stream/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename;

  if (!filename || /[^a-zA-Z0-9._-]/.test(filename)) {
    res.status(400).json({ message: "Invalid filename" });
    return;
  }

  const ext = filename.split(".").pop()?.toLowerCase();
  const allowedTypes: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",
  };
  const contentType = ext ? allowedTypes[ext] : undefined;
  if (!contentType) {
    res.status(403).json({ message: "File type not allowed for streaming" });
    return;
  }

  try {
    const bucket = firebaseStorage.bucket();
    const file = bucket.file(`videos/${filename}`);
    const [exists] = await file.exists();
    if (!exists) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    const [metadata] = await file.getMetadata();
    const fileSize = Number(metadata.size) || 0;
    const range = req.headers.range;

    if (range) {
      const rangeMatch = range.match(/^bytes=(\d+)-(\d*)$/);
      if (!rangeMatch) {
        res.status(416).set("Content-Range", `bytes */${fileSize}`).end();
        return;
      }

      const start = parseInt(rangeMatch[1], 10);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fileSize - 1;

      if (start < 0 || start >= fileSize || end >= fileSize || start > end) {
        res.status(416).set("Content-Range", `bytes */${fileSize}`).end();
        return;
      }

      const chunkSize = end - start + 1;
      const stream = file.createReadStream({ start, end });

      stream.on("error", () => {
        if (!res.headersSent) {
          res.status(500).json({ message: "Stream error" });
        }
        stream.destroy();
      });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });
      stream.pipe(res);
    } else {
      const stream = file.createReadStream();

      stream.on("error", () => {
        if (!res.headersSent) {
          res.status(500).json({ message: "Stream error" });
        }
        stream.destroy();
      });

      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      });
      stream.pipe(res);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to stream file" });
    }
  }
});

export default router;
