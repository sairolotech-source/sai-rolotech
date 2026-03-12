import { Router } from "express";
import multer from "multer";
import path from "path";
import { storage as db } from "../storage.js";
import { requireAdmin, requireAuth, requireSuperAdmin, requireAssemblyHead, requireEngineer } from "../auth.js";
import { z } from "zod";
import { optimizeImage, isImageMime } from "../lib/image-optimizer.js";
import { getLastCleanupStats } from "../lib/scheduler.js";
import { firebaseStorage } from "@workspace/db";
import webpush from "web-push";
import type { User } from "@workspace/db/schema";
import { publishToSocialMedia, isMetaConfigured } from "../meta-graph-api.js";
import crypto from "crypto";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function uploadToFirebaseStorage(buffer: Buffer, folder: string, fileName: string, mimetype: string): Promise<string> {
  const bucket = firebaseStorage.bucket();
  const filePath = `${folder}/${Date.now()}_${fileName}`;
  const file = bucket.file(filePath);
  await file.save(buffer, {
    metadata: { contentType: mimetype },
  });
  await file.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  return publicUrl;
}

router.post("/upload/:folder", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    const folder = req.params.folder || "uploads";

    let buffer = req.file.buffer;
    let mimetype = req.file.mimetype;
    let fileName = req.file.originalname;

    if (isImageMime(mimetype)) {
      const optimized = await optimizeImage(buffer, mimetype);
      buffer = optimized.buffer;
      mimetype = optimized.mimetype;
      const baseName = path.basename(fileName, path.extname(fileName));
      fileName = baseName + optimized.extension;
    }

    const url = await uploadToFirebaseStorage(buffer, folder, fileName, mimetype);
    return res.json({ url, fileName });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/settings", async (req, res) => {
  try {
    let settings = await db.getSettings();
    if (!settings) {
      settings = await db.upsertAppSettings({});
    }
    const { metaAccessToken, metaPageId, metaInstagramAccountId, assistantPin, ...publicSettings } = settings;
    return res.json(publicSettings);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await db.upsertAppSettings(req.body);
    const { metaAccessToken, metaPageId, metaInstagramAccountId, assistantPin, ...safeSettings } = settings;
    return res.json(safeSettings);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const isUsed = req.query.used === "true" ? true : req.query.used === "false" ? false : undefined;
    const products = await db.getProducts(isUsed);
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await db.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/products", requireAdmin, async (req, res) => {
  try {
    const product = await db.createProduct(req.body);
    return res.status(201).json(product);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await db.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/dealers", async (req, res) => {
  try {
    const dealers = await db.getDealers();
    return res.json(dealers);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/dealers", requireAdmin, async (req, res) => {
  try {
    const dealer = await db.createDealer(req.body);
    return res.status(201).json(dealer);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/dealers/:id", requireAdmin, async (req, res) => {
  try {
    const dealer = await db.updateDealer(req.params.id, req.body);
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });
    return res.json(dealer);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/dealers/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteDealer(req.params.id);
    if (!ok) return res.status(404).json({ message: "Dealer not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/operators", requireAdmin, async (req, res) => {
  try {
    const ops = await db.getOperators();
    return res.json(ops);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/operators", async (req, res) => {
  try {
    const op = await db.createOperator(req.body);
    return res.status(201).json(op);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const posts = await db.getPosts();
    const total = posts.length;
    const paginated = posts.slice((page - 1) * limit, page * limit);
    return res.json({ posts: paginated, total, page, limit, hasMore: page * limit < total });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/posts", requireAdmin, async (req, res) => {
  try {
    const posts = await db.getAllPosts();
    return res.json(posts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/posts", requireAdmin, uploadMedia.single("media"), async (req, res) => {
  try {
    const user = req.user!;
    const { caption, youtubeUrl, author, type, images: imageUrls } = req.body;
    if (!caption) {
      return res.status(400).json({ message: "Caption is required" });
    }
    let images: string[] | null = null;
    let videoUrl: string | null = null;
    let mediaType: string = "photo";

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video/");
      const isImage = isImageMime(req.file.mimetype) || req.file.mimetype.startsWith("image/");
      if (!isVideo && !isImage) {
        return res.status(400).json({ message: "Only image or video files are allowed" });
      }
      if (isVideo) {
        const allowedVideoTypes = ["video/mp4", "video/webm"];
        if (!allowedVideoTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ message: "Only MP4 and WebM video formats are allowed" });
        }
        if (req.file.size > 50 * 1024 * 1024) {
          return res.status(400).json({ message: "Video file size must be under 50MB" });
        }
        const url = await uploadToFirebaseStorage(req.file.buffer, "posts/videos", req.file.originalname, req.file.mimetype);
        videoUrl = url;
        mediaType = "video";
      } else if (isImage) {
        if (req.file.size > 10 * 1024 * 1024) {
          return res.status(400).json({ message: "Image file size must be under 10MB" });
        }
        let buffer = req.file.buffer;
        let mimetype = req.file.mimetype;
        let fileName = req.file.originalname;
        if (isImageMime(mimetype)) {
          const optimized = await optimizeImage(buffer, mimetype);
          buffer = optimized.buffer;
          mimetype = optimized.mimetype;
          fileName = path.basename(fileName, path.extname(fileName)) + optimized.extension;
        }
        const url = await uploadToFirebaseStorage(buffer, "posts", fileName, mimetype);
        images = [url];
        mediaType = "photo";
      }
    } else if (imageUrls) {
      const parsed = typeof imageUrls === "string" ? imageUrls.split(",").map((s: string) => s.trim()).filter(Boolean) : imageUrls;
      if (parsed.length > 0) {
        images = parsed;
        mediaType = "photo";
      }
    }

    if (youtubeUrl) {
      mediaType = "youtube";
    }

    const post = await db.createPost({
      type: type || (videoUrl ? "video" : youtubeUrl ? "video" : "image"),
      caption,
      author: author || "Sai Rolotech Official",
      userId: user.id,
      likes: 0,
      isApproved: true,
      images,
      videoUrl,
      youtubeUrl: youtubeUrl || null,
      mediaType,
      isAdminPost: true,
    });
    return res.status(201).json(post);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/posts", requireAuth, uploadMedia.single("media"), async (req, res) => {
  try {
    const user = req.user!;
    if (user.isFrozen) {
      return res.status(403).json({ message: "Your account is frozen. You cannot create posts." });
    }
    if (user.machineSpecialization === "roll_forming") {
      return res.status(403).json({ message: "Roll forming machine users cannot create posts." });
    }
    const { caption, youtubeUrl } = req.body;
    if (!caption) {
      return res.status(400).json({ message: "Caption is required" });
    }
    let images: string[] | undefined;
    let videoUrl: string | undefined;
    let mediaType: string = "photo";
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video/");
      const isImage = isImageMime(req.file.mimetype) || req.file.mimetype.startsWith("image/");
      if (!isVideo && !isImage) {
        return res.status(400).json({ message: "Only image or video files are allowed" });
      }
      if (isVideo) {
        const allowedVideoTypes = ["video/mp4", "video/webm"];
        if (!allowedVideoTypes.includes(req.file.mimetype)) {
          return res.status(400).json({ message: "Only MP4 and WebM video formats are allowed" });
        }
        if (req.file.size > 50 * 1024 * 1024) {
          return res.status(400).json({ message: "Video file size must be under 50MB" });
        }
        const url = await uploadToFirebaseStorage(req.file.buffer, "posts/videos", req.file.originalname, req.file.mimetype);
        videoUrl = url;
        mediaType = "video";
      } else {
        if (req.file.size > 10 * 1024 * 1024) {
          return res.status(400).json({ message: "Image file size must be under 10MB" });
        }
        let buffer = req.file.buffer;
        let mimetype = req.file.mimetype;
        let fileName = req.file.originalname;
        if (isImageMime(mimetype)) {
          const optimized = await optimizeImage(buffer, mimetype);
          buffer = optimized.buffer;
          mimetype = optimized.mimetype;
          fileName = path.basename(fileName, path.extname(fileName)) + optimized.extension;
        }
        const url = await uploadToFirebaseStorage(buffer, "posts", fileName, mimetype);
        images = [url];
        mediaType = "photo";
      }
    }
    if (youtubeUrl) {
      mediaType = "youtube";
    }
    if (!images && !youtubeUrl && !videoUrl) {
      return res.status(400).json({ message: "Please upload a photo, video, or paste a YouTube link" });
    }
    const post = await db.createPost({
      type: videoUrl ? "video" : youtubeUrl ? "video" : "image",
      caption,
      author: user.name,
      userId: user.id,
      likes: 0,
      isApproved: true,
      images: images || null,
      videoUrl: videoUrl || null,
      youtubeUrl: youtubeUrl || null,
      mediaType,
      isAdminPost: false,
    });
    return res.status(201).json(post);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/posts/:id/like", async (req, res) => {
  try {
    const post = await db.likePost(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/posts/:id/report", requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const postId = req.params.id;
    const post = await db.getPostById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const existingReport = await db.getPostReport(postId, user.id);
    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this post" });
    }
    await db.createPostReport({ postId, reporterUserId: user.id });
    const updatedPost = await db.incrementPostReportCount(postId);
    if (updatedPost && (updatedPost.reportCount || 0) >= 3) {
      const deleted = await db.deletePost(postId);
      if (deleted && updatedPost.userId) {
        const author = await db.incrementUserWarning(updatedPost.userId);
        if (author && (author.warningCount || 0) >= 3) {
          await db.freezeUser(updatedPost.userId);
        }
      }
      return res.json({ message: "Post removed due to multiple reports", deleted: true });
    }
    return res.json({ message: "Report submitted", deleted: false });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/moderation/reported-posts", requireAdmin, async (req, res) => {
  try {
    const reportedPosts = await db.getReportedPosts();
    return res.json(reportedPosts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/moderation/warned-users", requireAdmin, async (req, res) => {
  try {
    const warnedUsers = await db.getUsersWithWarnings();
    return res.json(warnedUsers);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/moderation/frozen-users", requireAdmin, async (req, res) => {
  try {
    const frozenUsers = await db.getFrozenUsers();
    return res.json(frozenUsers);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/moderation/unfreeze/:userId", requireAdmin, async (req, res) => {
  try {
    const user = await db.unfreezeUser(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User unfrozen", user });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/posts/:id", requireAdmin, async (req, res) => {
  try {
    const post = await db.updatePost(req.params.id, req.body);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/posts/:id", requireAdmin, async (req, res) => {
  try {
    const post = await db.updatePost(req.params.id, req.body);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/posts/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deletePost(req.params.id);
    if (!ok) return res.status(404).json({ message: "Post not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/posts/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deletePost(req.params.id);
    if (!ok) return res.status(404).json({ message: "Post not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/leads", requireAdmin, async (req, res) => {
  try {
    const { status, stop } = req.query;
    if (stop === "true") return res.json(await db.getStopList());
    if (status) return res.json(await db.getLeadsByStatus(status as string));
    return res.json(await db.getLeads());
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/leads/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await db.getLeadStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/leads/today", requireAdmin, async (req, res) => {
  try {
    const leads = await db.getTodayFollowups();
    return res.json(leads);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/leads/:id", requireAdmin, async (req, res) => {
  try {
    const lead = await db.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    return res.json(lead);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/leads", requireAdmin, async (req, res) => {
  try {
    const lead = await db.createLead(req.body);
    try {
      await db.autoCreateRemindersForLead(lead);
    } catch (reminderErr) {
      console.error("Failed to auto-create reminders:", reminderErr);
    }
    return res.status(201).json(lead);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/leads/:id", requireAdmin, async (req, res) => {
  try {
    const oldLead = await db.getLeadById(req.params.id);
    if (!oldLead) return res.status(404).json({ message: "Lead not found" });

    const lead = await db.updateLead(req.params.id, req.body);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const newStatus = req.body.status ?? oldLead.status;
    const newIsStop = req.body.isStopList ?? oldLead.isStopList;

    try {
      if (newIsStop || newStatus === "STOP") {
        await db.deletePendingRemindersByLeadId(req.params.id);
      } else if (newStatus === "HOT" && oldLead.status !== "HOT") {
        await db.switchToHotSchedule(req.params.id);
      } else if (oldLead.isStopList && !newIsStop) {
        await db.autoCreateRemindersForLead(lead);
      }
    } catch (reminderErr) {
      console.error("Failed to update reminders on status change:", reminderErr);
    }

    return res.json(lead);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/leads/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteLead(req.params.id);
    if (!ok) return res.status(404).json({ message: "Lead not found" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/reminders", requireAdmin, async (req, res) => {
  try {
    const { leadId } = req.query;
    const reminders = await db.getFollowupReminders(leadId as string | undefined);
    return res.json(reminders);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/reminders", requireAdmin, async (req, res) => {
  try {
    const reminder = await db.createFollowupReminder(req.body);
    return res.status(201).json(reminder);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/reminders/:id/complete", requireAdmin, async (req, res) => {
  try {
    const reminder = await db.completeFollowupReminder(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    return res.json(reminder);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/reminders/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteFollowupReminder(req.params.id);
    if (!ok) return res.status(404).json({ message: "Reminder not found" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/lead-scoring", requireAdmin, async (req, res) => {
  try {
    const scorings = await db.getAllLeadScorings();
    return res.json(scorings);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/lead-scoring", requireAdmin, async (req, res) => {
  try {
    const scoring = await db.upsertLeadScoring(req.body);
    return res.json(scoring);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/service-requests", requireAdmin, async (req, res) => {
  try {
    const reqs = await db.getServiceRequests();
    return res.json(reqs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/service-requests", async (req, res) => {
  try {
    const req2 = await db.createServiceRequest(req.body);
    return res.status(201).json(req2);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/service-requests/:id/status", requireAdmin, async (req, res) => {
  try {
    const sr = await db.updateServiceRequestStatus(req.params.id, req.body.status);
    if (!sr) return res.status(404).json({ message: "Not found" });
    return res.json(sr);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/subsidies", async (req, res) => {
  try {
    const subs = await db.getSubsidies();
    return res.json(subs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/subsidies", requireAdmin, async (req, res) => {
  try {
    const sub = await db.createSubsidy(req.body);
    return res.status(201).json(sub);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/spare-parts", async (req, res) => {
  try {
    const parts = await db.getSpareParts();
    return res.json(parts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/appointments", requireAdmin, async (req, res) => {
  try {
    const appts = await db.getAppointments();
    return res.json(appts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/appointments", async (req, res) => {
  try {
    const appt = await db.createAppointment(req.body);
    return res.status(201).json(appt);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/appointments/:id", requireAdmin, async (req, res) => {
  try {
    const appt = await db.updateAppointment(req.params.id, req.body);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    return res.json(appt);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/suppliers", async (req, res) => {
  try {
    const state = req.query.state as string | undefined;
    const suppliers = await db.getSuppliers(state);
    return res.json(suppliers);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/suppliers/:id", async (req, res) => {
  try {
    const supplier = await db.getSupplier(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    return res.json(supplier);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/suppliers", requireAuth, async (req, res) => {
  try {
    const supplier = await db.createSupplier(req.body);
    return res.status(201).json(supplier);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/suppliers/:id", requireAdmin, async (req, res) => {
  try {
    const supplier = await db.updateSupplier(req.params.id, req.body);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    return res.json(supplier);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/suppliers/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteSupplier(req.params.id);
    if (!ok) return res.status(404).json({ message: "Supplier not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/suppliers/:id/reviews", async (req, res) => {
  try {
    const revs = await db.getReviewsForSupplier(req.params.id);
    return res.json(revs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const review = await db.createReview(req.body);
    return res.status(201).json(review);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/suppliers/:id/reviews", async (req, res) => {
  try {
    const review = await db.createReview({ ...req.body, supplierId: req.params.id });
    return res.status(201).json(review);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/reviews/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteReview(req.params.id);
    if (!ok) return res.status(404).json({ message: "Review not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/support-tickets", async (req, res) => {
  try {
    const tickets = await db.getSupportTickets();
    return res.json(tickets);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/support-tickets/:id", async (req, res) => {
  try {
    const ticket = await db.getSupportTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.json(ticket);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/support-tickets", async (req, res) => {
  try {
    const ticket = await db.createSupportTicket(req.body);
    return res.status(201).json(ticket);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/support-tickets/:id", requireAdmin, async (req, res) => {
  try {
    const ticket = await db.updateSupportTicket(req.params.id, req.body);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.json(ticket);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/amc-plans", async (req, res) => {
  try {
    const plans = await db.getAmcPlans();
    return res.json(plans);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/amc-plans", requireAdmin, async (req, res) => {
  try {
    const plan = await db.createAmcPlan(req.body);
    return res.status(201).json(plan);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/amc-plans/:id", requireAdmin, async (req, res) => {
  try {
    const plan = await db.updateAmcPlan(req.params.id, req.body);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.json(plan);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/amc-plans/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteAmcPlan(req.params.id);
    if (!ok) return res.status(404).json({ message: "Plan not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/amc-subscriptions", requireAdmin, async (req, res) => {
  try {
    const subs = await db.getAmcSubscriptions();
    return res.json(subs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/amc-subscriptions", async (req, res) => {
  try {
    const sub = await db.createAmcSubscription(req.body);
    return res.status(201).json(sub);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/amc-subscriptions/:id", requireAdmin, async (req, res) => {
  try {
    const sub = await db.updateAmcSubscription(req.params.id, req.body);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    return res.json(sub);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/documents", async (req, res) => {
  try {
    const docs = await db.getMachineDocuments();
    return res.json(docs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/documents", requireAdmin, async (req, res) => {
  try {
    const doc = await db.createMachineDocument(req.body);
    return res.status(201).json(doc);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/documents/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteMachineDocument(req.params.id);
    if (!ok) return res.status(404).json({ message: "Document not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/inspections", requireAdmin, async (req, res) => {
  try {
    const insps = await db.getInspections();
    return res.json(insps);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/inspections", requireAdmin, async (req, res) => {
  try {
    const insp = await db.createInspection(req.body);
    return res.status(201).json(insp);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/inspections/:id", requireAdmin, async (req, res) => {
  try {
    const insp = await db.updateInspection(req.params.id, req.body);
    if (!insp) return res.status(404).json({ message: "Inspection not found" });
    return res.json(insp);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/iso-documents", requireAdmin, async (req, res) => {
  try {
    const docs = await db.getIsoDocuments();
    return res.json(docs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/iso-documents", requireAdmin, async (req, res) => {
  try {
    const doc = await db.createIsoDocument(req.body);
    return res.status(201).json(doc);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/iso-documents/:id", requireAdmin, async (req, res) => {
  try {
    const doc = await db.updateIsoDocument(req.params.id, req.body);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    return res.json(doc);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/iso-documents/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteIsoDocument(req.params.id);
    if (!ok) return res.status(404).json({ message: "Document not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/iso-audits", requireAdmin, async (req, res) => {
  try {
    const audits = await db.getIsoAudits();
    return res.json(audits);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/iso-audits", requireAdmin, async (req, res) => {
  try {
    const audit = await db.createIsoAudit(req.body);
    return res.status(201).json(audit);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/iso-audits/:id", requireAdmin, async (req, res) => {
  try {
    const audit = await db.updateIsoAudit(req.params.id, req.body);
    if (!audit) return res.status(404).json({ message: "Audit not found" });
    return res.json(audit);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/capas", requireAdmin, async (req, res) => {
  try {
    const capas = await db.getCapas();
    return res.json(capas);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/capas", requireAdmin, async (req, res) => {
  try {
    const capa = await db.createCapa(req.body);
    return res.status(201).json(capa);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/capas/:id", requireAdmin, async (req, res) => {
  try {
    const capa = await db.updateCapa(req.params.id, req.body);
    if (!capa) return res.status(404).json({ message: "CAPA not found" });
    return res.json(capa);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/quotations", requireAdmin, async (req, res) => {
  try {
    const qs = await db.getQuotations();
    return res.json(qs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/quotations/access/:code", async (req, res) => {
  try {
    const q = await db.getQuotationByAccessCode(req.params.code);
    if (!q) return res.status(404).json({ message: "Quotation not found" });
    await db.updateQuotation(q.id, { viewedAt: new Date() });
    return res.json(q);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/quotations", requireAdmin, async (req, res) => {
  try {
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const settings = await db.getSettings();
    const discountThreshold = settings?.approvalDiscountThreshold ?? 10;
    const priceThreshold = settings?.approvalPriceThreshold ?? 500000;

    let approvalStatus: string | null = null;
    let flaggedReason: string | null = null;
    const discountPct = parseFloat(req.body.discountPercent || "0");
    const grandTotal = req.body.grandTotal || 0;

    if (discountPct > discountThreshold) {
      approvalStatus = "pending_approval";
      flaggedReason = `Discount ${discountPct}% exceeds threshold of ${discountThreshold}%`;
    } else if (grandTotal > priceThreshold) {
      approvalStatus = "pending_approval";
      flaggedReason = `Total ₹${grandTotal.toLocaleString("en-IN")} exceeds threshold of ₹${priceThreshold.toLocaleString("en-IN")}`;
    }

    const q = await db.createQuotation({
      ...req.body,
      accessCode,
      approvalStatus,
      flaggedReason,
      approvalNote: null,
    });
    return res.status(201).json(q);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/quotations/:id", requireAdmin, async (req, res) => {
  try {
    const q = await db.updateQuotation(req.params.id, req.body);
    if (!q) return res.status(404).json({ message: "Quotation not found" });
    return res.json(q);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/market-prices", async (req, res) => {
  try {
    const prices = await db.getMarketPrices();
    return res.json(prices);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/market-prices", requireAdmin, async (req, res) => {
  try {
    const price = await db.createMarketPrice(req.body);
    return res.status(201).json(price);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/market-prices/:id", requireAdmin, async (req, res) => {
  try {
    const price = await db.updateMarketPrice(req.params.id, req.body);
    if (!price) return res.status(404).json({ message: "Price not found" });
    return res.json(price);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/market-prices/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteMarketPrice(req.params.id);
    if (!ok) return res.status(404).json({ message: "Price not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/machine-health", async (req, res) => {
  try {
    const hcs = await db.getHealthChecks();
    return res.json(hcs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/machine-health", async (req, res) => {
  try {
    const hc = await db.createHealthCheck(req.body);
    return res.status(201).json(hc);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/quote-comparisons", requireAdmin, async (req, res) => {
  try {
    const comps = await db.getQuotationComparisons();
    return res.json(comps);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/quote-comparisons", async (req, res) => {
  try {
    const comp = await db.createQuotationComparison(req.body);
    return res.status(201).json(comp);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/banners", async (req, res) => {
  try {
    const banners = await db.getBanners();
    return res.json(banners);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/banners", requireAdmin, async (req, res) => {
  try {
    const banner = await db.createBanner(req.body);
    return res.status(201).json(banner);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/banners/:id", requireAdmin, async (req, res) => {
  try {
    const banner = await db.updateBanner(req.params.id, req.body);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    return res.json(banner);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/banners/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteBanner(req.params.id);
    if (!ok) return res.status(404).json({ message: "Banner not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.getUsers();
    const safe = allUsers.map(({ password, twoFactorSecret, ...u }) => u);
    return res.json(safe);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const oldUser = await db.getUserById(req.params.id);
    const user = await db.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });

    const adminUser = req.user as User;
    if (oldUser && req.body.role && oldUser.role !== req.body.role) {
      try {
        await db.createAuditLog({
          eventType: "role_changed",
          userId: adminUser?.id,
          username: adminUser?.username,
          ip: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "unknown",
          metadata: { targetUserId: req.params.id, targetUsername: user.username, oldRole: oldUser.role, newRole: req.body.role },
        });
      } catch (e) {}
    }

    const { password, twoFactorSecret, ...safe } = user;
    return res.json(safe);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const targetUser = await db.getUserById(req.params.id);
    const ok = await db.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ message: "User not found" });

    const adminUser = req.user as User;
    try {
      await db.createAuditLog({
        eventType: "user_deleted",
        userId: adminUser?.id,
        username: adminUser?.username,
        ip: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "unknown",
        metadata: { deletedUserId: req.params.id, deletedUsername: targetUser?.username },
      });
    } catch (e) {}

    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/consent", requireAuth, async (req, res) => {
  try {
    const consents = await db.getUserConsents(req.user!.id);
    return res.json(consents);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/consent", requireAuth, async (req, res) => {
  try {
    const { consents } = req.body;
    if (!Array.isArray(consents)) {
      return res.status(400).json({ message: "consents array required" });
    }
    const validCategories = ["push_notifications", "marketing", "analytics"];
    const validStatuses = ["accepted", "declined", "withdrawn"];
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const results = [];
    for (const c of consents) {
      if (!validCategories.includes(c.category)) {
        return res.status(400).json({ message: `Invalid category: ${c.category}` });
      }
      if (!validStatuses.includes(c.status)) {
        return res.status(400).json({ message: `Invalid status: ${c.status}` });
      }
      const consent = await db.upsertUserConsent({
        userId: req.user!.id,
        category: c.category,
        status: c.status,
        ip: typeof ip === "string" ? ip : ip[0],
        consentVersion: c.consentVersion || "1.0",
      });
      results.push(consent);

      if (c.category === "push_notifications" && (c.status === "declined" || c.status === "withdrawn")) {
        await db.deleteNotificationSubscription(req.user!.id);
      }
    }
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/consent", requireAuth, async (req, res) => {
  try {
    const { category, status } = req.body;
    const validCategories = ["push_notifications", "marketing", "analytics"];
    const validStatuses = ["accepted", "declined", "withdrawn"];
    if (!category || !status) {
      return res.status(400).json({ message: "category and status required" });
    }
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: `Invalid category: ${category}` });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const consent = await db.upsertUserConsent({
      userId: req.user!.id,
      category,
      status,
      ip: typeof ip === "string" ? ip : ip[0],
      consentVersion: req.body.consentVersion || "1.0",
    });
    if (status === "withdrawn" && category === "push_notifications") {
      await db.deleteNotificationSubscription(req.user!.id);
    }
    return res.json(consent);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/push-subscribe", requireAuth, async (req, res) => {
  try {
    const consents = await db.getUserConsents(req.user!.id);
    const pushConsent = consents.find(c => c.category === "push_notifications" && c.status === "accepted");
    if (!pushConsent) {
      return res.status(403).json({ message: "Push notification consent required" });
    }
    const { endpoint, p256dh, auth } = req.body;
    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({ message: "endpoint, p256dh, and auth required" });
    }
    if (typeof endpoint !== "string" || typeof p256dh !== "string" || typeof auth !== "string") {
      return res.status(400).json({ message: "endpoint, p256dh, and auth must be strings" });
    }
    if (endpoint.length > 2048 || p256dh.length > 512 || auth.length > 512) {
      return res.status(400).json({ message: "Subscription data exceeds maximum length" });
    }
    if (!endpoint.startsWith("https://")) {
      return res.status(400).json({ message: "Push endpoint must use HTTPS" });
    }
    const sub = await db.upsertNotificationSubscription({
      userId: req.user!.id,
      endpoint,
      p256dh,
      auth,
    });
    return res.json(sub);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/push-subscribe", requireAuth, async (req, res) => {
  try {
    await db.deleteNotificationSubscription(req.user!.id);
    return res.json({ message: "Unsubscribed" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/consent-stats", requireAdmin, async (req, res) => {
  try {
    const stats = await db.getConsentStats();
    const recent = await db.getRecentConsentActivity(20);
    return res.json({ stats, recent });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/consents/export", requireAdmin, async (req, res) => {
  try {
    const consents = await db.getAllConsents();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=consent-records.json");
    return res.json(consents);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/send-notification", requireAdmin, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "title and body required" });
    }
    if (typeof title !== "string" || typeof body !== "string") {
      return res.status(400).json({ message: "title and body must be strings" });
    }
    if (title.length > 200 || body.length > 1000) {
      return res.status(400).json({ message: "title max 200 chars, body max 1000 chars" });
    }
    const subs = await db.getOptedInPushSubscriptions();
    if (subs.length === 0) {
      return res.json({ message: "No opted-in subscribers found", count: 0, sent: 0, failed: 0 });
    }

    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPublic || !vapidPrivate) {
      return res.json({ message: `VAPID keys not configured. ${subs.length} subscriber(s) found but notifications cannot be sent without VAPID keys.`, count: subs.length, sent: 0, failed: 0 });
    }

    webpush.setVapidDetails("mailto:sairolotech@gmail.com", vapidPublic, vapidPrivate);
    const payload = JSON.stringify({ title, body, url: "/" });
    let sent = 0;
    let failed = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload);
        sent++;
      } catch (pushErr: any) {
        console.error("Push send failed for user", sub.userId, pushErr.statusCode || pushErr.message);
        failed++;
        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          await db.deleteNotificationSubscription(sub.userId);
        }
      }
    }
    return res.json({ message: `Sent ${sent}, failed ${failed} of ${subs.length} subscriber(s)`, count: subs.length, sent, failed });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

let visitorCount = 0;
let todayVisitors = 0;
let lastResetDate = new Date().toDateString();

router.get("/visitor-count", (req, res) => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    todayVisitors = 0;
    lastResetDate = today;
  }
  visitorCount++;
  todayVisitors++;
  return res.json({ total_visits: visitorCount, today_visits: todayVisitors });
});

router.post("/leads/pabbly-webhook", async (req, res) => {
  try {
    const webhookSecret = process.env.PABBLY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = req.headers["x-webhook-secret"] || req.body._webhook_secret;
      if (providedSecret !== webhookSecret) {
        return res.status(401).json({ message: "Invalid webhook secret" });
      }
    }
    const { name, phone, source, message, email, location, interest } = req.body;
    if (!name && !phone) {
      return res.status(400).json({ message: "At least name or phone is required" });
    }
    const lead = await db.createPabblyLead({
      name: name || "Unknown",
      phone: phone || "",
      source: source || "pabbly",
      message,
      email,
      location,
      interest,
    });
    return res.status(201).json({ success: true, leadId: lead.id });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/track/download", async (req, res) => {
  try {
    const platform = req.query.platform as string;
    if (platform !== "ios" && platform !== "android") {
      return res.status(400).json({ message: "platform must be 'ios' or 'android'" });
    }
    const counts = await db.incrementAppDownload(platform);
    return res.json(counts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/app-downloads", requireAdmin, async (_req, res) => {
  try {
    const counts = await db.getAppDownloads();
    return res.json(counts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/app-downloads", requireAdmin, async (req, res) => {
  try {
    const { ios, android } = req.body;
    const counts = await db.setAppDownloads(Number(ios) || 0, Number(android) || 0);
    return res.json(counts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/investments", requireAdmin, async (_req, res) => {
  try {
    const investments = await db.getInvestments();
    return res.json(investments);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/investments", requireAdmin, async (req, res) => {
  try {
    const { platform, amount, date, campaignName, notes } = req.body;
    if (!platform || !amount) {
      return res.status(400).json({ message: "Platform and amount are required" });
    }
    const investment = await db.createInvestment({
      platform,
      amount: Number(amount),
      date: date || new Date().toISOString().split("T")[0],
      campaignName,
      notes,
    });
    return res.status(201).json(investment);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/investments/:id", requireAdmin, async (req, res) => {
  try {
    const investment = await db.updateInvestment(req.params.id, req.body);
    if (!investment) return res.status(404).json({ message: "Investment not found" });
    return res.json(investment);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/investments/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteInvestment(req.params.id);
    if (!ok) return res.status(404).json({ message: "Investment not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/lead-analytics", requireAdmin, async (_req, res) => {
  try {
    const analytics = await db.getLeadAnalytics();
    return res.json(analytics);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/dashboard", requireAdmin, async (_req, res) => {
  try {
    const [products, leads, serviceRequests, appointments] = await Promise.all([
      db.getProducts(),
      db.getLeads(),
      db.getServiceRequests(),
      db.getAppointments(),
    ]);
    return res.json({
      totalProducts: products.length,
      totalLeads: leads.length,
      totalServiceRequests: serviceRequests.length,
      totalAppointments: appointments.length,
      pendingLeads: leads.filter((l: any) => l.status === "new").length,
      pendingServiceRequests: serviceRequests.filter((r: any) => r.status === "pending").length,
      pendingAppointments: appointments.filter((a: any) => a.status === "pending").length,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/analytics", requireAdmin, async (_req, res) => {
  try {
    const analytics = await db.getLeadAnalytics();
    const [quotations, tickets, appointments] = await Promise.all([
      db.getQuotations(),
      db.getSupportTickets(),
      db.getAppointments(),
    ]);

    const leadsByInterest: Record<string, number> = {};
    for (const l of analytics.recentLeads) {
      const src = l.source || l.interest || "direct";
      leadsByInterest[src] = (leadsByInterest[src] || 0) + 1;
    }

    return res.json({
      totalLeads: analytics.totalLeads,
      convertedLeads: analytics.convertedLeads,
      conversionRate: analytics.conversionRate,
      recentLeads7d: analytics.leadsThisWeek,
      leadsByInterest,
      totalQuotations: quotations.length,
      approvedQuotations: quotations.filter((q: any) => q.approvedAt).length,
      totalQuoteValue: quotations.reduce((sum: number, q: any) => sum + (Number(q.totalAmount) || 0), 0),
      approvedValue: quotations.filter((q: any) => q.approvedAt).reduce((sum: number, q: any) => sum + (Number(q.totalAmount) || 0), 0),
      totalTickets: tickets.length,
      openTickets: tickets.filter((t: any) => t.status === "open" || t.status === "pending").length,
      totalAppointments: appointments.length,
      completedVisits: appointments.filter((a: any) => a.status === "completed").length,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/leads", requireAdmin, async (_req, res) => {
  try {
    const leads = await db.getLeads();
    return res.json(leads);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/leads/:id", requireAdmin, async (req, res) => {
  try {
    const lead = await db.updateLead(req.params.id, req.body);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    return res.json(lead);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/system-health", requireAdmin, (_req, res) => {
  const stats = getLastCleanupStats();
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    lastCleanup: stats,
  });
});

const requireVendor: import("express").RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.role !== "vendor" && req.user.role !== "admin" && req.user.role !== "sub_admin") {
    return res.status(403).json({ message: "Vendor access required" });
  }
  next();
};

router.get("/admin/broadcast-posts", requireAdmin, async (req, res) => {
  try {
    const posts = await db.getBroadcastPosts();
    return res.json(posts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/manufacturers", async (_req, res) => {
  try {
    const list = await db.getManufacturers();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/engineer/machine-orders", requireEngineer, async (_req, res) => {
  try {
    const orders = await db.getMachineOrders();
    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

const broadcastCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  image: z.string().nullable().optional(),
  audience: z.enum(["all", "suppliers", "buyers"]).default("all"),
  postToSocialMedia: z.boolean().default(false),
  createdBy: z.string().optional(),
});

router.post("/admin/broadcast-posts", requireAdmin, async (req, res) => {
  try {
    const parsed = broadcastCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map(e => e.message).join(", ") });
    }
    const { title, message, image, audience, postToSocialMedia, createdBy } = parsed.data;
    const post = await db.createBroadcastPost({
      title,
      message,
      image: image || null,
      audience,
      postToSocialMedia,
      createdBy: createdBy || (req.user as any)?.name || "Admin",
    });

    const notifCount = await db.createBroadcastNotifications(post.id, audience);

    let socialResult = null;
    if (postToSocialMedia) {
      socialResult = await publishToSocialMedia(post.id, title, message, image);
    }

    const updatedPost = await db.getBroadcastPost(post.id);
    return res.status(201).json({
      ...updatedPost,
      notificationsDelivered: notifCount,
      socialMediaResult: socialResult,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/job-applications", async (req, res) => {
  try {
    const { jobTitle, jobCategory, applicantName, phone, experience } = req.body;
    if (!jobTitle || !jobCategory || !applicantName || !phone || !experience) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    const app = await db.createJobApplication({
      jobTitle,
      jobCategory,
      applicantName,
      phone,
      experience,
    });
    return res.status(201).json({ id: app.id, status: app.status });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/manufacturers/all", requireAdmin, async (_req, res) => {
  try {
    const list = await db.getAllManufacturers();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/manufacturers/:id", async (req, res) => {
  try {
    const m = await db.getManufacturer(req.params.id);
    if (!m) return res.status(404).json({ message: "Manufacturer not found" });
    return res.json(m);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/manufacturers", requireAdmin, async (req, res) => {
  try {
    const m = await db.createManufacturer(req.body);
    return res.status(201).json(m);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/manufacturers/:id", requireAdmin, async (req, res) => {
  try {
    const m = await db.updateManufacturer(req.params.id, req.body);
    if (!m) return res.status(404).json({ message: "Manufacturer not found" });
    return res.json(m);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/manufacturers/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteManufacturer(req.params.id);
    if (!ok) return res.status(404).json({ message: "Manufacturer not found" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/manufacturer-leads", async (req, res) => {
  try {
    const { name, phone, location, manufacturerId, manufacturerName } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "Name and phone are required" });
    const lead = await db.createLead({
      name,
      phone,
      location: location || null,
      interest: `Manufacturer Finder - ${manufacturerName || "Unknown"}`,
      source: "manufacturer_finder",
      status: "HOT",
      notes: `[NOTIFICATION] New lead from Near Me Manufacturer Finder. Factory contacted: ${manufacturerName || "N/A"} (ID: ${manufacturerId || "N/A"}). Buyer location: ${location || "Not provided"}.`,
    });
    try {
      await db.autoCreateRemindersForLead(lead);
    } catch (reminderErr) {
      console.error("Failed to auto-create reminders for manufacturer lead:", reminderErr);
    }
    console.log(`[Admin Notification] New manufacturer finder lead: ${name} (${phone}) contacted ${manufacturerName}`);
    return res.status(201).json(lead);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/manufacturers/seed", requireAdmin, async (_req, res) => {
  try {
    const seedData = [
      {
        name: "Sai Rolotech",
        city: "New Delhi",
        state: "Delhi",
        address: "Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi, Delhi 110041",
        latitude: "28.6836",
        longitude: "77.0266",
        products: ["Shutter Patti", "False Ceiling Channel", "POP Channel", "Gypsum Channel", "Door Frame", "Roofing Sheet"],
        materials: ["GI", "GP"],
        machineTypes: ["Roll Forming Machine", "Shutter Patti Machine", "False Ceiling Machine", "Roofing Sheet Machine"],
        productionCapacity: "500+ machines/year",
        contactPhone: "9090486262",
        contactEmail: "sairolotech@gmail.com",
        contactWhatsapp: "919090486262",
        description: "Leading manufacturer of roll forming machines including Shutter Patti, False Ceiling, POP Channel, Gypsum Channel, and Roofing Sheet machines. ISO certified with 10+ years of experience.",
        isActive: true,
      },
      {
        name: "Delhi Roll Form Industries",
        city: "Delhi",
        state: "Delhi",
        address: "Plot No. 45, Industrial Area, Bawana, Delhi 110039",
        latitude: "28.7990",
        longitude: "77.0510",
        products: ["Shutter Patti", "Roofing Sheet", "GP Coil"],
        materials: ["GI", "GP", "CR"],
        machineTypes: ["Roll Forming Machine", "Shutter Patti Machine"],
        productionCapacity: "200 machines/year",
        contactPhone: "9876543210",
        contactEmail: "delhirollform@example.com",
        description: "Manufacturer of roll forming machines and GP coil supplier based in Bawana industrial area.",
        isActive: true,
      },
      {
        name: "Haryana Steel Works",
        city: "Faridabad",
        state: "Haryana",
        address: "Sector 24, Faridabad Industrial Area, Haryana 121005",
        latitude: "28.4089",
        longitude: "77.3178",
        products: ["Roofing Sheet", "False Ceiling Channel", "GP Coil"],
        materials: ["GI", "GP"],
        machineTypes: ["Roofing Sheet Machine", "False Ceiling Machine"],
        productionCapacity: "300 machines/year",
        contactPhone: "9812345678",
        contactEmail: "haryanasteel@example.com",
        description: "Specialized in roofing sheet and false ceiling channel manufacturing machines.",
        isActive: true,
      },
      {
        name: "Punjab Machine Tools",
        city: "Ludhiana",
        state: "Punjab",
        address: "Industrial Area B, Ludhiana, Punjab 141003",
        latitude: "30.9010",
        longitude: "75.8573",
        products: ["Shutter Patti", "Door Frame", "GP Coil"],
        materials: ["GI", "GP", "CR"],
        machineTypes: ["Roll Forming Machine", "Shutter Patti Machine", "Door Frame Machine"],
        productionCapacity: "400 machines/year",
        contactPhone: "9855123456",
        contactEmail: "punjabmachine@example.com",
        description: "Leading Punjab-based manufacturer of shutter patti and door frame roll forming machines.",
        isActive: true,
      },
      {
        name: "Rajasthan Industrial Solutions",
        city: "Jaipur",
        state: "Rajasthan",
        address: "RIICO Industrial Area, Sitapura, Jaipur 302022",
        latitude: "26.8540",
        longitude: "75.8090",
        products: ["Roofing Sheet", "False Ceiling Channel", "Shutter Patti"],
        materials: ["GI", "GP"],
        machineTypes: ["Roofing Sheet Machine", "Roll Forming Machine"],
        productionCapacity: "150 machines/year",
        contactPhone: "9414567890",
        contactEmail: "rajasthanindustrial@example.com",
        description: "Jaipur-based manufacturer specializing in roofing sheet and ceiling channel machines.",
        isActive: true,
      },
      {
        name: "UP Roll Forming Co.",
        city: "Noida",
        state: "Uttar Pradesh",
        address: "Sector 63, Noida, UP 201301",
        latitude: "28.6270",
        longitude: "77.3750",
        products: ["Shutter Patti", "POP Channel", "Gypsum Channel"],
        materials: ["GI", "GP"],
        machineTypes: ["Shutter Patti Machine", "False Ceiling Machine"],
        productionCapacity: "250 machines/year",
        contactPhone: "9911234567",
        contactEmail: "uprollforming@example.com",
        description: "Noida-based manufacturer of shutter patti and POP channel machines with quick delivery.",
        isActive: true,
      },
    ];

    const created = [];
    for (const data of seedData) {
      const m = await db.createManufacturer(data);
      created.push(m);
    }
    return res.status(201).json({ message: `Seeded ${created.length} manufacturers`, manufacturers: created });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/engineer/production-workflows", requireEngineer, async (_req, res) => {
  try {
    const workflows = await db.getProductionWorkflows();
    return res.json(workflows);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

const broadcastUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  image: z.string().nullable().optional(),
  audience: z.enum(["all", "suppliers", "buyers"]).optional(),
  postToSocialMedia: z.boolean().optional(),
});

router.patch("/admin/broadcast-posts/:id", requireAdmin, async (req, res) => {
  try {
    const parsed = broadcastUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map(e => e.message).join(", ") });
    }
    const post = await db.updateBroadcastPost(req.params.id, parsed.data);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json(post);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/job-applications", requireAdmin, async (_req, res) => {
  try {
    const apps = await db.getJobApplications();
    return res.json(apps);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/engineer/production-workflows/:id", requireEngineer, async (req, res) => {
  try {
    const workflow = await db.updateProductionWorkflow(req.params.id, req.body);
    if (!workflow) return res.status(404).json({ message: "Workflow not found" });
    return res.json(workflow);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/broadcast-posts/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteBroadcastPost(req.params.id);
    if (!ok) return res.status(404).json({ message: "Post not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/job-applications/:id", requireAdmin, async (req, res) => {
  try {
    const app = await db.updateJobApplication(req.params.id, req.body);
    if (!app) return res.status(404).json({ message: "Application not found" });
    return res.json(app);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/job-applications/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteJobApplication(req.params.id);
    if (!ok) return res.status(404).json({ message: "Application not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/engineer/job-works", requireEngineer, async (_req, res) => {
  try {
    const jobs = await db.getJobWorks();
    return res.json(jobs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/engineer/job-works/:id", requireEngineer, async (req, res) => {
  try {
    const job = await db.updateJobWork(req.params.id, req.body);
    if (!job) return res.status(404).json({ message: "Job work not found" });
    return res.json(job);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/engineer/vendors", requireEngineer, async (_req, res) => {
  try {
    const suppliers = await db.getSuppliers();
    const materialRequests = await db.getMaterialRequests();
    return res.json({ suppliers, materialRequests });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/engineer/material-requests", requireEngineer, async (req, res) => {
  try {
    const mr = await db.createMaterialRequest(req.body);
    return res.status(201).json(mr);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/engineer/notes/:entityType/:entityId", requireEngineer, async (req, res) => {
  try {
    const notes = await db.getEngineerNotes(req.params.entityType, req.params.entityId);
    return res.json(notes);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/engineer/notes", requireEngineer, async (req, res) => {
  try {
    const note = await db.createEngineerNote(req.body);
    return res.status(201).json(note);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/machine-orders", requireAdmin, async (req, res) => {
  try {
    const order = await db.createMachineOrder(req.body);
    return res.status(201).json(order);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/machine-orders/:id", requireAdmin, async (req, res) => {
  try {
    const order = await db.updateMachineOrder(req.params.id, req.body);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/machine-orders/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteMachineOrder(req.params.id);
    if (!ok) return res.status(404).json({ message: "Order not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/broadcast-posts", async (req, res) => {
  try {
    const user = req.user as any;
    let audience: string;
    if (user) {
      if (user.role === "admin" || user.role === "sub_admin") {
        audience = (req.query.audience as string) || "all";
      } else if (user.role === "supplier" || user.role === "vendor") {
        audience = "suppliers";
      } else {
        audience = "buyers";
      }
    } else {
      audience = "buyers";
    }
    const validAudiences = ["all", "suppliers", "buyers"];
    if (!validAudiences.includes(audience)) {
      audience = "buyers";
    }
    const posts = await db.getBroadcastPostsByAudience(audience);
    return res.json(posts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/assembly/tasks", requireAssemblyHead, async (req, res) => {
  try {
    const user = req.user!;
    let tasks;
    if (user.role === "admin") {
      tasks = await db.getAssemblyTasks();
    } else {
      tasks = await db.getAssemblyTasksByAssignee(user.id);
    }
    return res.json(tasks);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/assembly/tasks/:id", requireAssemblyHead, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const existing = await db.getAssemblyTaskById(id);
    if (!existing) return res.status(404).json({ message: "Task not found" });
    if (user.role !== "admin" && existing.assignedTo !== user.id) {
      return res.status(403).json({ message: "You can only update tasks assigned to you" });
    }
    const { status, notes } = req.body;
    const validStatuses = ["pending", "in_progress", "completed"];
    const updateData: any = {};
    if (status && validStatuses.includes(status)) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (status === "completed") updateData.completedAt = new Date();
    const task = await db.updateAssemblyTask(id, updateData);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/production-workflows", requireAdmin, async (req, res) => {
  try {
    const wf = await db.createProductionWorkflow(req.body);
    return res.status(201).json(wf);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/broadcast-posts/:id/view", async (req, res) => {
  try {
    await db.incrementBroadcastViewCount(req.params.id);
    return res.json({ message: "View counted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/production-workflows/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteProductionWorkflow(req.params.id);
    if (!ok) return res.status(404).json({ message: "Workflow not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/broadcast-notification-pref", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const pref = await db.getBroadcastNotificationPref(user.id);
    return res.json({ enabled: pref ? pref.enabled : true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/job-works", requireAdmin, async (req, res) => {
  try {
    const jw = await db.createJobWork(req.body);
    return res.status(201).json(jw);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/broadcast-notification-pref", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { enabled } = req.body;
    const pref = await db.upsertBroadcastNotificationPref(user.id, enabled !== false);
    return res.json(pref);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/job-works/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteJobWork(req.params.id);
    if (!ok) return res.status(404).json({ message: "Job work not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/broadcast-notifications/unread", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const notifications = await db.getUnreadBroadcastNotifications(user.id);
    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/material-requests/:id", requireAdmin, async (req, res) => {
  try {
    const mr = await db.updateMaterialRequest(req.params.id, req.body);
    if (!mr) return res.status(404).json({ message: "Material request not found" });
    return res.json(mr);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/broadcast-notifications/count", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const count = await db.getUnreadBroadcastCount(user.id);
    return res.json({ count });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/material-requests/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteMaterialRequest(req.params.id);
    if (!ok) return res.status(404).json({ message: "Material request not found" });
    return res.json({ message: "Deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/broadcast-notifications/read-all", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    await db.markAllBroadcastNotificationsRead(user.id);
    return res.json({ message: "All notifications marked as read" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/broadcast-notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    await db.markBroadcastNotificationRead(req.params.id, user.id);
    return res.json({ message: "Notification marked as read" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/meta-settings", requireAdmin, async (req, res) => {
  try {
    const settings = await db.getMetaSettings();
    return res.json({
      hasAccessToken: !!settings.metaAccessToken,
      metaPageId: settings.metaPageId,
      metaInstagramAccountId: settings.metaInstagramAccountId,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

const metaSettingsSchema = z.object({
  metaAccessToken: z.string().min(1).optional(),
  metaPageId: z.string().min(1).optional(),
  metaInstagramAccountId: z.string().optional(),
});

router.patch("/admin/meta-settings", requireAdmin, async (req, res) => {
  try {
    const parsed = metaSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map(e => e.message).join(", ") });
    }
    await db.updateMetaSettings(parsed.data);
    const isConfigured = await isMetaConfigured();
    return res.json({ message: "Meta settings updated", isConfigured });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/meta-oauth/init", requireAdmin, (req, res) => {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    return res.status(400).json({ message: "META_APP_ID environment variable not set" });
  }
  const state = crypto.randomBytes(32).toString("hex");
  (req.session as any).metaOAuthState = state;
  const redirectUri = `${req.protocol}://${req.get("host")}/api/admin/meta-oauth/callback`;
  const scopes = "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish";
  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
  return res.json({ oauthUrl });
});

router.get("/referral/my-code", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const code = await db.getUserReferralCode(user.id);
    const count = await db.getReferralCount(user.id);
    const rewards = await db.getReferralRewards(user.id);
    const referrals = await db.getReferralsByUser(user.id);
    return res.json({ code, count, rewards, referrals });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/referral/invite", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "Name and phone required" });
    const code = await db.getUserReferralCode(user.id);
    const referral = await db.createReferral({
      referrerUserId: user.id,
      referralCode: code,
      referredUserId: null,
      referredName: name,
      referredPhone: phone,
      status: "invited",
    });
    return res.json(referral);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/referral/join", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Referral code required" });
    const ownCode = await db.getUserReferralCode(user.id);
    if (ownCode === code) return res.status(400).json({ message: "Cannot use your own referral code" });
    const existingSnap = await db.getReferralsByUser(user.id);
    const alreadyJoined = existingSnap.some(r => r.referredUserId === user.id);
    if (alreadyJoined) return res.status(400).json({ message: "Already used a referral code" });
    const referrerUserId = await db.resolveReferralOwner(code);
    const referral = await db.createReferral({
      referrerUserId: referrerUserId || "",
      referralCode: code,
      referredUserId: user.id,
      referredName: user.name,
      referredPhone: user.phone,
      status: "joined",
    });
    return res.json({ success: true, referral });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/referral/check-rewards", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const count = await db.getReferralCount(user.id);
    const rewards = await db.getReferralRewards(user.id);
    const existingTypes = rewards.map(r => r.rewardType);
    const newRewards: any[] = [];
    if (count >= 5 && !existingTypes.includes("bonus_features")) {
      const r = await db.unlockReferralReward(user.id, "bonus_features");
      newRewards.push(r);
    }
    if (count >= 10 && !existingTypes.includes("premium_month")) {
      const r = await db.unlockReferralReward(user.id, "premium_month");
      newRewards.push(r);
    }
    return res.json({ count, newRewards, allRewards: [...rewards, ...newRewards] });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/industry-data", async (_req, res) => {
  try {
    const data = await db.getIndustryData();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/industry-data", requireAdmin, async (req, res) => {
  try {
    const item = await db.createIndustryData(req.body);
    return res.json(item);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/industry-data/:id", requireAdmin, async (req, res) => {
  try {
    const item = await db.updateIndustryData(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    return res.json(item);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/industry-data/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteIndustryData(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/production-posts", async (_req, res) => {
  try {
    const posts = await db.getProductionPosts();
    return res.json(posts);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/production-posts", requireAuth, async (req, res) => {
  try {
    const user = req.user as User;
    const { tonnage, note } = req.body;
    if (!tonnage) return res.status(400).json({ message: "Tonnage required" });
    const factoryName = user.companyName || user.name;
    const today = new Date().toISOString().split("T")[0];
    const post = await db.createProductionPost({
      userId: user.id,
      factoryName,
      tonnage: String(tonnage),
      note: note || null,
      date: today,
    });
    return res.json(post);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

const productionLikeTracker = new Map<string, number>();
router.post("/production-posts/:id/like", (req, res, next) => {
  const ip = req.ip || "unknown";
  const key = `${ip}:${req.params.id}`;
  const last = productionLikeTracker.get(key) || 0;
  if (Date.now() - last < 60000) {
    return res.status(429).json({ message: "Too many requests" });
  }
  productionLikeTracker.set(key, Date.now());
  next();
}, async (req, res) => {
  try {
    await db.likeProductionPost(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/production-posts/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteProductionPost(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/manufacturers", async (_req, res) => {
  try {
    const list = await db.getManufacturers();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/manufacturers", requireAdmin, async (req, res) => {
  try {
    const mfg = await db.createManufacturer(req.body);
    return res.json(mfg);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/manufacturers/:id", requireAdmin, async (req, res) => {
  try {
    const mfg = await db.updateManufacturer(req.params.id, req.body);
    if (!mfg) return res.status(404).json({ message: "Not found" });
    return res.json(mfg);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/manufacturers/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteManufacturer(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/meta-oauth/callback", requireAdmin, async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.redirect("/?meta_error=no_code");
    }

    const expectedState = (req.session as any).metaOAuthState;
    if (!state || state !== expectedState) {
      return res.redirect("/?meta_error=invalid_state");
    }
    delete (req.session as any).metaOAuthState;

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    if (!appId || !appSecret) {
      return res.redirect("/?meta_error=missing_env");
    }

    const redirectUri = `${req.protocol}://${req.get("host")}/api/admin/meta-oauth/callback`;

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenResponse.json() as any;
    if (!tokenData.access_token) {
      return res.redirect("/?meta_error=token_exchange_failed");
    }

    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&client_id=${appId}` +
      `&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const longLivedData = await longLivedResponse.json() as any;
    const userToken = longLivedData.access_token || tokenData.access_token;

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`
    );
    const pagesData = await pagesResponse.json() as any;
    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return res.redirect("/?meta_error=no_pages");
    }

    const page = pages[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;

    let igAccountId: string | undefined;
    try {
      const igResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
      );
      const igData = await igResponse.json() as any;
      if (igData.instagram_business_account?.id) {
        igAccountId = igData.instagram_business_account.id;
      }
    } catch {
      // IG account not connected
    }

    await db.updateMetaSettings({
      metaAccessToken: pageAccessToken,
      metaPageId: pageId,
      metaInstagramAccountId: igAccountId,
    });

    return res.redirect("/admin?tab=broadcasts&meta_connected=true");
  } catch (err: any) {
    console.error("Meta OAuth callback error:", err);
    return res.redirect("/?meta_error=callback_failed");
  }
});

router.get("/vendor/materials", requireVendor, async (req, res) => {
  try {
    const vendorId = req.user!.role === "vendor" ? req.user!.id : undefined;
    const materials = await db.getVendorMaterials(vendorId);
    return res.json(materials);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/vendor-materials", requireAdmin, async (req, res) => {
  try {
    const material = await db.createVendorMaterial(req.body);
    return res.status(201).json(material);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/vendor-materials/:id", requireAdmin, async (req, res) => {
  try {
    const material = await db.updateVendorMaterial(req.params.id, req.body);
    if (!material) return res.status(404).json({ message: "Material not found" });
    return res.json(material);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/vendor/bills", requireVendor, async (req, res) => {
  try {
    const vendorId = req.user!.role === "vendor" ? req.user!.id : undefined;
    const bills = await db.getVendorBills(vendorId);
    return res.json(bills);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/vendor/bills", requireVendor, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Only PDF, JPEG, PNG, or WebP files are allowed" });
    }
    const url = await uploadToFirebaseStorage(req.file.buffer, "vendor-bills", req.file.originalname, req.file.mimetype);
    const bill = await db.createVendorBill({
      vendorId: req.user!.id,
      poNumber: req.body.poNumber || "",
      fileName: req.file.originalname,
      fileUrl: url,
      fileType: req.file.mimetype,
      amount: req.body.amount || null,
      status: "pending",
      adminNotes: null,
    });
    return res.status(201).json(bill);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/assembly-tasks", requireAdmin, async (req, res) => {
  try {
    const { taskName, assignedTeam, dueDate, urgency, notes, assignedTo } = req.body;
    if (!taskName || !dueDate) return res.status(400).json({ message: "Task name and due date are required" });
    const validUrgencies = ["low", "medium", "high"];
    const safeUrgency = validUrgencies.includes(urgency) ? urgency : "medium";
    if (assignedTo) {
      const assignee = await db.getUserById(assignedTo);
      if (!assignee || (assignee.role !== "assembly_head" && assignee.role !== "admin")) {
        return res.status(400).json({ message: "Assignee must be an Assembly Head or Admin" });
      }
    }
    const task = await db.createAssemblyTask({
      taskName,
      assignedTeam: assignedTeam || null,
      dueDate,
      status: "pending",
      urgency: safeUrgency,
      notes: notes || null,
      assignedTo: assignedTo || null,
      createdBy: req.user!.id,
    });
    return res.json(task);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/vendor-bills", requireAdmin, async (req, res) => {
  try {
    const bills = await db.getVendorBills();
    return res.json(bills);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/assembly-tasks", requireAdmin, async (_req, res) => {
  try {
    const tasks = await db.getAssemblyTasks();
    return res.json(tasks);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/vendor-bills/:id", requireAdmin, async (req, res) => {
  try {
    const bill = await db.updateVendorBill(req.params.id, req.body);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    return res.json(bill);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/assembly-tasks/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await db.updateAssemblyTask(id, req.body);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/quotations-tracker", requireAdmin, async (req, res) => {
  try {
    const quotations = await db.getQuotations();
    return res.json(quotations);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/assembly-tasks/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteAssemblyTask(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    return res.json({ message: "Task deleted" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/pending-approvals", requireAdmin, async (req, res) => {
  try {
    const quotations = await db.getQuotations();
    const pending = quotations.filter((q: any) => q.approvalStatus === "pending_approval");
    return res.json(pending);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/quotations/:id/approve", requireAdmin, async (req, res) => {
  try {
    const q = await db.updateQuotation(req.params.id, {
      approvalStatus: "approved",
      approvalNote: req.body.note || null,
      approvedAt: new Date(),
      updatedAt: new Date(),
    });
    if (!q) return res.status(404).json({ message: "Quotation not found" });
    return res.json(q);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/push/subscribe", requireAuth, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: "Invalid push subscription" });
    }
    const sub = await db.savePushSubscription(req.user!.id, {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
    return res.json(sub);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/quotations/:id/reject", requireAdmin, async (req, res) => {
  try {
    const q = await db.updateQuotation(req.params.id, {
      approvalStatus: "rejected",
      approvalNote: req.body.note || null,
      updatedAt: new Date(),
    });
    if (!q) return res.status(404).json({ message: "Quotation not found" });
    return res.json(q);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || "";
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

const GOOGLE_FALLBACK = {
  rating: 4.6,
  reviewCount: "60+ Reviews",
  source: "fallback" as const,
};

let cachedGoogleRating: { rating: number; reviewCount: string; source: "api" | "fallback"; fetchedAt: number } | null = null;
const CACHE_TTL = 1000 * 60 * 60;

router.get("/google-rating", async (_req, res) => {
  try {
    if (!GOOGLE_API_KEY || !GOOGLE_PLACE_ID) {
      return res.json(GOOGLE_FALLBACK);
    }

    if (cachedGoogleRating && Date.now() - cachedGoogleRating.fetchedAt < CACHE_TTL) {
      return res.json({ rating: cachedGoogleRating.rating, reviewCount: cachedGoogleRating.reviewCount, source: cachedGoogleRating.source });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=rating,user_ratings_total&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.result) {
      const rating = data.result.rating || GOOGLE_FALLBACK.rating;
      const total = data.result.user_ratings_total || 0;
      const reviewCount = total > 0 ? `${total}+ Reviews` : GOOGLE_FALLBACK.reviewCount;
      cachedGoogleRating = { rating, reviewCount, source: "api", fetchedAt: Date.now() };
      return res.json({ rating, reviewCount, source: "api" });
    }

    return res.json(GOOGLE_FALLBACK);
  } catch {
    return res.json(GOOGLE_FALLBACK);
  }
});

router.get("/admin/assembly-head-users", requireAdmin, async (_req, res) => {
  try {
    const users = await db.getUsers();
    const assemblyHeads = users.filter(u => u.role === "assembly_head");
    return res.json(assemblyHeads.map(u => ({ id: u.id, name: u.name, username: u.username })));
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/video-call-slots", async (req, res) => {
  try {
    const slots = await db.getAvailableVideoCallSlots();
    return res.json(slots);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/video-call-slots", requireAdmin, async (req, res) => {
  try {
    const slots = await db.getVideoCallSlots();
    return res.json(slots);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/video-call-slots", requireAdmin, async (req, res) => {
  try {
    const slot = await db.createVideoCallSlot(req.body);
    return res.json(slot);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/admin/video-call-slots/:id", requireAdmin, async (req, res) => {
  try {
    const slot = await db.updateVideoCallSlot(req.params.id, req.body);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    return res.json(slot);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/video-call-slots/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteVideoCallSlot(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Slot not found" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/video-call-bookings", requireAuth, async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (authUser?.id) {
      const bookings = await db.getVideoCallBookingsByUser(authUser.id);
      return res.json(bookings);
    }
    return res.json([]);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/video-call-bookings", requireAdmin, async (req, res) => {
  try {
    const bookings = await db.getVideoCallBookings();
    return res.json(bookings);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/video-call-bookings", async (req, res) => {
  try {
    const { slotId, userName, userPhone, userEmail, machineType, problemDescription } = req.body;
    const authUser = (req as any).user;
    const slot = await db.getVideoCallSlot(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (!slot.isActive) return res.status(400).json({ message: "Slot is no longer available" });
    if (slot.currentBookings >= slot.maxBookings) return res.status(400).json({ message: "Slot is fully booked" });
    const meetingLink = `https://meet.jit.si/SaiRolotech-${Date.now().toString(36)}`;
    const booking = await db.createVideoCallBooking({
      userId: authUser?.id || null,
      userName,
      userPhone,
      userEmail: userEmail || null,
      machineType,
      problemDescription,
      slotId,
      slotDate: slot.date,
      slotTime: `${slot.startTime} - ${slot.endTime}`,
      status: "confirmed",
      meetingLink,
      adminNotes: null,
      cancelReason: null,
    });
    return res.json(booking);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/video-call-bookings/:id/cancel", requireAuth, async (req, res) => {
  try {
    const authUser = (req as any).user;
    const booking = await db.getVideoCallBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId !== authUser?.id) return res.status(403).json({ message: "Not authorized" });
    const reason = req.body.reason || "Cancelled by user";
    const updated = await db.cancelVideoCallBooking(req.params.id, reason);
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/admin/video-call-bookings/:id", requireAdmin, async (req, res) => {
  try {
    if (req.body.status === "cancelled") {
      const reason = req.body.cancelReason || "Cancelled by admin";
      const booking = await db.cancelVideoCallBooking(req.params.id, reason);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      return res.json(booking);
    }
    const booking = await db.updateVideoCallBooking(req.params.id, req.body);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json(booking);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/discussions/:entityType/:entityId", async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const discussions = await db.getDiscussions(entityType, entityId);
    return res.json(discussions);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/discussions", requireAuth, async (req, res) => {
  try {
    const { entityType, entityId, content } = req.body;
    if (!entityType || !entityId || !content) {
      return res.status(400).json({ message: "entityType, entityId, and content are required" });
    }
    const authUser = (req as any).user;
    const discussion = await db.createDiscussion({
      entityType,
      entityId,
      content: content.slice(0, 2000),
      authorName: authUser?.name || authUser?.username || "Anonymous",
      authorRole: authUser?.role || "buyer",
      authorId: authUser?.id,
    });
    return res.json(discussion);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
