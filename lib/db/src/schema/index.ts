import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("buyer"),
  companyName: text("company_name"),
  gstNo: text("gst_no"),
  location: text("location"),
  state: text("state"),
  machineSpecialization: text("machine_specialization"),
  isVerified: boolean("is_verified").default(false),
  isApproved: boolean("is_approved").default(false),
  isEmailVerified: boolean("is_email_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  allowedDevices: text("allowed_devices").array(),
  lastDeviceFingerprint: text("last_device_fingerprint"),
  warningCount: integer("warning_count").default(0),
  isFrozen: boolean("is_frozen").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLoginAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull().default("email_verify"),
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type OtpCode = typeof otpCodes.$inferSelect;

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category").notNull(),
  machineType: text("machine_type").notNull(),
  profileType: text("profile_type"),
  cuttingType: text("cutting_type"),
  decoilerType: text("decoiler_type"),
  automation: text("automation").notNull(),
  model: text("model").notNull(),
  speed: text("speed"),
  motor: text("motor"),
  gauge: text("gauge"),
  stations: text("stations"),
  image: text("image").notNull(),
  gallery: text("gallery").array(),
  videoUrl: text("video_url"),
  description: text("description").notNull(),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  rawMaterialWeight: decimal("raw_material_weight", { precision: 10, scale: 4 }),
  isUsed: boolean("is_used").default(false),
  condition: text("condition"),
  location: text("location"),
  yearOfPurchase: text("year_of_purchase"),
  vendorId: text("vendor_id"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const dealers = pgTable("dealers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),
  email: text("email"),
  location: text("location").notNull(),
  state: text("state").notNull(),
  city: text("city"),
  pincode: text("pincode"),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  ratingCount: integer("rating_count").default(0),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  rateGauge: text("rate_gauge"),
  gstNo: text("gst_no"),
  isGstVerified: boolean("is_gst_verified").default(false),
  isFrozen: boolean("is_frozen").default(false),
  isActive: boolean("is_active").default(true),
  companyName: text("company_name"),
  address: text("address"),
  mapUrl: text("map_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDealerSchema = createInsertSchema(dealers).omit({ id: true, createdAt: true });
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Dealer = typeof dealers.$inferSelect;

export const operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  aadhaarNo: text("aadhaar_no"),
  experience: text("experience").notNull(),
  machineType: text("machine_type"),
  previousSalary: text("previous_salary"),
  expectedSalary: text("expected_salary"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  location: text("location"),
  specialization: text("specialization"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOperatorSchema = createInsertSchema(operators).omit({ id: true, createdAt: true });
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type Operator = typeof operators.$inferSelect;

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().default("image"),
  caption: text("caption").notNull(),
  author: text("author").notNull(),
  userId: text("user_id"),
  likes: integer("likes").default(0),
  images: text("images").array(),
  videoUrl: text("video_url"),
  youtubeUrl: text("youtube_url"),
  reportCount: integer("report_count").default(0),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, reportCount: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const postReports = pgTable("post_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: text("post_id").notNull(),
  reporterUserId: text("reporter_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("idx_post_reports_unique").on(table.postId, table.reporterUserId),
]);

export const insertPostReportSchema = createInsertSchema(postReports).omit({ id: true, createdAt: true });
export type InsertPostReport = z.infer<typeof insertPostReportSchema>;
export type PostReport = typeof postReports.$inferSelect;

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  city: text("city"),
  location: text("location"),
  interest: text("interest"),
  machineType: text("machine_type"),
  source: text("source").default("phone"),
  status: text("status").default("NORMAL"),
  financeRequired: boolean("finance_required").default(false),
  financeStage: text("finance_stage"),
  confidenceScore: integer("confidence_score").default(0),
  expectedAmount: text("expected_amount"),
  machineModel: text("machine_model"),
  notes: text("notes"),
  nextFollowupDate: text("next_followup_date"),
  lastContactedAt: timestamp("last_contacted_at"),
  visitScheduledAt: timestamp("visit_scheduled_at"),
  visitNotes: text("visit_notes"),
  isStopList: boolean("is_stop_list").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const followupReminders = pgTable("followup_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  reminderDate: text("reminder_date").notNull(),
  reminderTime: text("reminder_time").default("10:00"),
  message: text("message"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFollowupReminderSchema = createInsertSchema(followupReminders).omit({ id: true, createdAt: true });
export type InsertFollowupReminder = z.infer<typeof insertFollowupReminderSchema>;
export type FollowupReminder = typeof followupReminders.$inferSelect;

export const leadScoring = pgTable("lead_scoring", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  purchaseTimeline: text("purchase_timeline"),
  purchaseTimelineScore: integer("purchase_timeline_score").default(0),
  budgetClarity: text("budget_clarity"),
  budgetScore: integer("budget_score").default(0),
  technicalInterest: text("technical_interest"),
  technicalScore: integer("technical_score").default(0),
  visitCount: integer("visit_count").default(1),
  engagementScore: integer("engagement_score").default(0),
  responseSpeed: text("response_speed"),
  responseScore: integer("response_score").default(0),
  documentUploaded: boolean("document_uploaded").default(false),
  documentScore: integer("document_score").default(0),
  totalScore: integer("total_score").default(0),
  leadStatus: text("lead_status").default("COLD"),
  firstEnquiryDate: timestamp("first_enquiry_date"),
  quotationSent: boolean("quotation_sent").default(false),
  comparisonViewed: boolean("comparison_viewed").default(false),
  lastFollowupResponse: timestamp("last_followup_response"),
  lastChatbotInteraction: timestamp("last_chatbot_interaction"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadScoringSchema = createInsertSchema(leadScoring).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLeadScoring = z.infer<typeof insertLeadScoringSchema>;
export type LeadScoring = typeof leadScoring.$inferSelect;

export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  phone: text("phone").notNull(),
  machineType: text("machine_type").notNull(),
  problem: text("problem").notNull(),
  urgency: text("urgency").default("normal"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({ id: true, createdAt: true });
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;

export const subsidies = pgTable("subsidies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  eligibility: text("eligibility").notNull(),
  subsidy: text("subsidy").notNull(),
  applyUrl: text("apply_url"),
  state: text("state"),
  category: text("category").notNull(),
});

export const insertSubsidySchema = createInsertSchema(subsidies).omit({ id: true });
export type InsertSubsidy = z.infer<typeof insertSubsidySchema>;
export type Subsidy = typeof subsidies.$inferSelect;

export const spareParts = pgTable("spare_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: text("price").notNull(),
  image: text("image"),
  category: text("category").notNull(),
});

export const insertSparePartSchema = createInsertSchema(spareParts).omit({ id: true });
export type InsertSparePart = z.infer<typeof insertSparePartSchema>;
export type SparePart = typeof spareParts.$inferSelect;

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  buyerEmail: text("buyer_email"),
  purpose: text("purpose").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  status: text("status").default("pending"),
  passCode: text("pass_code"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, passCode: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const supplierProfiles = pgTable("supplier_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  companyName: text("company_name").notNull(),
  ownerName: text("owner_name").notNull(),
  gstNo: text("gst_no"),
  businessType: text("business_type").notNull().default("Manufacturer"),
  establishedYear: text("established_year"),
  totalEmployees: text("total_employees"),
  factoryAddress: text("factory_address"),
  state: text("state").notNull(),
  city: text("city").notNull(),
  pincode: text("pincode"),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  description: text("description"),
  specialization: text("specialization"),
  serviceArea: text("service_area"),
  deliveryCapability: text("delivery_capability"),
  logo: text("logo"),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0"),
  ratingCount: integer("rating_count").default(0),
  isGstVerified: boolean("is_gst_verified").default(false),
  isPremium: boolean("is_premium").default(false),
  isVerified: boolean("is_verified").default(false),
  isTopRated: boolean("is_top_rated").default(false),
  isFastResponder: boolean("is_fast_responder").default(false),
  responseTime: text("response_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierProfileSchema = createInsertSchema(supplierProfiles).omit({ id: true, createdAt: true, rating: true, ratingCount: true });
export type InsertSupplierProfile = z.infer<typeof insertSupplierProfileSchema>;
export type SupplierProfile = typeof supplierProfiles.$inferSelect;

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: text("supplier_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  reviewerPhone: text("reviewer_phone"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerifiedBuyer: boolean("is_verified_buyer").default(false),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  buyerEmail: text("buyer_email"),
  machineName: text("machine_name").notNull(),
  problemType: text("problem_type").notNull(),
  description: text("description").notNull(),
  imageUrls: text("image_urls").array(),
  videoUrl: text("video_url"),
  urgency: text("urgency").notNull().default("normal"),
  status: text("status").notNull().default("open"),
  assignedPartner: text("assigned_partner"),
  adminNotes: text("admin_notes"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true, ticketNumber: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export const amcPlans = pgTable("amc_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  visitsPerYear: integer("visits_per_year").notNull(),
  price1Year: text("price_1_year").notNull(),
  price2Year: text("price_2_year"),
  features: text("features").array(),
  phoneSupport: boolean("phone_support").default(false),
  prioritySupport: boolean("priority_support").default(false),
  emergencySupport: boolean("emergency_support").default(false),
  freeLabor: boolean("free_labor").default(false),
  spareParts: text("spare_parts"),
  dedicatedPartner: boolean("dedicated_partner").default(false),
  isPopular: boolean("is_popular").default(false),
});

export const insertAmcPlanSchema = createInsertSchema(amcPlans).omit({ id: true });
export type InsertAmcPlan = z.infer<typeof insertAmcPlanSchema>;
export type AmcPlan = typeof amcPlans.$inferSelect;

export const amcSubscriptions = pgTable("amc_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionNumber: text("subscription_number").notNull().unique(),
  planId: text("plan_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  buyerEmail: text("buyer_email"),
  companyName: text("company_name"),
  machineName: text("machine_name").notNull(),
  machineModel: text("machine_model"),
  installationDate: text("installation_date"),
  duration: text("duration").notNull().default("1_year"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  amount: text("amount").notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").notNull().default("pending"),
  nextVisitDate: text("next_visit_date"),
  completedVisits: integer("completed_visits").default(0),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAmcSubscriptionSchema = createInsertSchema(amcSubscriptions).omit({ id: true, createdAt: true, subscriptionNumber: true, completedVisits: true });
export type InsertAmcSubscription = z.infer<typeof insertAmcSubscriptionSchema>;
export type AmcSubscription = typeof amcSubscriptions.$inferSelect;

export const machineDocuments = pgTable("machine_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  fileType: text("file_type").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  machineCategory: text("machine_category"),
  machineModel: text("machine_model"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMachineDocumentSchema = createInsertSchema(machineDocuments).omit({ id: true, createdAt: true });
export type InsertMachineDocument = z.infer<typeof insertMachineDocumentSchema>;
export type MachineDocument = typeof machineDocuments.$inferSelect;

export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionNumber: text("inspection_number").notNull().unique(),
  machineModel: text("machine_model").notNull(),
  machineCategory: text("machine_category").notNull(),
  customerName: text("customer_name"),
  inspectorName: text("inspector_name").notNull(),
  status: text("status").notNull().default("in_progress"),
  items: jsonb("items").notNull(),
  overallResult: text("overall_result"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({ id: true, createdAt: true, inspectionNumber: true });
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;

export const isoDocuments = pgTable("iso_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentNumber: text("document_number").notNull().unique(),
  title: text("title").notNull(),
  isoClause: text("iso_clause").notNull(),
  category: text("category").notNull(),
  revision: text("revision").notNull().default("01"),
  status: text("status").notNull().default("draft"),
  approvedBy: text("approved_by"),
  effectiveDate: text("effective_date"),
  nextReviewDate: text("next_review_date"),
  description: text("description"),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIsoDocumentSchema = createInsertSchema(isoDocuments).omit({ id: true, createdAt: true, updatedAt: true, documentNumber: true });
export type InsertIsoDocument = z.infer<typeof insertIsoDocumentSchema>;
export type IsoDocument = typeof isoDocuments.$inferSelect;

export const isoAudits = pgTable("iso_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditNumber: text("audit_number").notNull().unique(),
  auditType: text("audit_type").notNull(),
  auditorName: text("auditor_name").notNull(),
  department: text("department").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  completedDate: text("completed_date"),
  status: text("status").notNull().default("scheduled"),
  findings: jsonb("findings"),
  nonConformities: integer("non_conformities").default(0),
  observations: integer("observations").default(0),
  improvements: integer("improvements").default(0),
  overallResult: text("overall_result"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIsoAuditSchema = createInsertSchema(isoAudits).omit({ id: true, createdAt: true, auditNumber: true });
export type InsertIsoAudit = z.infer<typeof insertIsoAuditSchema>;
export type IsoAudit = typeof isoAudits.$inferSelect;

export const capas = pgTable("capas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  capaNumber: text("capa_number").notNull().unique(),
  type: text("type").notNull(),
  source: text("source").notNull(),
  description: text("description").notNull(),
  rootCause: text("root_cause"),
  correctiveAction: text("corrective_action"),
  preventiveAction: text("preventive_action"),
  assignedTo: text("assigned_to").notNull(),
  targetDate: text("target_date").notNull(),
  completedDate: text("completed_date"),
  status: text("status").notNull().default("open"),
  effectiveness: text("effectiveness"),
  isoClause: text("iso_clause"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCapaSchema = createInsertSchema(capas).omit({ id: true, createdAt: true, capaNumber: true });
export type InsertCapa = z.infer<typeof insertCapaSchema>;
export type Capa = typeof capas.$inferSelect;

export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationNumber: text("quotation_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  companyName: text("company_name"),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  gstNo: text("gst_no"),
  customerAddress: text("customer_address"),
  projectName: text("project_name"),
  machineCategory: text("machine_category").notNull(),
  profileType: text("profile_type").notNull(),
  machineModel: text("machine_model"),
  tier: text("tier").notNull(),
  automation: text("automation").notNull(),
  rolls: integer("rolls").notNull(),
  cuttingType: text("cutting_type"),
  decoilerType: text("decoiler_type"),
  quantity: integer("quantity").notNull().default(1),
  singlePrice: integer("single_price").notNull(),
  totalBeforeDiscount: integer("total_before_discount").notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default("0"),
  discountAmount: integer("discount_amount").default(0),
  subtotal: integer("subtotal").notNull(),
  gstAmount: integer("gst_amount").notNull(),
  grandTotal: integer("grand_total").notNull(),
  deliveryDays: integer("delivery_days").notNull(),
  addOns: text("add_ons"),
  dealerMargin: integer("dealer_margin").default(0),
  accessCode: text("access_code").notNull(),
  status: text("status").notNull().default("sent"),
  validUntil: text("valid_until").notNull(),
  preparedBy: text("prepared_by").notNull().default("Sai Rolotech"),
  viewedAt: timestamp("viewed_at"),
  downloadedAt: timestamp("downloaded_at"),
  approvedAt: timestamp("approved_at"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true, quotationNumber: true, viewedAt: true, downloadedAt: true, approvedAt: true });
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`'default'`),
  companyName: text("company_name").default("Sai Rolotech"),
  whatsappNumber: text("whatsapp_number").default("919090486262"),
  supportNumber: text("support_number").default("919090486262"),
  currentCoilRate: decimal("current_coil_rate", { precision: 10, scale: 2 }),
  address: text("address"),
  chatbotEnabled: boolean("chatbot_enabled").default(true),
  whatsappButtonEnabled: boolean("whatsapp_button_enabled").default(true),
  splashScreenEnabled: boolean("splash_screen_enabled").default(true),
  visitorCounterEnabled: boolean("visitor_counter_enabled").default(true),
  marketRateEnabled: boolean("market_rate_enabled").default(true),
  quickActionsEnabled: boolean("quick_actions_enabled").default(true),
  bannerCarouselEnabled: boolean("banner_carousel_enabled").default(true),
  socialFeedEnabled: boolean("social_feed_enabled").default(true),
  heroTagline: text("hero_tagline").default("Industrial Ecosystem"),
  chatbotWelcomeMessage: text("chatbot_welcome_message").default("Namaste! I'm Sai Rolotech's assistant. Ask me about our machines, pricing, delivery, or anything else!"),
  announcementText: text("announcement_text"),
  announcementEnabled: boolean("announcement_enabled").default(false),
  maintenanceMode: boolean("maintenance_mode").default(false),
  assistantPin: text("assistant_pin"),
});

export type AppSettings = typeof appSettings.$inferSelect;

export const marketPrices = pgTable("market_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  material: text("material").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }),
  unit: text("unit").notNull().default("per_kg"),
  trend: text("trend").notNull().default("stable"),
  prediction: text("prediction"),
  upChance: integer("up_chance"),
  downChance: integer("down_chance"),
  updateSlot: text("update_slot"),
  region: text("region").default("Delhi-Mundka"),
  updatedBy: text("updated_by"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketPriceSchema = createInsertSchema(marketPrices).omit({ id: true, createdAt: true });
export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;
export type MarketPrice = typeof marketPrices.$inferSelect;

export const machineHealthChecks = pgTable("machine_health_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operatorName: text("operator_name").notNull(),
  operatorPhone: text("operator_phone"),
  machineModel: text("machine_model").notNull(),
  machineCategory: text("machine_category").notNull(),
  noiseLevel: integer("noise_level").notNull(),
  vibration: integer("vibration").notNull(),
  oilLeakage: integer("oil_leakage").notNull(),
  productionAccuracy: integer("production_accuracy").notNull(),
  overallScore: integer("overall_score").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHealthCheckSchema = createInsertSchema(machineHealthChecks).omit({ id: true, createdAt: true });
export type InsertHealthCheck = z.infer<typeof insertHealthCheckSchema>;
export type HealthCheck = typeof machineHealthChecks.$inferSelect;

export const quotationComparisons = pgTable("quotation_comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  quotation1: jsonb("quotation1").notNull(),
  quotation2: jsonb("quotation2").notNull(),
  comparisonResult: jsonb("comparison_result").notNull(),
  score1: integer("score1").notNull(),
  score2: integer("score2").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertComparisonSchema = createInsertSchema(quotationComparisons).omit({ id: true, createdAt: true });
export type InsertComparison = z.infer<typeof insertComparisonSchema>;
export type QuotationComparison = typeof quotationComparisons.$inferSelect;

export const banners = pgTable("banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  bgColor: text("bg_color").notNull().default("from-indigo-600 to-purple-600"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({ id: true, createdAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;
