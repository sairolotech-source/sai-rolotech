import { Router } from "express";
import multer from "multer";
import path from "path";
import { storage as db } from "../storage.js";
import { requireAdmin, requireAuth, requireSuperAdmin } from "../auth.js";
import { z } from "zod";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/upload/:folder", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    const base64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
    return res.json({ url: dataUrl, fileName: req.file.originalname });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/settings", async (req, res) => {
  try {
    let settings = await db.getAppSettings();
    if (!settings) {
      settings = await db.upsertAppSettings({});
    }
    return res.json(settings);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await db.upsertAppSettings(req.body);
    return res.json(settings);
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
      const base64 = req.file.buffer.toString("base64");
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      images = [dataUrl];
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
    try {
      await db.createPostReport({ postId, reporterUserId: user.id });
    } catch (dupErr: any) {
      if (dupErr.code === "23505") {
        return res.status(400).json({ message: "You have already reported this post" });
      }
      throw dupErr;
    }
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
    const q = await db.createQuotation({ ...req.body, accessCode });
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
    const user = await db.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, twoFactorSecret, ...safe } = user;
    return res.json(safe);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const ok = await db.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Deleted" });
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

export default router;
