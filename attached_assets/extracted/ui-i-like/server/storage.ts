import {
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  dealers, type Dealer, type InsertDealer,
  operators, type Operator, type InsertOperator,
  posts, type Post, type InsertPost,
  leads, type Lead, type InsertLead,
  serviceRequests, type ServiceRequest, type InsertServiceRequest,
  subsidies, type Subsidy, type InsertSubsidy,
  spareParts, type SparePart, type InsertSparePart,
  appointments, type Appointment, type InsertAppointment,
  supplierProfiles, type SupplierProfile, type InsertSupplierProfile,
  reviews, type Review, type InsertReview,
  supportTickets, type SupportTicket, type InsertSupportTicket,
  amcPlans, type AmcPlan, type InsertAmcPlan,
  amcSubscriptions, type AmcSubscription, type InsertAmcSubscription,
  machineDocuments, type MachineDocument, type InsertMachineDocument,
  inspections, type Inspection, type InsertInspection,
  isoDocuments, type IsoDocument, type InsertIsoDocument,
  isoAudits, type IsoAudit, type InsertIsoAudit,
  capas, type Capa, type InsertCapa,
  quotations, type Quotation, type InsertQuotation,
  appSettings, type AppSettings,
  marketPrices, type MarketPrice, type InsertMarketPrice,
  machineHealthChecks, type HealthCheck, type InsertHealthCheck,
  quotationComparisons, type QuotationComparison, type InsertComparison,
  banners, type Banner, type InsertBanner,
  leadScoring, type LeadScoring, type InsertLeadScoring,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, count, and, avg } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getProducts(isUsed?: boolean): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  getDealers(): Promise<Dealer[]>;
  getDealer(id: string): Promise<Dealer | undefined>;
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  updateDealer(id: string, data: Partial<Dealer>): Promise<Dealer | undefined>;
  deleteDealer(id: string): Promise<boolean>;

  getOperators(): Promise<Operator[]>;
  createOperator(operator: InsertOperator): Promise<Operator>;

  getPosts(): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(id: string): Promise<Post | undefined>;
  updatePost(id: string, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;

  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadStatus(id: string, status: string): Promise<Lead | undefined>;
  updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined>;

  getLeadScoring(leadId: string): Promise<LeadScoring | undefined>;
  getAllLeadScorings(): Promise<LeadScoring[]>;
  upsertLeadScoring(data: InsertLeadScoring): Promise<LeadScoring>;

  getServiceRequests(): Promise<ServiceRequest[]>;
  createServiceRequest(req: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: string, status: string): Promise<ServiceRequest | undefined>;

  getSubsidies(): Promise<Subsidy[]>;
  createSubsidy(subsidy: InsertSubsidy): Promise<Subsidy>;

  getSpareParts(): Promise<SparePart[]>;
  createSparePart(part: InsertSparePart): Promise<SparePart>;

  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appt: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | undefined>;

  getSuppliers(state?: string): Promise<SupplierProfile[]>;
  getSupplier(id: string): Promise<SupplierProfile | undefined>;
  createSupplier(profile: InsertSupplierProfile): Promise<SupplierProfile>;
  updateSupplier(id: string, data: Partial<SupplierProfile>): Promise<SupplierProfile | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  getReviewsForSupplier(supplierId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: string): Promise<boolean>;
  recalculateSupplierRating(supplierId: string): Promise<void>;

  getSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;

  getAmcPlans(): Promise<AmcPlan[]>;
  getAmcPlan(id: string): Promise<AmcPlan | undefined>;
  createAmcPlan(plan: InsertAmcPlan): Promise<AmcPlan>;

  getAmcSubscriptions(): Promise<AmcSubscription[]>;
  getAmcSubscription(id: string): Promise<AmcSubscription | undefined>;
  createAmcSubscription(sub: InsertAmcSubscription): Promise<AmcSubscription>;
  updateAmcSubscription(id: string, data: Partial<AmcSubscription>): Promise<AmcSubscription | undefined>;

  getDocuments(): Promise<MachineDocument[]>;
  getDocument(id: string): Promise<MachineDocument | undefined>;
  createDocument(doc: InsertMachineDocument): Promise<MachineDocument>;
  deleteDocument(id: string): Promise<boolean>;

  getInspections(): Promise<Inspection[]>;
  getInspection(id: string): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection | undefined>;

  getIsoDocuments(): Promise<IsoDocument[]>;
  getIsoDocument(id: string): Promise<IsoDocument | undefined>;
  createIsoDocument(doc: InsertIsoDocument): Promise<IsoDocument>;
  updateIsoDocument(id: string, data: Partial<IsoDocument>): Promise<IsoDocument | undefined>;
  deleteIsoDocument(id: string): Promise<boolean>;

  getIsoAudits(): Promise<IsoAudit[]>;
  getIsoAudit(id: string): Promise<IsoAudit | undefined>;
  createIsoAudit(audit: InsertIsoAudit): Promise<IsoAudit>;
  updateIsoAudit(id: string, data: Partial<IsoAudit>): Promise<IsoAudit | undefined>;

  getCapas(): Promise<Capa[]>;
  getCapa(id: string): Promise<Capa | undefined>;
  createCapa(capa: InsertCapa): Promise<Capa>;
  updateCapa(id: string, data: Partial<Capa>): Promise<Capa | undefined>;

  getQuotations(): Promise<Quotation[]>;
  getQuotation(id: string): Promise<Quotation | undefined>;
  getQuotationByNumber(num: string): Promise<Quotation | undefined>;
  createQuotation(q: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation | undefined>;

  getSettings(): Promise<AppSettings | undefined>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;

  getMarketPrices(): Promise<MarketPrice[]>;
  getLatestPrices(): Promise<MarketPrice[]>;
  createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice>;

  getHealthChecks(): Promise<HealthCheck[]>;
  createHealthCheck(check: InsertHealthCheck): Promise<HealthCheck>;

  getComparisons(): Promise<QuotationComparison[]>;
  getComparison(id: string): Promise<QuotationComparison | undefined>;
  createComparison(comp: InsertComparison): Promise<QuotationComparison>;

  getBanners(): Promise<Banner[]>;
  getActiveBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, data: Partial<Banner>): Promise<Banner | undefined>;
  deleteBanner(id: string): Promise<boolean>;

  getDashboardStats(): Promise<{
    totalProducts: number;
    totalLeads: number;
    totalServiceRequests: number;
    totalAppointments: number;
    pendingLeads: number;
    pendingServiceRequests: number;
    pendingAppointments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getProducts(isUsed?: boolean): Promise<Product[]> {
    if (isUsed !== undefined) {
      return db.select().from(products).where(eq(products.isUsed, isUsed));
    }
    return db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getDealers(): Promise<Dealer[]> {
    return db.select().from(dealers).orderBy(desc(dealers.createdAt));
  }

  async getDealer(id: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer;
  }

  async createDealer(dealer: InsertDealer): Promise<Dealer> {
    const [created] = await db.insert(dealers).values(dealer).returning();
    return created;
  }

  async updateDealer(id: string, data: Partial<Dealer>): Promise<Dealer | undefined> {
    const [updated] = await db.update(dealers).set(data).where(eq(dealers.id, id)).returning();
    return updated;
  }

  async deleteDealer(id: string): Promise<boolean> {
    await db.delete(dealers).where(eq(dealers.id, id));
    return true;
  }

  async getOperators(): Promise<Operator[]> {
    return db.select().from(operators);
  }

  async createOperator(operator: InsertOperator): Promise<Operator> {
    const [created] = await db.insert(operators).values(operator).returning();
    return created;
  }

  async getPosts(): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.isApproved, true)).orderBy(desc(posts.createdAt));
  }

  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async likePost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) return undefined;
    const [updated] = await db
      .update(posts)
      .set({ likes: (post.likes || 0) + 1 })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | undefined> {
    const [updated] = await db.update(posts).set(data).where(eq(posts.id, id)).returning();
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead | undefined> {
    const [updated] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    return updated;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined> {
    const [updated] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return updated;
  }

  async getLeadScoring(leadId: string): Promise<LeadScoring | undefined> {
    const [scoring] = await db.select().from(leadScoring).where(eq(leadScoring.leadId, leadId));
    return scoring;
  }

  async getAllLeadScorings(): Promise<LeadScoring[]> {
    return db.select().from(leadScoring).orderBy(desc(leadScoring.totalScore));
  }

  async upsertLeadScoring(data: InsertLeadScoring): Promise<LeadScoring> {
    const existing = await this.getLeadScoring(data.leadId);
    if (existing) {
      const [updated] = await db.update(leadScoring).set({ ...data, updatedAt: new Date() }).where(eq(leadScoring.leadId, data.leadId)).returning();
      return updated;
    }
    const [created] = await db.insert(leadScoring).values(data).returning();
    return created;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
  }

  async createServiceRequest(req: InsertServiceRequest): Promise<ServiceRequest> {
    const [created] = await db.insert(serviceRequests).values(req).returning();
    return created;
  }

  async updateServiceRequestStatus(id: string, status: string): Promise<ServiceRequest | undefined> {
    const [updated] = await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id)).returning();
    return updated;
  }

  async getSubsidies(): Promise<Subsidy[]> {
    return db.select().from(subsidies);
  }

  async createSubsidy(subsidy: InsertSubsidy): Promise<Subsidy> {
    const [created] = await db.insert(subsidies).values(subsidy).returning();
    return created;
  }

  async getSpareParts(): Promise<SparePart[]> {
    return db.select().from(spareParts);
  }

  async createSparePart(part: InsertSparePart): Promise<SparePart> {
    const [created] = await db.insert(spareParts).values(part).returning();
    return created;
  }

  async getAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appt] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appt;
  }

  async createAppointment(appt: InsertAppointment): Promise<Appointment> {
    const passCode = `VISIT-${randomBytes(4).toString("hex").toUpperCase()}`;
    const [created] = await db.insert(appointments).values({ ...appt, passCode }).returning();
    return created;
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updated] = await db.update(appointments).set(data).where(eq(appointments.id, id)).returning();
    return updated;
  }

  async getSettings(): Promise<AppSettings | undefined> {
    const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, "default"));
    return settings;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db
        .update(appSettings)
        .set(settings)
        .where(eq(appSettings.id, "default"))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(appSettings)
      .values({ ...settings, id: "default" } as any)
      .returning();
    return created;
  }

  async getSuppliers(state?: string): Promise<SupplierProfile[]> {
    const query = db.select().from(supplierProfiles);
    if (state) {
      return query.where(eq(supplierProfiles.state, state))
        .orderBy(
          desc(supplierProfiles.isPremium),
          desc(supplierProfiles.isVerified),
          desc(supplierProfiles.rating),
          desc(supplierProfiles.createdAt)
        );
    }
    return query.orderBy(
      desc(supplierProfiles.isPremium),
      desc(supplierProfiles.isVerified),
      desc(supplierProfiles.rating),
      desc(supplierProfiles.createdAt)
    );
  }

  async getSupplier(id: string): Promise<SupplierProfile | undefined> {
    const [supplier] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.id, id));
    return supplier;
  }

  async createSupplier(profile: InsertSupplierProfile): Promise<SupplierProfile> {
    const [created] = await db.insert(supplierProfiles).values(profile).returning();
    return created;
  }

  async updateSupplier(id: string, data: Partial<SupplierProfile>): Promise<SupplierProfile | undefined> {
    const [updated] = await db.update(supplierProfiles).set(data).where(eq(supplierProfiles.id, id)).returning();
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(supplierProfiles).where(eq(supplierProfiles.id, id)).returning();
    return result.length > 0;
  }

  async getReviewsForSupplier(supplierId: string): Promise<Review[]> {
    return db.select().from(reviews)
      .where(and(eq(reviews.supplierId, supplierId), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    await this.recalculateSupplierRating(review.supplierId);
    return created;
  }

  async deleteReview(id: string): Promise<boolean> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    if (result.length > 0 && review) {
      await this.recalculateSupplierRating(review.supplierId);
    }
    return result.length > 0;
  }

  async recalculateSupplierRating(supplierId: string): Promise<void> {
    const supplierReviews = await db.select().from(reviews)
      .where(and(eq(reviews.supplierId, supplierId), eq(reviews.isApproved, true)));
    if (supplierReviews.length === 0) {
      await db.update(supplierProfiles)
        .set({ rating: "0", ratingCount: 0 })
        .where(eq(supplierProfiles.id, supplierId));
      return;
    }
    const totalStars = supplierReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (totalStars / supplierReviews.length).toFixed(1);
    await db.update(supplierProfiles)
      .set({ rating: avgRating, ratingCount: supplierReviews.length })
      .where(eq(supplierProfiles.id, supplierId));
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const ticketNumber = `TKT-${randomBytes(4).toString("hex").toUpperCase()}`;
    const [created] = await db.insert(supportTickets).values({ ...ticket, ticketNumber }).returning();
    return created;
  }

  async updateSupportTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db.update(supportTickets).set({ ...data, updatedAt: new Date() }).where(eq(supportTickets.id, id)).returning();
    return updated;
  }

  async getAmcPlans(): Promise<AmcPlan[]> {
    return db.select().from(amcPlans);
  }

  async getAmcPlan(id: string): Promise<AmcPlan | undefined> {
    const [plan] = await db.select().from(amcPlans).where(eq(amcPlans.id, id));
    return plan;
  }

  async createAmcPlan(plan: InsertAmcPlan): Promise<AmcPlan> {
    const [created] = await db.insert(amcPlans).values(plan).returning();
    return created;
  }

  async getAmcSubscriptions(): Promise<AmcSubscription[]> {
    return db.select().from(amcSubscriptions).orderBy(desc(amcSubscriptions.createdAt));
  }

  async getAmcSubscription(id: string): Promise<AmcSubscription | undefined> {
    const [sub] = await db.select().from(amcSubscriptions).where(eq(amcSubscriptions.id, id));
    return sub;
  }

  async createAmcSubscription(sub: InsertAmcSubscription): Promise<AmcSubscription> {
    const subscriptionNumber = `AMC-${randomBytes(4).toString("hex").toUpperCase()}`;
    const [created] = await db.insert(amcSubscriptions).values({ ...sub, subscriptionNumber }).returning();
    return created;
  }

  async updateAmcSubscription(id: string, data: Partial<AmcSubscription>): Promise<AmcSubscription | undefined> {
    const [updated] = await db.update(amcSubscriptions).set(data).where(eq(amcSubscriptions.id, id)).returning();
    return updated;
  }

  async getDocuments(): Promise<MachineDocument[]> {
    return db.select().from(machineDocuments).orderBy(desc(machineDocuments.createdAt));
  }

  async getDocument(id: string): Promise<MachineDocument | undefined> {
    const [doc] = await db.select().from(machineDocuments).where(eq(machineDocuments.id, id));
    return doc;
  }

  async createDocument(doc: InsertMachineDocument): Promise<MachineDocument> {
    const [created] = await db.insert(machineDocuments).values(doc).returning();
    return created;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const [deleted] = await db.delete(machineDocuments).where(eq(machineDocuments.id, id)).returning();
    return !!deleted;
  }

  async getInspections(): Promise<Inspection[]> {
    return db.select().from(inspections).orderBy(desc(inspections.createdAt));
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    return inspection;
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const inspectionNumber = `QC-${randomBytes(3).toString("hex").toUpperCase()}`;
    const [created] = await db.insert(inspections).values({ ...inspection, inspectionNumber }).returning();
    return created;
  }

  async updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection | undefined> {
    const [updated] = await db.update(inspections).set(data).where(eq(inspections.id, id)).returning();
    return updated;
  }

  async getIsoDocuments(): Promise<IsoDocument[]> {
    return db.select().from(isoDocuments).orderBy(desc(isoDocuments.updatedAt));
  }

  async getIsoDocument(id: string): Promise<IsoDocument | undefined> {
    const [doc] = await db.select().from(isoDocuments).where(eq(isoDocuments.id, id));
    return doc;
  }

  async createIsoDocument(doc: InsertIsoDocument): Promise<IsoDocument> {
    const documentNumber = `ISO-DOC-${randomBytes(3).toString("hex").toUpperCase()}`;
    const [created] = await db.insert(isoDocuments).values({ ...doc, documentNumber }).returning();
    return created;
  }

  async updateIsoDocument(id: string, data: Partial<IsoDocument>): Promise<IsoDocument | undefined> {
    const [updated] = await db.update(isoDocuments).set({ ...data, updatedAt: new Date() }).where(eq(isoDocuments.id, id)).returning();
    return updated;
  }

  async deleteIsoDocument(id: string): Promise<boolean> {
    const result = await db.delete(isoDocuments).where(eq(isoDocuments.id, id)).returning();
    return result.length > 0;
  }

  async getIsoAudits(): Promise<IsoAudit[]> {
    return db.select().from(isoAudits).orderBy(desc(isoAudits.createdAt));
  }

  async getIsoAudit(id: string): Promise<IsoAudit | undefined> {
    const [audit] = await db.select().from(isoAudits).where(eq(isoAudits.id, id));
    return audit;
  }

  async createIsoAudit(audit: InsertIsoAudit): Promise<IsoAudit> {
    const auditNumber = `AUD-${randomBytes(3).toString("hex").toUpperCase()}`;
    const [created] = await db.insert(isoAudits).values({ ...audit, auditNumber }).returning();
    return created;
  }

  async updateIsoAudit(id: string, data: Partial<IsoAudit>): Promise<IsoAudit | undefined> {
    const [updated] = await db.update(isoAudits).set(data).where(eq(isoAudits.id, id)).returning();
    return updated;
  }

  async getCapas(): Promise<Capa[]> {
    return db.select().from(capas).orderBy(desc(capas.createdAt));
  }

  async getCapa(id: string): Promise<Capa | undefined> {
    const [capa] = await db.select().from(capas).where(eq(capas.id, id));
    return capa;
  }

  async createCapa(capa: InsertCapa): Promise<Capa> {
    const capaNumber = `CAPA-${randomBytes(3).toString("hex").toUpperCase()}`;
    const [created] = await db.insert(capas).values({ ...capa, capaNumber }).returning();
    return created;
  }

  async updateCapa(id: string, data: Partial<Capa>): Promise<Capa | undefined> {
    const [updated] = await db.update(capas).set(data).where(eq(capas.id, id)).returning();
    return updated;
  }

  async getQuotations(): Promise<Quotation[]> {
    return db.select().from(quotations).orderBy(desc(quotations.createdAt));
  }

  async getQuotation(id: string): Promise<Quotation | undefined> {
    const [q] = await db.select().from(quotations).where(eq(quotations.id, id));
    return q;
  }

  async getQuotationByNumber(num: string): Promise<Quotation | undefined> {
    const [q] = await db.select().from(quotations).where(eq(quotations.quotationNumber, num));
    return q;
  }

  async createQuotation(q: InsertQuotation): Promise<Quotation> {
    const year = new Date().getFullYear();
    const result = await db.execute(sql`SELECT nextval('quotation_seq')`) as any;
    const rows = result.rows || result;
    const nextVal = rows[0]?.nextval || rows[0]?.["nextval"] || "1";
    const seq = String(nextVal).padStart(4, "0");
    const quotationNumber = `SR-${year}-${seq}`;
    const [created] = await db.insert(quotations).values({ ...q, quotationNumber }).returning();
    return created;
  }

  async updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation | undefined> {
    const [updated] = await db.update(quotations).set({ ...data, updatedAt: new Date() }).where(eq(quotations.id, id)).returning();
    return updated;
  }

  async getDashboardStats() {
    const [prodCount] = await db.select({ value: count() }).from(products);
    const [leadCount] = await db.select({ value: count() }).from(leads);
    const [srCount] = await db.select({ value: count() }).from(serviceRequests);
    const [apptCount] = await db.select({ value: count() }).from(appointments);
    const [pendingLeadCount] = await db.select({ value: count() }).from(leads).where(eq(leads.status, "new"));
    const [pendingSrCount] = await db.select({ value: count() }).from(serviceRequests).where(eq(serviceRequests.status, "pending"));
    const [pendingApptCount] = await db.select({ value: count() }).from(appointments).where(eq(appointments.status, "pending"));
    const [ticketCount] = await db.select({ value: count() }).from(supportTickets);
    const [openTicketCount] = await db.select({ value: count() }).from(supportTickets).where(eq(supportTickets.status, "open"));
    const [amcCount] = await db.select({ value: count() }).from(amcSubscriptions);
    const [activeAmcCount] = await db.select({ value: count() }).from(amcSubscriptions).where(eq(amcSubscriptions.status, "active"));

    return {
      totalProducts: prodCount.value,
      totalLeads: leadCount.value,
      totalServiceRequests: srCount.value,
      totalAppointments: apptCount.value,
      pendingLeads: pendingLeadCount.value,
      pendingServiceRequests: pendingSrCount.value,
      pendingAppointments: pendingApptCount.value,
      totalTickets: ticketCount.value,
      openTickets: openTicketCount.value,
      totalAmcSubscriptions: amcCount.value,
      activeAmcSubscriptions: activeAmcCount.value,
    };
  }

  async getMarketPrices(): Promise<MarketPrice[]> {
    return db.select().from(marketPrices).orderBy(desc(marketPrices.createdAt));
  }

  async getLatestPrices(): Promise<MarketPrice[]> {
    const gpCoil = await db.select().from(marketPrices).where(eq(marketPrices.material, "gp_coil")).orderBy(desc(marketPrices.createdAt)).limit(1);
    const crCoil = await db.select().from(marketPrices).where(eq(marketPrices.material, "cr_coil")).orderBy(desc(marketPrices.createdAt)).limit(1);
    const steel = await db.select().from(marketPrices).where(eq(marketPrices.material, "steel")).orderBy(desc(marketPrices.createdAt)).limit(1);
    return [...gpCoil, ...crCoil, ...steel];
  }

  async createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice> {
    const [created] = await db.insert(marketPrices).values(price).returning();
    return created;
  }

  async getHealthChecks(): Promise<HealthCheck[]> {
    return db.select().from(machineHealthChecks).orderBy(desc(machineHealthChecks.createdAt));
  }

  async createHealthCheck(check: InsertHealthCheck): Promise<HealthCheck> {
    const [created] = await db.insert(machineHealthChecks).values(check).returning();
    return created;
  }

  async getComparisons(): Promise<QuotationComparison[]> {
    return db.select().from(quotationComparisons).orderBy(desc(quotationComparisons.createdAt));
  }

  async getComparison(id: string): Promise<QuotationComparison | undefined> {
    const [comp] = await db.select().from(quotationComparisons).where(eq(quotationComparisons.id, id));
    return comp;
  }

  async createComparison(comp: InsertComparison): Promise<QuotationComparison> {
    const [created] = await db.insert(quotationComparisons).values(comp).returning();
    return created;
  }

  async getBanners(): Promise<Banner[]> {
    return db.select().from(banners).orderBy(banners.order);
  }

  async getActiveBanners(): Promise<Banner[]> {
    return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.order);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [created] = await db.insert(banners).values(banner).returning();
    return created;
  }

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner | undefined> {
    const [updated] = await db.update(banners).set(data).where(eq(banners.id, id)).returning();
    return updated;
  }

  async deleteBanner(id: string): Promise<boolean> {
    const result = await db.delete(banners).where(eq(banners.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
