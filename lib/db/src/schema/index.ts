import { z } from "zod";
import { pgTable, varchar, text, boolean, decimal, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export interface User {
  id: string;
  username: string;
  password: string;
  email: string | null;
  name: string;
  phone: string;
  role: string;
  companyName: string | null;
  gstNo: string | null;
  location: string | null;
  state: string | null;
  machineSpecialization: string | null;
  isVerified: boolean | null;
  isApproved: boolean | null;
  isEmailVerified: boolean | null;
  twoFactorEnabled: boolean | null;
  twoFactorSecret: string | null;
  allowedDevices: string[] | null;
  lastDeviceFingerprint: string | null;
  warningCount: number | null;
  isFrozen: boolean | null;
  failedLoginAttempts: number | null;
  accountLockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date | null;
}

export type InsertUser = Omit<User, "id" | "createdAt" | "lastLoginAt">;

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().nullable().optional(),
  name: z.string(),
  phone: z.string(),
  role: z.string().default("buyer"),
  companyName: z.string().nullable().optional(),
  gstNo: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  machineSpecialization: z.string().nullable().optional(),
  isVerified: z.boolean().nullable().optional(),
  isApproved: z.boolean().nullable().optional(),
  isEmailVerified: z.boolean().nullable().optional(),
  twoFactorEnabled: z.boolean().nullable().optional(),
  twoFactorSecret: z.string().nullable().optional(),
  allowedDevices: z.array(z.string()).nullable().optional(),
  lastDeviceFingerprint: z.string().nullable().optional(),
  warningCount: z.number().nullable().optional(),
  isFrozen: z.boolean().nullable().optional(),
});

export interface OtpCode {
  id: string;
  userId: string | null;
  email: string;
  code: string;
  purpose: string;
  isUsed: boolean | null;
  expiresAt: Date;
  createdAt: Date | null;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  machineType: string;
  profileType: string | null;
  cuttingType: string | null;
  decoilerType: string | null;
  automation: string;
  model: string;
  speed: string | null;
  motor: string | null;
  gauge: string | null;
  stations: string | null;
  image: string;
  gallery: string[] | null;
  videoUrl: string | null;
  description: string;
  estimatedPrice: string | null;
  rawMaterialWeight: string | null;
  isUsed: boolean | null;
  condition: string | null;
  location: string | null;
  yearOfPurchase: string | null;
  vendorId: string | null;
}

export type InsertProduct = Omit<Product, "id">;

export interface Dealer {
  id: string;
  name: string;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  location: string;
  state: string;
  city: string | null;
  pincode: string | null;
  rating: string | null;
  ratingCount: number | null;
  dailyRate: string | null;
  rateGauge: string | null;
  gstNo: string | null;
  isGstVerified: boolean | null;
  isFrozen: boolean | null;
  isActive: boolean | null;
  companyName: string | null;
  address: string | null;
  mapUrl: string | null;
  notes: string | null;
  createdAt: Date | null;
}

export type InsertDealer = Omit<Dealer, "id" | "createdAt">;

export interface Operator {
  id: string;
  name: string;
  phone: string;
  aadhaarNo: string | null;
  experience: string;
  machineType: string | null;
  previousSalary: string | null;
  expectedSalary: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  location: string | null;
  specialization: string | null;
  createdAt: Date | null;
}

export type InsertOperator = Omit<Operator, "id" | "createdAt">;

export interface Post {
  id: string;
  type: string;
  caption: string;
  author: string;
  userId: string | null;
  likes: number | null;
  images: string[] | null;
  videoUrl: string | null;
  youtubeUrl: string | null;
  mediaType: string | null;
  isAdminPost: boolean | null;
  reportCount: number | null;
  isApproved: boolean | null;
  createdAt: Date | null;
}

export type InsertPost = Omit<Post, "id" | "createdAt" | "reportCount">;

export interface PostReport {
  id: string;
  postId: string;
  reporterUserId: string;
  createdAt: Date | null;
}

export type InsertPostReport = Omit<PostReport, "id" | "createdAt">;

export interface Lead {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  location: string | null;
  interest: string | null;
  machineType: string | null;
  source: string | null;
  status: string | null;
  financeRequired: boolean | null;
  financeStage: string | null;
  confidenceScore: number | null;
  expectedAmount: string | null;
  machineModel: string | null;
  notes: string | null;
  nextFollowupDate: string | null;
  lastContactedAt: Date | null;
  visitScheduledAt: Date | null;
  visitNotes: string | null;
  isStopList: boolean | null;
  createdAt: Date | null;
}

