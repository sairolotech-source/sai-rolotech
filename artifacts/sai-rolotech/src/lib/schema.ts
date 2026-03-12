import { z } from "zod";

export type User = {
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
  lastLoginAt: Date | null;
  createdAt: Date | null;
};

export type Product = {
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
};

export type Dealer = {
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
};

export type Operator = {
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
};

export type Post = {
  id: string;
  type: string;
  caption: string;
  author: string;
  userId: string | null;
  likes: number | null;
  images: string[] | null;
  videoUrl: string | null;
  youtubeUrl: string | null;
  reportCount: number | null;
  isApproved: boolean | null;
  createdAt: Date | null;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  location: string | null;
  interest: string | null;
  status: string | null;
  financeRequired: boolean | null;
  financeStage: string | null;
  confidenceScore: number | null;
  expectedAmount: string | null;
  machineModel: string | null;
  notes: string | null;
  nextFollowupDate: string | null;
  createdAt: Date | null;
};

export type ServiceRequest = {
  id: string;
  clientName: string;
  phone: string;
  machineType: string;
  problem: string;
  urgency: string | null;
  status: string | null;
  createdAt: Date | null;
};

export type Subsidy = {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  subsidy: string;
  applyUrl: string | null;
  state: string | null;
  category: string;
};

export type SparePart = {
  id: string;
  name: string;
  price: string;
  image: string | null;
  category: string;
};

export type Appointment = {
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
};

export type SupplierProfile = {
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
};

export type Review = {
  id: string;
  supplierId: string;
  reviewerName: string;
  reviewerPhone: string | null;
  rating: number;
  comment: string | null;
  isVerifiedBuyer: boolean | null;
  isApproved: boolean | null;
  createdAt: Date | null;
};

export type SupportTicket = {
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
};

export type AmcPlan = {
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
};

export type AmcSubscription = {
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
};

export type MachineDocument = {
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
};

export type Inspection = {
  id: string;
  inspectionNumber: string;
  machineModel: string;
  machineCategory: string;
  customerName: string | null;
  inspectorName: string;
  status: string;
  items: unknown;
  overallResult: string | null;
  notes: string | null;
  createdAt: Date | null;
};

export type IsoDocument = {
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
};

export type IsoAudit = {
  id: string;
  auditNumber: string;
  auditType: string;
  auditorName: string;
  department: string;
  scheduledDate: string;
  completedDate: string | null;
  status: string;
  findings: unknown;
  nonConformities: number | null;
  observations: number | null;
  improvements: number | null;
  overallResult: string | null;
  notes: string | null;
  createdAt: Date | null;
};

export type Capa = {
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
};

export type Quotation = {
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
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type AppSettings = {
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
};

export type MarketPrice = {
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
};

export type HealthCheck = {
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
};

export type QuotationComparison = {
  id: string;
  clientName: string | null;
  clientPhone: string | null;
  quotation1: unknown;
  quotation2: unknown;
  comparisonResult: unknown;
  score1: number;
  score2: number;
  createdAt: Date | null;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  bgColor: string;
  imageUrl: string | null;
  isActive: boolean | null;
  order: number | null;
  createdAt: Date | null;
};

export type Manufacturer = {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  products: string[] | null;
  materials: string[] | null;
  machineTypes: string[] | null;
  productionCapacity: string | null;
  contactPhone: string;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  description: string | null;
  logo: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
};

export const insertLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  location: z.string().optional().nullable(),
  interest: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  financeRequired: z.boolean().optional().nullable(),
  financeStage: z.string().optional().nullable(),
  confidenceScore: z.number().optional().nullable(),
  expectedAmount: z.string().optional().nullable(),
  machineModel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  nextFollowupDate: z.string().optional().nullable(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;

export const insertServiceRequestSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  machineType: z.string().min(1, "Machine type is required"),
  problem: z.string().min(10, "Please describe the problem"),
  urgency: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

export type BroadcastPost = {
  id: string;
  title: string;
  message: string;
  image: string | null;
  audience: string;
  postToSocialMedia: boolean | null;
  facebookPostId: string | null;
  facebookPostUrl: string | null;
  instagramPostId: string | null;
  instagramPostUrl: string | null;
  socialMediaStatus: string | null;
  socialMediaError: string | null;
  viewCount: number | null;
  targetUserCount: number | null;
  createdBy: string | null;
  createdAt: Date | null;
};

export type JobApplication = {
  id: string;
  jobTitle: string;
  jobCategory: string;
  applicantName: string;
  phone: string;
  experience: string;
  resumeUrl: string | null;
  status: string;
  createdAt: Date | null;
};

export type LeadScoring = {
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
};

export type Referral = {
  id: string;
  referrerUserId: string;
  referralCode: string;
  referredUserId: string | null;
  referredName: string | null;
  referredPhone: string | null;
  status: string;
  createdAt: Date | null;
};

export type ReferralReward = {
  id: string;
  userId: string;
  rewardType: string;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  createdAt: Date | null;
};

export type IndustryData = {
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
};

export type ProductionPost = {
  id: string;
  userId: string;
  factoryName: string;
  tonnage: string;
  note: string | null;
  date: string;
  likes: number | null;
  createdAt: Date | null;
};

export type Manufacturer = {
  id: string;
  companyName: string;
  city: string;
  state: string | null;
  rank: number;
  userId: string | null;
  phone: string | null;
  isActive: boolean | null;
  badgeColor: string | null;
  createdAt: Date | null;
};
