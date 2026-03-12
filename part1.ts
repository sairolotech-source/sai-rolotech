import { Router } from "express";
import multer from "multer";
import path from "path";
import { storage as db } from "../storage.js";
import { requireAdmin, requireAuth, requireSuperAdmin, requireEngineer } from "../auth.js";
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
    const posts = await db.getPosts();
    return res.json(posts);
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

router.post("/posts", requireAuth, upload.single("image"), async (req, res) => {
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
    if (req.file) {
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
    }
    if (!images && !youtubeUrl) {
      return res.status(400).json({ message: "Please upload a photo or paste a YouTube link" });
    }
    if (images && youtubeUrl) {
      return res.status(400).json({ message: "Please choose either a photo or a YouTube link, not both" });
    }
    const post = await db.createPost({
      type: youtubeUrl ? "video" : "image",
      caption,
      author: user.name,
      userId: user.id,
      likes: 0,
      isApproved: true,
      images: images || null,
      youtubeUrl: youtubeUrl || null,
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

router.delete("/posts/:id", requireAdmin, async (req, res) => {
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

router.post("/suppliers", async (req, res) => {
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
<<<<<<< HEAD

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

router.get("/admin/vendor-bills", requireAdmin, async (req, res) => {
  try {
    const bills = await db.getVendorBills();
    return res.json(bills);
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

router.get("/admin/quotations-tracker", requireAdmin, async (req, res) => {
  try {
    const quotations = await db.getQuotations();
    return res.json(quotations);
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

export default router;