export type InsertLead = Omit<Lead, "id" | "createdAt">;

export interface FollowupReminder {
  id: string;
  leadId: string;
  reminderDate: string;
  reminderTime: string | null;
  message: string | null;
  isCompleted: boolean | null;
  completedAt: Date | null;
  createdAt: Date | null;
}

export type InsertFollowupReminder = Omit<FollowupReminder, "id" | "createdAt">;

export interface LeadScoring {
  id: string;
  leadId: string;
  purchaseTimeline: string | null;
  purchaseTimelineScore: number | null;
  budgetClarity: string | null;
  budgetScore: number | null;
  technicalInterest: string | null;
  technicalScore: number | null;
  visitCount: number | null;
  engagementScore: number | null;
  responseSpeed: string | null;
  responseScore: number | null;
  documentUploaded: boolean | null;
  documentScore: number | null;
  totalScore: number | null;
  leadStatus: string | null;
  firstEnquiryDate: Date | null;
  quotationSent: boolean | null;
  comparisonViewed: boolean | null;
  lastFollowupResponse: Date | null;
  lastChatbotInteraction: Date | null;
  updatedAt: Date | null;
  createdAt: Date | null;
}

export type InsertLeadScoring = Omit<LeadScoring, "id" | "createdAt" | "updatedAt">;

export interface ServiceRequest {
  id: string;
  clientName: string;
  phone: string;
  machineType: string;
  problem: string;
  urgency: string | null;
  status: string | null;
  createdAt: Date | null;
}

export type InsertServiceRequest = Omit<ServiceRequest, "id" | "createdAt">;

export interface Subsidy {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  subsidy: string;
  applyUrl: string | null;
  state: string | null;
  category: string;
}

export type InsertSubsidy = Omit<Subsidy, "id">;

export interface SparePart {
  id: string;
  name: string;
  price: string;
  image: string | null;
  category: string;
}

export type InsertSparePart = Omit<SparePart, "id">;

export interface Appointment {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  purpose: string;
  preferredDate: string;
  preferredTime: string;
  status: string | null;
  passCode: string | null;
  notes: string | null;
  createdAt: Date | null;
}

export type InsertAppointment = Omit<Appointment, "id" | "createdAt" | "passCode">;

export interface SupplierProfile {
  id: string;
  userId: string | null;
  companyName: string;
  ownerName: string;
  gstNo: string | null;
  businessType: string;
  establishedYear: string | null;
  totalEmployees: string | null;
  factoryAddress: string | null;
  state: string;
  city: string;
  pincode: string | null;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  whatsapp: string | null;
  description: string | null;
  specialization: string | null;
  serviceArea: string | null;
  deliveryCapability: string | null;
  logo: string | null;
  rating: string | null;
  ratingCount: number | null;
  isGstVerified: boolean | null;
  isPremium: boolean | null;
  isVerified: boolean | null;
  isTopRated: boolean | null;
  isFastResponder: boolean | null;
  responseTime: string | null;
  createdAt: Date | null;
}

export type InsertSupplierProfile = Omit<SupplierProfile, "id" | "createdAt" | "rating" | "ratingCount">;

export interface Review {
  id: string;
  supplierId: string;
  reviewerName: string;
  reviewerPhone: string | null;
  rating: number;
  comment: string | null;
  isVerifiedBuyer: boolean | null;
  isApproved: boolean | null;
  createdAt: Date | null;
}

export type InsertReview = Omit<Review, "id" | "createdAt">;

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  machineName: string;
  problemType: string;
  description: string;
  imageUrls: string[] | null;
  videoUrl: string | null;
  urgency: string;
  status: string;
  assignedPartner: string | null;
  adminNotes: string | null;
  resolution: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertSupportTicket = Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "ticketNumber">;

export interface AmcPlan {
  id: string;
  name: string;
  tier: string;
  visitsPerYear: number;
  price1Year: string;
  price2Year: string | null;
  features: string[] | null;
  phoneSupport: boolean | null;
  prioritySupport: boolean | null;
  emergencySupport: boolean | null;
  freeLabor: boolean | null;
  spareParts: string | null;
  dedicatedPartner: boolean | null;
  isPopular: boolean | null;
}

export type InsertAmcPlan = Omit<AmcPlan, "id">;

