import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertServiceRequestSchema, insertAppointmentSchema, insertProductSchema, insertSupplierProfileSchema, insertReviewSchema, insertSupportTicketSchema, insertAmcSubscriptionSchema, insertDealerSchema, insertPostSchema } from "@shared/schema";
import { requireAuth, requireAdmin, requireSuperAdmin } from "./auth";
import { z } from "zod";
import { sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import { FOLDERS, uploadFile, deleteFile, initFirebase } from "./firebase-storage";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
      cb(null, unique + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".dwg", ".dxf", ".doc", ".docx", ".xls", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const supabaseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".pdf", ".dwg", ".dxf", ".doc", ".docx", ".xls", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const statusSchema = z.object({ status: z.string().min(1).max(50) });
const appointmentStatusSchema = z.object({ status: z.enum(["pending", "approved", "completed", "cancelled"]) });
const leadStatusSchema = z.object({ status: z.enum(["new", "contacted", "qualified", "converted"]) });
const leadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "converted"]).optional(),
  financeRequired: z.boolean().optional(),
  financeStage: z.enum(["inquiry", "discussion", "docs_submitted", "sanctioned", "disbursement"]).optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  expectedAmount: z.string().optional(),
  machineModel: z.string().optional(),
  notes: z.string().optional(),
  nextFollowupDate: z.string().optional(),
});
const serviceStatusSchema = z.object({ status: z.enum(["pending", "assigned", "in_progress", "resolved"]) });
const userUpdateSchema = z.object({
  role: z.enum(["buyer", "vendor", "admin"]).optional(),
  isVerified: z.boolean().optional(),
});
const settingsUpdateSchema = z.object({
  companyName: z.string().optional(),
  whatsappNumber: z.string().optional(),
  supportNumber: z.string().optional(),
  currentCoilRate: z.string().optional(),
  address: z.string().optional(),
  chatbotEnabled: z.boolean().optional(),
  whatsappButtonEnabled: z.boolean().optional(),
  splashScreenEnabled: z.boolean().optional(),
  visitorCounterEnabled: z.boolean().optional(),
  marketRateEnabled: z.boolean().optional(),
  quickActionsEnabled: z.boolean().optional(),
  bannerCarouselEnabled: z.boolean().optional(),
  socialFeedEnabled: z.boolean().optional(),
  heroTagline: z.string().optional(),
  chatbotWelcomeMessage: z.string().optional(),
  announcementText: z.string().optional(),
  announcementEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  initFirebase();

  app.post("/api/upload/:folder", requireAdmin, supabaseUpload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file provided" });

      const folder = req.params.folder;
      const validFolders = Object.values(FOLDERS);
      if (!validFolders.includes(folder)) return res.status(400).json({ message: "Invalid folder" });

      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

      const publicUrl = await uploadFile(folder, fileName, file.buffer, file.mimetype);
      res.json({ url: publicUrl, fileName, folder });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Upload failed" });
    }
  });

  app.post("/api/upload/:folder/multiple", requireAdmin, supabaseUpload.array("files", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) return res.status(400).json({ message: "No files provided" });

      const folder = req.params.folder;
      const validFolders = Object.values(FOLDERS);
      if (!validFolders.includes(folder)) return res.status(400).json({ message: "Invalid folder" });

      const urls: string[] = [];
      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

        const url = await uploadFile(folder, fileName, file.buffer, file.mimetype);
        urls.push(url);
      }

      res.json({ urls, folder });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Upload failed" });
    }
  });

  app.delete("/api/upload/:folder/:fileName", requireAdmin, async (req, res) => {
    try {
      const { folder, fileName } = req.params;
      await deleteFile(folder, fileName);
      res.json({ message: "File deleted" });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Delete failed" });
    }
  });

  app.get("/api/products", async (_req, res) => {
    const isUsed = _req.query.isUsed === "true" ? true : _req.query.isUsed === "false" ? false : undefined;
    const products = await storage.getProducts(isUsed);
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.get("/api/dealers", async (_req, res) => {
    const dealers = await storage.getDealers();
    res.json(dealers);
  });

  app.post("/api/admin/dealers", requireAdmin, async (req, res) => {
    try {
      const parsed = insertDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(parsed);
      res.status(201).json(dealer);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create dealer" });
    }
  });

  app.patch("/api/admin/dealers/:id", requireAdmin, async (req, res) => {
    try {
      const updateSchema = insertDealerSchema.partial();
      const parsed = updateSchema.parse(req.body);
      const dealer = await storage.updateDealer(req.params.id, parsed);
      if (!dealer) return res.status(404).json({ message: "Dealer not found" });
      res.json(dealer);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update dealer" });
    }
  });

  app.delete("/api/admin/dealers/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteDealer(req.params.id);
      res.json({ message: "Dealer deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete dealer" });
    }
  });

  app.patch("/api/admin/dealers/:id/freeze", requireAdmin, async (req, res) => {
    try {
      const dealer = await storage.getDealer(req.params.id);
      if (!dealer) return res.status(404).json({ message: "Dealer not found" });
      const updated = await storage.updateDealer(req.params.id, { isFrozen: !dealer.isFrozen });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to toggle freeze" });
    }
  });

  app.patch("/api/admin/dealers/:id/verify-gst", requireAdmin, async (req, res) => {
    try {
      const dealer = await storage.getDealer(req.params.id);
      if (!dealer) return res.status(404).json({ message: "Dealer not found" });
      if (!dealer.gstNo) return res.status(400).json({ message: "No GST number to verify" });
      const updated = await storage.updateDealer(req.params.id, { isGstVerified: !dealer.isGstVerified });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to verify GST" });
    }
  });

  app.get("/api/visitor-count", async (_req, res) => {
    try {
      const { db } = await import("./db");
      const result = await db.execute(sql`
        UPDATE visitor_counter 
        SET total_visits = total_visits + 1,
            today_visits = CASE 
              WHEN last_reset_date = CURRENT_DATE THEN today_visits + 1 
              ELSE 1 
            END,
            last_reset_date = CURRENT_DATE
        WHERE id = 1
        RETURNING total_visits, unique_visits, today_visits
      `);
      res.json(result.rows[0] || { total_visits: 0, unique_visits: 0, today_visits: 0 });
    } catch (e) {
      res.json({ total_visits: 0, unique_visits: 0, today_visits: 0 });
    }
  });

  app.get("/api/operators", async (_req, res) => {
    const operators = await storage.getOperators();
    res.json(operators);
  });

  app.post("/api/operators", async (req, res) => {
    const opSchema = z.object({
      name: z.string().min(1),
      phone: z.string().min(10),
      aadhaarNo: z.string().optional(),
      experience: z.string().min(1),
      machineType: z.string().optional(),
      previousSalary: z.string().optional(),
      expectedSalary: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      location: z.string().optional(),
      specialization: z.string().optional(),
    });
    const parsed = opSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const operator = await storage.createOperator(parsed.data);
    res.status(201).json(operator);
  });

  app.get("/api/posts", async (_req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post("/api/posts/:id/like", async (req, res) => {
    const post = await storage.likePost(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.get("/api/leads", async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.post("/api/leads", async (req, res) => {
    const parsed = insertLeadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const lead = await storage.createLead(parsed.data);
    res.status(201).json(lead);
  });

  app.get("/api/service-requests", async (_req, res) => {
    const requests = await storage.getServiceRequests();
    res.json(requests);
  });

  app.post("/api/service-requests", async (req, res) => {
    const parsed = insertServiceRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const request = await storage.createServiceRequest(parsed.data);
    res.status(201).json(request);
  });

  app.get("/api/subsidies", async (_req, res) => {
    const subsidies = await storage.getSubsidies();
    res.json(subsidies);
  });

  app.get("/api/spare-parts", async (_req, res) => {
    const parts = await storage.getSpareParts();
    res.json(parts);
  });

  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    res.json(settings || {
      id: "default",
      companyName: "Sai Rolotech",
      whatsappNumber: "919090486262",
      supportNumber: "919090486262",
      currentCoilRate: "74.50",
      address: "Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi, Delhi - 110041"
    });
  });

  app.post("/api/appointments", async (req, res) => {
    const parsed = insertAppointmentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const appointment = await storage.createAppointment(parsed.data);
    res.status(201).json(appointment);
  });

  app.get("/api/appointments/:id", async (req, res) => {
    const appointment = await storage.getAppointment(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  });

  app.get("/api/admin/dashboard", requireAdmin, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/admin/leads", requireAdmin, async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.patch("/api/admin/leads/:id", requireAdmin, async (req, res) => {
    const parsed = leadUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const lead = await storage.updateLead(req.params.id, parsed.data);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  });

  app.get("/api/admin/lead-scoring", requireAdmin, async (_req, res) => {
    try {
      const scorings = await storage.getAllLeadScorings();
      res.json(scorings);
    } catch (e) {
      res.json([]);
    }
  });

  app.get("/api/admin/lead-scoring/:leadId", requireAdmin, async (req, res) => {
    try {
      const scoring = await storage.getLeadScoring(req.params.leadId);
      if (!scoring) return res.status(404).json({ message: "No scoring found" });
      res.json(scoring);
    } catch (e) {
      res.status(500).json({ message: "Failed to get scoring" });
    }
  });

  app.post("/api/admin/lead-scoring/:leadId", requireAdmin, async (req, res) => {
    try {
      const leadId = req.params.leadId;
      const lead = await storage.getLeads();
      const targetLead = lead.find(l => l.id === leadId);
      if (!targetLead) return res.status(404).json({ message: "Lead not found" });

      const body = req.body;

      const purchaseTimelineScores: Record<string, number> = {
        "within_15_days": 30, "within_1_month": 20, "3_months": 10, "no_plan": 0, "just_enquiry": 0
      };
      const budgetScores: Record<string, number> = {
        "budget_ready": 20, "loan_discuss": 15, "budget_unsure": 5, "planning": 5
      };
      const technicalScores: Record<string, number> = {
        "specification_asking": 15, "comparison_viewing": 10, "basic_info": 5
      };
      const responseScores: Record<string, number> = {
        "within_1_hour": 10, "same_day": 5, "late_reply": 2
      };

      const ptScore = purchaseTimelineScores[body.purchaseTimeline] ?? 0;
      const bScore = budgetScores[body.budgetClarity] ?? 0;
      const tScore = technicalScores[body.technicalInterest] ?? 0;
      const visits = body.visitCount || 1;
      const eScore = visits >= 3 ? 15 : visits >= 2 ? 10 : 5;
      const rScore = responseScores[body.responseSpeed] ?? 0;
      const dScore = body.documentUploaded ? 10 : 0;

      const totalScore = ptScore + bScore + tScore + eScore + rScore + dScore;
      const leadStatus = totalScore >= 75 ? "HOT" : totalScore >= 45 ? "WARM" : "COLD";

      const scoring = await storage.upsertLeadScoring({
        leadId,
        purchaseTimeline: body.purchaseTimeline || null,
        purchaseTimelineScore: ptScore,
        budgetClarity: body.budgetClarity || null,
        budgetScore: bScore,
        technicalInterest: body.technicalInterest || null,
        technicalScore: tScore,
        visitCount: visits,
        engagementScore: eScore,
        responseSpeed: body.responseSpeed || null,
        responseScore: rScore,
        documentUploaded: body.documentUploaded || false,
        documentScore: dScore,
        totalScore,
        leadStatus,
        firstEnquiryDate: body.firstEnquiryDate ? new Date(body.firstEnquiryDate) : targetLead.createdAt,
        quotationSent: body.quotationSent || false,
        comparisonViewed: body.comparisonViewed || false,
        lastFollowupResponse: body.lastFollowupResponse ? new Date(body.lastFollowupResponse) : null,
        lastChatbotInteraction: body.lastChatbotInteraction ? new Date(body.lastChatbotInteraction) : null,
      });

      await storage.updateLead(leadId, { confidenceScore: totalScore });

      res.json(scoring);
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Failed to score lead" });
    }
  });

  app.get("/api/admin/lead-intelligence", requireAdmin, async (_req, res) => {
    try {
      const allLeads = await storage.getLeads();
      const allScorings = await storage.getAllLeadScorings();
      const scoringMap = new Map(allScorings.map(s => [s.leadId, s]));

      const intelligence = allLeads.map(lead => {
        const scoring = scoringMap.get(lead.id);
        return {
          ...lead,
          scoring: scoring || null,
          leadTag: scoring?.leadStatus || (lead.confidenceScore && lead.confidenceScore >= 75 ? "HOT" : lead.confidenceScore && lead.confidenceScore >= 45 ? "WARM" : "COLD"),
          totalScore: scoring?.totalScore || lead.confidenceScore || 0,
        };
      });

      const hot = intelligence.filter(i => i.leadTag === "HOT").length;
      const warm = intelligence.filter(i => i.leadTag === "WARM").length;
      const cold = intelligence.filter(i => i.leadTag === "COLD").length;

      res.json({ leads: intelligence, stats: { hot, warm, cold, total: allLeads.length } });
    } catch (e) {
      res.json({ leads: [], stats: { hot: 0, warm: 0, cold: 0, total: 0 } });
    }
  });

  app.get("/api/admin/service-requests", requireAdmin, async (_req, res) => {
    const requests = await storage.getServiceRequests();
    res.json(requests);
  });

  app.patch("/api/admin/service-requests/:id", requireAdmin, async (req, res) => {
    const parsed = serviceStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid status" });
    const request = await storage.updateServiceRequestStatus(req.params.id, parsed.data.status);
    if (!request) return res.status(404).json({ message: "Service request not found" });
    res.json(request);
  });

  app.get("/api/admin/products", requireAdmin, async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const product = await storage.updateProduct(req.params.id, parsed.data);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  });

  app.get("/api/admin/appointments", requireAdmin, async (_req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.patch("/api/admin/appointments/:id", requireAdmin, async (req, res) => {
    const parsed = appointmentStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid status" });
    const appointment = await storage.updateAppointment(req.params.id, parsed.data);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  });

  app.get("/api/admin/posts", requireAdmin, async (_req, res) => {
    const posts = await storage.getAllPosts();
    res.json(posts);
  });

  app.post("/api/admin/posts", requireAdmin, async (req, res) => {
    const parsed = insertPostSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const post = await storage.createPost(parsed.data);
    res.status(201).json(post);
  });

  app.patch("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    const parsed = z.object({ isApproved: z.boolean() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const post = await storage.updatePost(req.params.id, parsed.data);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.delete("/api/admin/posts/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deletePost(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  });

  app.get("/api/admin/users", requireSuperAdmin, async (_req, res) => {
    const users = await storage.getUsers();
    const safeUsers = users.map(({ password, twoFactorSecret, ...u }) => u);
    res.json(safeUsers);
  });

  app.patch("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const user = await storage.updateUser(req.params.id, parsed.data);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.delete("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted" });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to delete user" });
    }
  });

  app.patch("/api/admin/settings", requireSuperAdmin, async (req, res) => {
    const parsed = settingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid settings data" });
    const settings = await storage.updateSettings(parsed.data);
    res.json(settings);
  });

  app.get("/api/suppliers", async (req, res) => {
    const state = req.query.state as string | undefined;
    const suppliers = await storage.getSuppliers(state);
    res.json(suppliers);
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    const supplier = await storage.getSupplier(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  });

  app.get("/api/suppliers/:id/reviews", async (req, res) => {
    const reviews = await storage.getReviewsForSupplier(req.params.id);
    res.json(reviews);
  });

  app.post("/api/suppliers/:id/reviews", async (req, res) => {
    const reviewSchema = z.object({
      reviewerName: z.string().min(1),
      reviewerPhone: z.string().optional(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    });
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const supplier = await storage.getSupplier(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    const review = await storage.createReview({
      ...parsed.data,
      supplierId: req.params.id,
      isVerifiedBuyer: req.isAuthenticated?.() || false,
      isApproved: true,
    });
    res.status(201).json(review);
  });

  app.post("/api/admin/suppliers", requireAdmin, async (req, res) => {
    const parsed = insertSupplierProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const supplier = await storage.createSupplier(parsed.data);
    res.status(201).json(supplier);
  });

  app.patch("/api/admin/suppliers/:id", requireAdmin, async (req, res) => {
    const badgeSchema = z.object({
      isGstVerified: z.boolean().optional(),
      isPremium: z.boolean().optional(),
      isVerified: z.boolean().optional(),
      isTopRated: z.boolean().optional(),
      isFastResponder: z.boolean().optional(),
    });
    const parsed = badgeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const supplier = await storage.updateSupplier(req.params.id, parsed.data);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  });

  app.delete("/api/admin/suppliers/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteSupplier(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier deleted" });
  });

  app.get("/api/admin/suppliers", requireAdmin, async (_req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.get("/api/support-tickets", async (req, res) => {
    const phone = req.query.phone as string | undefined;
    if (!phone || phone.length < 10) {
      return res.json([]);
    }
    const allTickets = await storage.getSupportTickets();
    const filtered = allTickets.filter(t => t.buyerPhone === phone);
    res.json(filtered);
  });

  app.get("/api/support-tickets/:id", async (req, res) => {
    const ticket = await storage.getSupportTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/support-tickets", async (req, res) => {
    const ticketSchema = z.object({
      buyerName: z.string().min(1),
      buyerPhone: z.string().min(10),
      buyerEmail: z.string().email().optional().or(z.literal("")),
      machineName: z.string().min(1),
      problemType: z.string().min(1),
      description: z.string().min(10),
      imageUrls: z.array(z.string().url()).optional(),
      videoUrl: z.string().url().optional().or(z.literal("")),
      urgency: z.enum(["low", "normal", "high", "critical"]),
    });
    const parsed = ticketSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const ticket = await storage.createSupportTicket(parsed.data);
    res.status(201).json(ticket);
  });

  const ticketStatusSchema = z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    assignedPartner: z.string().optional(),
    adminNotes: z.string().optional(),
    resolution: z.string().optional(),
  });

  app.patch("/api/admin/support-tickets/:id", requireAdmin, async (req, res) => {
    const parsed = ticketStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const ticket = await storage.updateSupportTicket(req.params.id, parsed.data);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  });

  app.get("/api/admin/support-tickets", requireAdmin, async (_req, res) => {
    const tickets = await storage.getSupportTickets();
    res.json(tickets);
  });

  app.get("/api/amc-plans", async (_req, res) => {
    const plans = await storage.getAmcPlans();
    res.json(plans);
  });

  app.get("/api/amc-plans/:id", async (req, res) => {
    const plan = await storage.getAmcPlan(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  });

  app.post("/api/amc-subscriptions", async (req, res) => {
    const subSchema = z.object({
      planId: z.string().min(1),
      buyerName: z.string().min(1),
      buyerPhone: z.string().min(10),
      buyerEmail: z.string().email().optional().or(z.literal("")),
      companyName: z.string().optional().or(z.literal("")),
      machineName: z.string().min(1),
      machineModel: z.string().optional().or(z.literal("")),
      installationDate: z.string().optional().or(z.literal("")),
      duration: z.enum(["1_year", "2_year"]),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
      amount: z.string().min(1),
      paymentMethod: z.string().optional(),
      status: z.string().optional(),
    });
    const parsed = subSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const plan = await storage.getAmcPlan(parsed.data.planId);
    if (!plan) return res.status(400).json({ message: "Invalid AMC plan" });
    const sub = await storage.createAmcSubscription(parsed.data);
    res.status(201).json(sub);
  });

  app.get("/api/amc-subscriptions/:id", async (req, res) => {
    const sub = await storage.getAmcSubscription(req.params.id);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    res.json(sub);
  });

  app.get("/api/admin/amc-subscriptions", requireAdmin, async (_req, res) => {
    const subs = await storage.getAmcSubscriptions();
    res.json(subs);
  });

  app.patch("/api/admin/amc-subscriptions/:id", requireAdmin, async (req, res) => {
    const updateSchema = z.object({
      status: z.enum(["pending", "active", "expired", "cancelled"]).optional(),
      nextVisitDate: z.string().optional(),
      completedVisits: z.number().optional(),
      adminNotes: z.string().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const sub = await storage.updateAmcSubscription(req.params.id, parsed.data);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    res.json(sub);
  });

  app.use("/uploads", (await import("express")).default.static(uploadDir));

  app.get("/api/documents", async (_req, res) => {
    const docs = await storage.getDocuments();
    res.json(docs);
  });

  app.post("/api/admin/documents", requireAdmin, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const docSchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(["drawing", "manual", "certificate", "invoice", "specification", "other"]),
      machineCategory: z.string().optional(),
      machineModel: z.string().optional(),
    });
    const parsed = docSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = [".jpg", ".jpeg", ".png"].includes(ext) ? "image"
      : [".pdf"].includes(ext) ? "pdf"
      : [".dwg", ".dxf"].includes(ext) ? "cad"
      : "document";

    const doc = await storage.createDocument({
      ...parsed.data,
      fileType,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      uploadedBy: (req.user as any)?.name || "Admin",
    });
    res.status(201).json(doc);
  });

  app.delete("/api/admin/documents/:id", requireAdmin, async (req, res) => {
    const doc = await storage.getDocument(req.params.id);
    if (doc) {
      const fullPath = path.join(uploadDir, path.basename(doc.filePath));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    const deleted = await storage.deleteDocument(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Document not found" });
    res.json({ success: true });
  });

  app.get("/api/inspections", async (_req, res) => {
    const list = await storage.getInspections();
    res.json(list);
  });

  app.get("/api/inspections/:id", async (req, res) => {
    const inspection = await storage.getInspection(req.params.id);
    if (!inspection) return res.status(404).json({ message: "Inspection not found" });
    res.json(inspection);
  });

  app.post("/api/admin/inspections", requireAdmin, async (req, res) => {
    const inspectionSchema = z.object({
      machineModel: z.string().min(1),
      machineCategory: z.string().min(1),
      customerName: z.string().optional(),
      inspectorName: z.string().min(1),
      status: z.string().optional(),
      items: z.any(),
      overallResult: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = inspectionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const inspection = await storage.createInspection(parsed.data);
    res.status(201).json(inspection);
  });

  app.patch("/api/admin/inspections/:id", requireAdmin, async (req, res) => {
    const updateSchema = z.object({
      status: z.enum(["in_progress", "passed", "failed", "conditional"]).optional(),
      items: z.any().optional(),
      overallResult: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const updated = await storage.updateInspection(req.params.id, parsed.data);
    if (!updated) return res.status(404).json({ message: "Inspection not found" });
    res.json(updated);
  });

  app.get("/api/admin/quotations", requireAdmin, async (_req, res) => {
    const quotes = await storage.getQuotations();
    res.json(quotes);
  });

  app.get("/api/quotations/:id", requireAdmin, async (req, res) => {
    const quote = await storage.getQuotation(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quotation not found" });
    res.json(quote);
  });

  app.post("/api/quotations/view/:number", async (req, res) => {
    const quote = await storage.getQuotationByNumber(req.params.number);
    if (!quote) return res.status(404).json({ message: "Quotation not found" });
    const code = req.body.code as string;
    if (!code || code !== quote.accessCode) return res.status(403).json({ message: "Invalid access code" });
    if (!quote.viewedAt) {
      await storage.updateQuotation(quote.id, { viewedAt: new Date(), status: quote.status === "sent" ? "viewed" : quote.status });
    }
    const { accessCode, adminNotes, ...safe } = quote;
    res.json(safe);
  });

  app.post("/api/admin/quotations", requireAdmin, async (req, res) => {
    const qSchema = z.object({
      customerName: z.string().min(1),
      companyName: z.string().optional(),
      customerPhone: z.string().min(10),
      customerEmail: z.string().optional(),
      gstNo: z.string().optional(),
      customerAddress: z.string().optional(),
      projectName: z.string().optional(),
      machineCategory: z.string().min(1),
      profileType: z.string().min(1),
      machineModel: z.string().optional(),
      tier: z.string().min(1),
      automation: z.string().min(1),
      rolls: z.number().min(6).max(13),
      cuttingType: z.string().optional(),
      decoilerType: z.string().optional(),
      quantity: z.number().min(1),
      singlePrice: z.number().min(0),
      totalBeforeDiscount: z.number().min(0),
      discountPercent: z.string().optional(),
      discountAmount: z.number().optional(),
      subtotal: z.number().min(0),
      gstAmount: z.number().min(0),
      grandTotal: z.number().min(0),
      deliveryDays: z.number().min(1),
      addOns: z.string().optional(),
      dealerMargin: z.number().optional(),
      accessCode: z.string().min(1),
      validUntil: z.string().min(1),
      preparedBy: z.string().optional(),
      status: z.string().optional(),
      adminNotes: z.string().optional(),
    });
    const parsed = qSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    try {
      const quote = await storage.createQuotation(parsed.data as any);
      res.status(201).json(quote);
    } catch (err: any) {
      console.error("Quotation creation error:", err);
      res.status(500).json({ message: err.message || "Failed to create quotation" });
    }
  });

  app.patch("/api/admin/quotations/:id", requireAdmin, async (req, res) => {
    const updateSchema = z.object({
      status: z.enum(["sent", "viewed", "downloaded", "approved", "negotiation", "expired"]).optional(),
      adminNotes: z.string().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const data: any = { ...parsed.data };
    if (parsed.data?.status === "approved") data.approvedAt = new Date();
    const updated = await storage.updateQuotation(req.params.id, data);
    if (!updated) return res.status(404).json({ message: "Quotation not found" });
    res.json(updated);
  });

  app.post("/api/quotations/:number/download", async (req, res) => {
    const quote = await storage.getQuotationByNumber(req.params.number);
    if (!quote) return res.status(404).json({ message: "Quotation not found" });
    const code = req.body.code as string;
    if (code !== quote.accessCode) return res.status(403).json({ message: "Invalid access code" });
    if (!quote.downloadedAt) {
      await storage.updateQuotation(quote.id, { downloadedAt: new Date(), status: quote.status === "viewed" || quote.status === "sent" ? "downloaded" : quote.status });
    }
    res.json({ success: true });
  });

  app.post("/api/quotations/:number/approve", async (req, res) => {
    const quote = await storage.getQuotationByNumber(req.params.number);
    if (!quote) return res.status(404).json({ message: "Quotation not found" });
    const code = req.body.code as string;
    if (code !== quote.accessCode) return res.status(403).json({ message: "Invalid access code" });
    await storage.updateQuotation(quote.id, { status: "approved", approvedAt: new Date() });
    res.json({ success: true });
  });

  app.get("/api/iso-documents", async (_req, res) => {
    const docs = await storage.getIsoDocuments();
    res.json(docs);
  });

  app.get("/api/iso-documents/:id", async (req, res) => {
    const doc = await storage.getIsoDocument(req.params.id);
    if (!doc) return res.status(404).json({ message: "ISO document not found" });
    res.json(doc);
  });

  app.post("/api/admin/iso-documents", requireAdmin, async (req, res) => {
    const docSchema = z.object({
      title: z.string().min(1),
      isoClause: z.string().min(1),
      category: z.enum(["quality_manual", "procedure", "work_instruction", "form", "record", "policy", "sop", "checklist"]),
      revision: z.string().optional(),
      status: z.enum(["draft", "under_review", "approved", "obsolete"]).optional(),
      approvedBy: z.string().optional(),
      effectiveDate: z.string().optional(),
      nextReviewDate: z.string().optional(),
      description: z.string().optional(),
      filePath: z.string().optional(),
    });
    const parsed = docSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const doc = await storage.createIsoDocument(parsed.data);
    res.status(201).json(doc);
  });

  app.patch("/api/admin/iso-documents/:id", requireAdmin, async (req, res) => {
    const updateSchema = z.object({
      title: z.string().optional(),
      isoClause: z.string().optional(),
      category: z.string().optional(),
      revision: z.string().optional(),
      status: z.enum(["draft", "under_review", "approved", "obsolete"]).optional(),
      approvedBy: z.string().optional(),
      effectiveDate: z.string().optional(),
      nextReviewDate: z.string().optional(),
      description: z.string().optional(),
      filePath: z.string().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const updated = await storage.updateIsoDocument(req.params.id, parsed.data);
    if (!updated) return res.status(404).json({ message: "ISO document not found" });
    res.json(updated);
  });

  app.delete("/api/admin/iso-documents/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteIsoDocument(req.params.id);
    if (!deleted) return res.status(404).json({ message: "ISO document not found" });
    res.json({ success: true });
  });

  app.get("/api/iso-audits", async (_req, res) => {
    const audits = await storage.getIsoAudits();
    res.json(audits);
  });

  app.post("/api/admin/iso-audits", requireAdmin, async (req, res) => {
    const auditSchema = z.object({
      auditType: z.enum(["internal", "external", "surveillance", "certification"]),
      auditorName: z.string().min(1),
      department: z.string().min(1),
      scheduledDate: z.string().min(1),
      completedDate: z.string().optional(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      findings: z.any().optional(),
      nonConformities: z.number().optional(),
      observations: z.number().optional(),
      improvements: z.number().optional(),
      overallResult: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = auditSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const audit = await storage.createIsoAudit(parsed.data);
    res.status(201).json(audit);
  });

  app.patch("/api/admin/iso-audits/:id", requireAdmin, async (req, res) => {
    const updateSchema = z.object({
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      completedDate: z.string().optional(),
      findings: z.any().optional(),
      nonConformities: z.number().optional(),
      observations: z.number().optional(),
      improvements: z.number().optional(),
      overallResult: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const updated = await storage.updateIsoAudit(req.params.id, parsed.data);
    if (!updated) return res.status(404).json({ message: "Audit not found" });
    res.json(updated);
  });

  app.get("/api/capas", async (_req, res) => {
    const list = await storage.getCapas();
    res.json(list);
  });

  app.post("/api/admin/capas", requireAdmin, async (req, res) => {
    const capaSchema = z.object({
      type: z.enum(["corrective", "preventive", "both"]),
      source: z.enum(["audit", "customer_complaint", "inspection", "process_deviation", "management_review", "other"]),
      description: z.string().min(1),
      rootCause: z.string().optional(),
      correctiveAction: z.string().optional(),
      preventiveAction: z.string().optional(),
      assignedTo: z.string().min(1),
      targetDate: z.string().min(1),
      completedDate: z.string().optional(),
      status: z.enum(["open", "in_progress", "completed", "verified", "closed"]).optional(),
      effectiveness: z.enum(["effective", "partially_effective", "not_effective"]).optional(),
      isoClause: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    });
    const parsed = capaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const capa = await storage.createCapa(parsed.data);
    res.status(201).json(capa);
  });

  app.patch("/api/admin/capas/:id", requireAdmin, async (req, res) => {
    const updateSchema = z.object({
      rootCause: z.string().optional(),
      correctiveAction: z.string().optional(),
      preventiveAction: z.string().optional(),
      status: z.enum(["open", "in_progress", "completed", "verified", "closed"]).optional(),
      completedDate: z.string().optional(),
      effectiveness: z.enum(["effective", "partially_effective", "not_effective"]).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const updated = await storage.updateCapa(req.params.id, parsed.data);
    if (!updated) return res.status(404).json({ message: "CAPA not found" });
    res.json(updated);
  });

  app.get("/api/market-prices", async (_req, res) => {
    const prices = await storage.getLatestPrices();
    res.json(prices);
  });

  app.get("/api/market-prices/history", async (_req, res) => {
    const prices = await storage.getMarketPrices();
    res.json(prices);
  });

  app.post("/api/admin/market-prices", requireAdmin, async (req, res) => {
    const priceSchema = z.object({
      material: z.enum(["gp_coil", "cr_coil", "steel"]),
      price: z.string().or(z.number()).transform(String),
      previousPrice: z.string().or(z.number()).transform(String).optional(),
      unit: z.enum(["per_kg", "per_ton"]).optional(),
      trend: z.enum(["up", "down", "stable"]).optional(),
      prediction: z.string().optional(),
      upChance: z.number().min(0).max(100).optional(),
      downChance: z.number().min(0).max(100).optional(),
      updateSlot: z.string().optional(),
      region: z.string().optional(),
      date: z.string().min(1),
    });
    const parsed = priceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const price = await storage.createMarketPrice({
      ...parsed.data,
      updatedBy: (req.user as any)?.username || "admin",
    });
    res.status(201).json(price);
  });

  app.get("/api/health-checks", async (_req, res) => {
    const checks = await storage.getHealthChecks();
    res.json(checks);
  });

  app.post("/api/health-checks", async (req, res) => {
    const checkSchema = z.object({
      operatorName: z.string().min(1),
      operatorPhone: z.string().optional(),
      machineModel: z.string().min(1),
      machineCategory: z.string().min(1),
      noiseLevel: z.number().min(1).max(5),
      vibration: z.number().min(1).max(5),
      oilLeakage: z.number().min(1).max(5),
      productionAccuracy: z.number().min(1).max(5),
      notes: z.string().optional(),
    });
    const parsed = checkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const overallScore = Math.round(((parsed.data.noiseLevel + parsed.data.vibration + parsed.data.oilLeakage + parsed.data.productionAccuracy) / 20) * 100);
    const check = await storage.createHealthCheck({ ...parsed.data, overallScore });
    res.status(201).json(check);
  });

  app.post("/api/quotation-compare", async (req, res) => {
    const qFields = z.object({
      vendorName: z.string(),
      plateThickness: z.number(),
      shaftSize: z.number(),
      rollerMaterial: z.string(),
      gearbox: z.string(),
      warranty: z.number(),
      price: z.number(),
      deliveryDays: z.number().default(30),
      motorPower: z.number().default(5),
      stations: z.number().default(10),
      automation: z.string().default("Semi-Automatic"),
    });
    const compSchema = z.object({
      clientName: z.string().optional(),
      clientPhone: z.string().optional(),
      quotation1: qFields,
      quotation2: qFields,
    });
    const parsed = compSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const q1 = parsed.data.quotation1;
    const q2 = parsed.data.quotation2;

    const materialRank: Record<string, number> = { "D3": 5, "EN31": 4, "EN8": 3, "Alloy Steel": 3, "Chrome Plated": 4, "MS": 2, "other": 1 };
    const gearboxRank: Record<string, number> = { "Planetary": 5, "Helical Gear": 4, "Worm Gear": 3, "Chain Drive": 2, "Open Box": 1 };
    const autoRank: Record<string, number> = { "Fully Automatic": 5, "Semi-Automatic": 3, "Manual": 1 };

    function scoreQuotation(q: typeof q1) {
      let score = 0;
      score += Math.min(q.plateThickness / 5, 5) * 4;
      score += Math.min(q.shaftSize / 10, 5) * 4;
      score += (materialRank[q.rollerMaterial] || 1) * 4;
      score += (gearboxRank[q.gearbox] || 1) * 3;
      score += Math.min(q.warranty, 5) * 3;
      const priceScore = Math.max(5 - (q.price / 500000), 1);
      score += priceScore * 2;
      score += Math.min(q.motorPower / 3, 5) * 2;
      score += Math.min(q.stations / 3, 5) * 2;
      score += (autoRank[q.automation] || 1) * 2;
      const deliveryScore = Math.max(5 - (q.deliveryDays / 15), 1);
      score += deliveryScore * 1;
      return Math.round(score);
    }

    const score1 = scoreQuotation(q1);
    const score2 = scoreQuotation(q2);

    const comparison: Record<string, any> = {
      plateThickness: { q1: `${q1.plateThickness}mm`, q2: `${q2.plateThickness}mm`, winner: q1.plateThickness >= q2.plateThickness ? 1 : 2, label: "Plate Thickness" },
      shaftSize: { q1: `${q1.shaftSize}mm`, q2: `${q2.shaftSize}mm`, winner: q1.shaftSize >= q2.shaftSize ? 1 : 2, label: "Shaft Size" },
      rollerMaterial: { q1: q1.rollerMaterial, q2: q2.rollerMaterial, winner: (materialRank[q1.rollerMaterial] || 1) >= (materialRank[q2.rollerMaterial] || 1) ? 1 : 2, label: "Roller Material" },
      gearbox: { q1: q1.gearbox, q2: q2.gearbox, winner: (gearboxRank[q1.gearbox] || 1) >= (gearboxRank[q2.gearbox] || 1) ? 1 : 2, label: "Gearbox" },
      motorPower: { q1: `${q1.motorPower} HP`, q2: `${q2.motorPower} HP`, winner: q1.motorPower >= q2.motorPower ? 1 : 2, label: "Motor Power" },
      stations: { q1: `${q1.stations}`, q2: `${q2.stations}`, winner: q1.stations >= q2.stations ? 1 : 2, label: "Stations" },
      warranty: { q1: `${q1.warranty} months`, q2: `${q2.warranty} months`, winner: q1.warranty >= q2.warranty ? 1 : 2, label: "Warranty" },
      price: { q1: `₹${(q1.price / 100000).toFixed(1)}L`, q2: `₹${(q2.price / 100000).toFixed(1)}L`, winner: q1.price <= q2.price ? 1 : 2, label: "Price (lower wins)" },
      deliveryDays: { q1: `${q1.deliveryDays} days`, q2: `${q2.deliveryDays} days`, winner: q1.deliveryDays <= q2.deliveryDays ? 1 : 2, label: "Delivery (faster wins)" },
      automation: { q1: q1.automation, q2: q2.automation, winner: (autoRank[q1.automation] || 1) >= (autoRank[q2.automation] || 1) ? 1 : 2, label: "Automation" },
    };

    const comp = await storage.createComparison({
      clientName: parsed.data.clientName || null,
      clientPhone: parsed.data.clientPhone || null,
      quotation1: q1,
      quotation2: q2,
      comparisonResult: comparison,
      score1,
      score2,
    });
    res.status(201).json(comp);
  });

  app.get("/api/quotation-comparisons/:id", async (req, res) => {
    const comp = await storage.getComparison(req.params.id);
    if (!comp) return res.status(404).json({ message: "Comparison not found" });
    res.json(comp);
  });

  app.get("/api/banners", async (_req, res) => {
    const b = await storage.getActiveBanners();
    res.json(b);
  });

  app.get("/api/admin/banners", requireAdmin, async (_req, res) => {
    const b = await storage.getBanners();
    res.json(b);
  });

  app.post("/api/admin/banners", requireAdmin, async (req, res) => {
    const bannerSchema = z.object({
      title: z.string().min(1),
      subtitle: z.string().optional(),
      buttonText: z.string().optional(),
      buttonLink: z.string().optional(),
      bgColor: z.string().optional(),
      imageUrl: z.string().optional(),
      isActive: z.boolean().optional(),
      order: z.number().optional(),
    });
    const parsed = bannerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const banner = await storage.createBanner(parsed.data);
    res.status(201).json(banner);
  });

  app.patch("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    const updated = await storage.updateBanner(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Banner not found" });
    res.json(updated);
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    await storage.deleteBanner(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/analytics", requireAdmin, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    const leads = await storage.getLeads();
    const tickets = await storage.getSupportTickets();
    const appointments = await storage.getAppointments();
    const quotations = await storage.getQuotations();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentLeads = leads.filter(l => l.createdAt && new Date(l.createdAt) > thirtyDaysAgo);
    const weekLeads = leads.filter(l => l.createdAt && new Date(l.createdAt) > sevenDaysAgo);
    const convertedLeads = leads.filter(l => l.status === "converted");
    const conversionRate = leads.length > 0 ? Math.round((convertedLeads.length / leads.length) * 100) : 0;

    const leadsByStatus: Record<string, number> = {};
    leads.forEach(l => { leadsByStatus[l.status || "new"] = (leadsByStatus[l.status || "new"] || 0) + 1; });

    const leadsByInterest: Record<string, number> = {};
    leads.forEach(l => { leadsByInterest[l.interest || "other"] = (leadsByInterest[l.interest || "other"] || 0) + 1; });

    const ticketsByStatus: Record<string, number> = {};
    tickets.forEach(t => { ticketsByStatus[t.status] = (ticketsByStatus[t.status] || 0) + 1; });

    const totalQuoteValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
    const approvedQuotes = quotations.filter(q => q.status === "approved");
    const approvedValue = approvedQuotes.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

    res.json({
      ...stats,
      totalLeads: leads.length,
      recentLeads30d: recentLeads.length,
      recentLeads7d: weekLeads.length,
      convertedLeads: convertedLeads.length,
      conversionRate,
      leadsByStatus,
      leadsByInterest,
      totalTickets: tickets.length,
      ticketsByStatus,
      totalAppointments: appointments.length,
      completedVisits: appointments.filter(a => a.status === "completed").length,
      totalQuotations: quotations.length,
      totalQuoteValue,
      approvedQuotations: approvedQuotes.length,
      approvedValue,
    });
  });

  return httpServer;
}