export interface AmcSubscription {
  id: string;
  subscriptionNumber: string;
  planId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  companyName: string | null;
  machineName: string;
  machineModel: string | null;
  installationDate: string | null;
  duration: string;
  startDate: string;
  endDate: string;
  amount: string;
  paymentMethod: string | null;
  status: string;
  nextVisitDate: string | null;
  completedVisits: number | null;
  adminNotes: string | null;
  createdAt: Date | null;
}

export type InsertAmcSubscription = Omit<AmcSubscription, "id" | "createdAt" | "subscriptionNumber" | "completedVisits">;

export interface MachineDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileType: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  machineCategory: string | null;
  machineModel: string | null;
  uploadedBy: string | null;
  createdAt: Date | null;
}

export type InsertMachineDocument = Omit<MachineDocument, "id" | "createdAt">;

export interface Inspection {
  id: string;
  inspectionNumber: string;
  machineModel: string;
  machineCategory: string;
  customerName: string | null;
  inspectorName: string;
  status: string;
  items: any;
  overallResult: string | null;
  notes: string | null;
  createdAt: Date | null;
}

export type InsertInspection = Omit<Inspection, "id" | "createdAt" | "inspectionNumber">;

export interface IsoDocument {
  id: string;
  documentNumber: string;
  title: string;
  isoClause: string;
  category: string;
  revision: string;
  status: string;
  approvedBy: string | null;
  effectiveDate: string | null;
  nextReviewDate: string | null;
  description: string | null;
  filePath: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertIsoDocument = Omit<IsoDocument, "id" | "createdAt" | "updatedAt" | "documentNumber">;

export interface IsoAudit {
  id: string;
  auditNumber: string;
  auditType: string;
  auditorName: string;
  department: string;
  scheduledDate: string;
  completedDate: string | null;
  status: string;
  findings: any;
  nonConformities: number | null;
  observations: number | null;
  improvements: number | null;
  overallResult: string | null;
  notes: string | null;
  createdAt: Date | null;
}

export type InsertIsoAudit = Omit<IsoAudit, "id" | "createdAt" | "auditNumber">;

export interface Capa {
  id: string;
  capaNumber: string;
  type: string;
  source: string;
  description: string;
  rootCause: string | null;
  correctiveAction: string | null;
  preventiveAction: string | null;
  assignedTo: string;
  targetDate: string;
  completedDate: string | null;
  status: string;
  effectiveness: string | null;
  isoClause: string | null;
  priority: string;
  createdAt: Date | null;
}

export type InsertCapa = Omit<Capa, "id" | "createdAt" | "capaNumber">;

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  companyName: string | null;
  customerPhone: string;
  customerEmail: string | null;
  gstNo: string | null;
  customerAddress: string | null;
  projectName: string | null;
  machineCategory: string;
  profileType: string;
  machineModel: string | null;
  tier: string;
  automation: string;
  rolls: number;
  cuttingType: string | null;
  decoilerType: string | null;
  quantity: number;
  singlePrice: number;
  totalBeforeDiscount: number;
  discountPercent: string | null;
  discountAmount: number | null;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  deliveryDays: number;
  addOns: string | null;
  dealerMargin: number | null;
  accessCode: string;
  status: string;
  validUntil: string;
  preparedBy: string;
  viewedAt: Date | null;
  downloadedAt: Date | null;
  approvedAt: Date | null;
  adminNotes: string | null;
  approvalStatus: string | null;
  approvalNote: string | null;
  flaggedReason: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertQuotation = Omit<Quotation, "id" | "createdAt" | "updatedAt" | "quotationNumber" | "viewedAt" | "downloadedAt" | "approvedAt">;

export interface AppSettings {
  id: string;
  companyName: string | null;
  whatsappNumber: string | null;
  supportNumber: string | null;
  currentCoilRate: string | null;
  address: string | null;
  chatbotEnabled: boolean | null;
  whatsappButtonEnabled: boolean | null;
  splashScreenEnabled: boolean | null;
  visitorCounterEnabled: boolean | null;
  marketRateEnabled: boolean | null;
  quickActionsEnabled: boolean | null;
  bannerCarouselEnabled: boolean | null;
  socialFeedEnabled: boolean | null;
  heroTagline: string | null;
  chatbotWelcomeMessage: string | null;
  announcementText: string | null;
  announcementEnabled: boolean | null;
  maintenanceMode: boolean | null;
  assistantPin: string | null;
  vapidPublicKey: string | null;
  metaAccessToken: string | null;
  metaPageId: string | null;
  metaInstagramAccountId: string | null;
  approvalDiscountThreshold: number | null;
  approvalPriceThreshold: number | null;
}

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
  metaAccessToken: text("meta_access_token"),
  metaPageId: text("meta_page_id"),
  metaInstagramAccountId: text("meta_instagram_account_id"),
});

export interface MarketPrice {
  id: string;
  material: string;
  price: string;
  previousPrice: string | null;
  unit: string;
  trend: string;
  prediction: string | null;
  upChance: number | null;
  downChance: number | null;
  updateSlot: string | null;
  region: string | null;
  updatedBy: string | null;
  date: string;
  createdAt: Date | null;
}

export type InsertMarketPrice = Omit<MarketPrice, "id" | "createdAt">;

export interface HealthCheck {
  id: string;
  operatorName: string;
  operatorPhone: string | null;
  machineModel: string;
  machineCategory: string;
  noiseLevel: number;
  vibration: number;
  oilLeakage: number;
  productionAccuracy: number;
  overallScore: number;
  notes: string | null;
  createdAt: Date | null;
}

export type InsertHealthCheck = Omit<HealthCheck, "id" | "createdAt">;

export interface UserConsent {
  id: string;
  userId: string;
  category: string;
  status: string;
  ip: string | null;
  consentVersion: string;
  withdrawnAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertUserConsent = Omit<UserConsent, "id" | "createdAt" | "updatedAt">;

export interface AssemblyTask {
  id: string;
  taskName: string;
  assignedTeam: string | null;
  dueDate: string;
  status: string;
  urgency: string;
  notes: string | null;
  assignedTo: string | null;
  createdBy: string | null;
  completedAt: Date | null;
  createdAt: Date | null;
}

export type InsertAssemblyTask = Omit<AssemblyTask, "id" | "createdAt" | "completedAt">;

export interface NotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date | null;
}

export type PushSubscription = NotificationSubscription;

export type InsertNotificationSubscription = Omit<NotificationSubscription, "id" | "createdAt">;

export interface AuditLog {
  id: string;
  eventType: string;
  userId: string | null;
  username: string | null;
  ip: string | null;
  deviceFingerprint: string | null;
  metadata: any;
  createdAt: Date | null;
}

export type InsertAuditLog = Omit<AuditLog, "id" | "createdAt">;

export interface ActiveSession {
  id: string;
  sid: string;
  userId: string;
  username: string | null;
  ip: string | null;
  deviceFingerprint: string | null;
  lastActive: Date | null;
  createdAt: Date | null;
}

export type InsertActiveSession = Omit<ActiveSession, "id" | "createdAt" | "lastActive">;

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

export const broadcastPosts = pgTable("broadcast_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  image: text("image"),
  audience: text("audience").notNull().default("all"),
  postToSocialMedia: boolean("post_to_social_media").default(false),
  facebookPostId: text("facebook_post_id"),
  facebookPostUrl: text("facebook_post_url"),
  instagramPostId: text("instagram_post_id"),
  instagramPostUrl: text("instagram_post_url"),
  socialMediaStatus: text("social_media_status").default("none"),
  socialMediaError: text("social_media_error"),
  viewCount: integer("view_count").default(0),
  targetUserCount: integer("target_user_count").default(0),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBroadcastPostSchema = createInsertSchema(broadcastPosts).omit({ id: true, createdAt: true, viewCount: true, targetUserCount: true });
export type InsertBroadcastPost = z.infer<typeof insertBroadcastPostSchema>;
export type BroadcastPost = typeof broadcastPosts.$inferSelect;

export const broadcastNotificationPrefs = pgTable("broadcast_notification_prefs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BroadcastNotificationPref = typeof broadcastNotificationPrefs.$inferSelect;

export interface Referral {
  id: string;
  referrerUserId: string;
  referralCode: string;
  referredUserId: string | null;
  referredName: string | null;
  referredPhone: string | null;
  status: string;
  createdAt: Date | null;
}

export type InsertReferral = Omit<Referral, "id" | "createdAt">;

export interface ReferralReward {
  id: string;
  userId: string;
  rewardType: string;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  createdAt: Date | null;
}

export type InsertReferralReward = Omit<ReferralReward, "id" | "createdAt">;

export interface IndustryData {
  id: string;
  type: string;
  title: string;
  value: string | null;
  city: string | null;
  description: string | null;
  videoUrl: string | null;
  updatedBy: string | null;
  updatedAt: Date | null;
  createdAt: Date | null;
}

export type InsertIndustryData = Omit<IndustryData, "id" | "createdAt">;

export interface ProductionPost {
  id: string;
  userId: string;
  factoryName: string;
  tonnage: string;
  note: string | null;
  date: string;
  likes: number | null;
  createdAt: Date | null;
}

export type InsertProductionPost = Omit<ProductionPost, "id" | "createdAt">;

export const broadcastNotifications = pgTable("broadcast_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  broadcastPostId: text("broadcast_post_id").notNull(),
  userId: text("user_id").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBroadcastNotificationSchema = createInsertSchema(broadcastNotifications).omit({ id: true, createdAt: true });
export type InsertBroadcastNotification = z.infer<typeof insertBroadcastNotificationSchema>;
export type BroadcastNotification = typeof broadcastNotifications.$inferSelect;

export interface VendorMaterial {
  id: string;
  vendorId: string;
  poNumber: string;
  materialType: string;
  quantity: number;
  unit: string;
  date: string;
  expectedDate: string | null;
  status: string;
  notes: string | null;
  createdAt: Date | null;
}

export type InsertVendorMaterial = Omit<VendorMaterial, "id" | "createdAt">;

export interface VendorBill {
  id: string;
  vendorId: string;
  poNumber: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  amount: string | null;
  status: string;
  adminNotes: string | null;
  uploadedAt: Date | null;
  verifiedAt: Date | null;
}

export type InsertVendorBill = Omit<VendorBill, "id" | "uploadedAt" | "verifiedAt">;

export interface Manufacturer {
  id: string;
  name: string;
  companyName: string | null;
  city: string;
  state: string | null;
  rank: number | null;
  userId: string | null;
  phone: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  products: string[] | null;
  materials: string[] | null;
  machineTypes: string[] | null;
  productionCapacity: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  description: string | null;
  logo: string | null;
  isActive: boolean | null;
  badgeColor: string | null;
  createdAt: Date | null;
}

export interface VideoCallSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxBookings: number;
  currentBookings: number;
  engineerName: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

export type InsertManufacturer = Omit<Manufacturer, "id" | "createdAt">;

export interface MachineOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  machineType: string;
  machineModel: string | null;
  quantity: number;
  status: string;
  timeline: string | null;
  expectedDelivery: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertMachineOrder = Omit<MachineOrder, "id" | "createdAt" | "updatedAt" | "orderNumber">;

export interface ProductionWorkflow {
  id: string;
  jobId: string;
  orderNumber: string | null;
  machineName: string;
  currentStage: string;
  stages: string[];
  assignedTo: string | null;
  priority: string | null;
  notes: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertProductionWorkflow = Omit<ProductionWorkflow, "id" | "createdAt" | "updatedAt" | "jobId">;

export interface JobWork {
  id: string;
  vendorName: string;
  vendorPhone: string | null;
  workDescription: string;
  machinePart: string | null;
  quantity: number | null;
  sentDate: string;
  expectedReturn: string | null;
  actualReturn: string | null;
  status: string;
  cost: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertJobWork = Omit<JobWork, "id" | "createdAt" | "updatedAt">;

export interface MaterialRequest {
  id: string;
  requestNumber: string;
  vendorId: string | null;
  vendorName: string;
  materialName: string;
  quantity: string;
  unit: string | null;
  urgency: string | null;
  requestedBy: string;
  status: string;
  adminNotes: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertMaterialRequest = Omit<MaterialRequest, "id" | "createdAt" | "updatedAt" | "requestNumber">;

export interface EngineerNote {
  id: string;
  entityType: string;
  entityId: string;
  authorName: string;
  authorId: string | null;
  content: string;
  createdAt: Date | null;
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  jobCategory: string;
  applicantName: string;
  phone: string;
  experience: string;
  resumeUrl: string | null;
  status: string;
  createdAt: Date | null;
}

export type InsertJobApplication = Omit<JobApplication, "id" | "createdAt">;

export type InsertVideoCallSlot = Omit<VideoCallSlot, "id" | "createdAt" | "currentBookings">;

export interface VideoCallBooking {
  id: string;
  bookingNumber: string;
  userId: string | null;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  machineType: string;
  problemDescription: string;
  slotId: string;
  slotDate: string;
  slotTime: string;
  status: string;
  meetingLink: string | null;
  adminNotes: string | null;
  cancelReason: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type InsertVideoCallBooking = Omit<VideoCallBooking, "id" | "createdAt" | "updatedAt" | "bookingNumber">;

export * from "./conversations";
export * from "./messages";
