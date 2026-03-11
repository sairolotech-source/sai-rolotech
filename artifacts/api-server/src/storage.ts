import {
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  dealers, type Dealer, type InsertDealer,
  operators, type Operator, type InsertOperator,
  posts, type Post, type InsertPost,
  postReports, type PostReport, type InsertPostReport,
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
  followupReminders, type FollowupReminder, type InsertFollowupReminder,
} from "@workspace/db/schema";
import { db } from "@workspace/db";
import { eq, desc, sql, count, and, avg, gte, lte, or } from "drizzle-orm";

class Storage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getProducts(isUsed?: boolean): Promise<Product[]> {
    if (isUsed !== undefined) {
      return db.select().from(products).where(eq(products.isUsed, isUsed));
    }
    return db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDealers(): Promise<Dealer[]> {
    return db.select().from(dealers).orderBy(desc(dealers.createdAt));
  }

  async getDealer(id: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id)).limit(1);
    return dealer;
  }

  async createDealer(data: InsertDealer): Promise<Dealer> {
    const [dealer] = await db.insert(dealers).values(data).returning();
    return dealer;
  }

  async updateDealer(id: string, data: Partial<Dealer>): Promise<Dealer | undefined> {
    const [dealer] = await db.update(dealers).set(data).where(eq(dealers.id, id)).returning();
    return dealer;
  }

  async deleteDealer(id: string): Promise<boolean> {
    const result = await db.delete(dealers).where(eq(dealers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getOperators(): Promise<Operator[]> {
    return db.select().from(operators).orderBy(desc(operators.createdAt));
  }

  async createOperator(data: InsertOperator): Promise<Operator> {
    const [op] = await db.insert(operators).values(data).returning();
    return op;
  }

  async getPosts(): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.isApproved, true)).orderBy(desc(posts.createdAt));
  }

  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(data: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(data).returning();
    return post;
  }

  async likePost(id: string): Promise<Post | undefined> {
    const [post] = await db.update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db.update(posts).set(data).where(eq(posts.id, id)).returning();
    return post;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return post;
  }

  async incrementPostReportCount(id: string): Promise<Post | undefined> {
    const [post] = await db.update(posts)
      .set({ reportCount: sql`${posts.reportCount} + 1` })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async createPostReport(data: InsertPostReport): Promise<PostReport> {
    const [report] = await db.insert(postReports).values(data).returning();
    return report;
  }

  async getPostReport(postId: string, reporterUserId: string): Promise<PostReport | undefined> {
    const [report] = await db.select().from(postReports)
      .where(and(eq(postReports.postId, postId), eq(postReports.reporterUserId, reporterUserId)))
      .limit(1);
    return report;
  }

  async getReportedPosts(): Promise<Post[]> {
    return db.select().from(posts)
      .where(and(gte(posts.reportCount, 1), eq(posts.isApproved, true)))
      .orderBy(desc(posts.reportCount));
  }

  async getUsersWithWarnings(): Promise<User[]> {
    return db.select().from(users).where(gte(users.warningCount, 1)).orderBy(desc(users.warningCount));
  }

  async getFrozenUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.isFrozen, true)).orderBy(desc(users.createdAt));
  }

  async incrementUserWarning(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ warningCount: sql`${users.warningCount} + 1` })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async freezeUser(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ isFrozen: true })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async unfreezeUser(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ isFrozen: false, warningCount: 0 })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(data: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(data).returning();
    return lead;
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead | undefined> {
    const [lead] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    return lead;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined> {
    const [lead] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return lead;
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return lead;
  }

  async getTodayFollowups(): Promise<Lead[]> {
    const today = new Date().toISOString().split("T")[0];
    return db.select().from(leads)
      .where(and(eq(leads.nextFollowupDate, today), eq(leads.isStopList, false)))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return db.select().from(leads)
      .where(and(eq(leads.status, status), eq(leads.isStopList, false)))
      .orderBy(desc(leads.createdAt));
  }

  async getStopList(): Promise<Lead[]> {
    return db.select().from(leads)
      .where(eq(leads.isStopList, true))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadStats(): Promise<{ total: number; hot: number; normal: number; cold: number; stop: number; todayFollowups: number; upcomingVisits: number }> {
    const today = new Date().toISOString().split("T")[0];
    const allLeads = await db.select().from(leads);
    const total = allLeads.length;
    const hot = allLeads.filter(l => l.status === "HOT" && !l.isStopList).length;
    const normal = allLeads.filter(l => l.status === "NORMAL" && !l.isStopList).length;
    const cold = allLeads.filter(l => l.status === "COLD" && !l.isStopList).length;
    const stop = allLeads.filter(l => l.isStopList).length;
    const todayFollowups = allLeads.filter(l => l.nextFollowupDate === today && !l.isStopList).length;
    const now = new Date();
    const upcoming = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingVisits = allLeads.filter(l => l.visitScheduledAt && new Date(l.visitScheduledAt) >= now && new Date(l.visitScheduledAt) <= upcoming).length;
    return { total, hot, normal, cold, stop, todayFollowups, upcomingVisits };
  }

  async getFollowupReminders(leadId?: string): Promise<FollowupReminder[]> {
    if (leadId) {
      return db.select().from(followupReminders)
        .where(eq(followupReminders.leadId, leadId))
        .orderBy(desc(followupReminders.createdAt));
    }
    return db.select().from(followupReminders).orderBy(desc(followupReminders.createdAt));
  }

  async createFollowupReminder(data: InsertFollowupReminder): Promise<FollowupReminder> {
    const [reminder] = await db.insert(followupReminders).values(data).returning();
    return reminder;
  }

  async completeFollowupReminder(id: string): Promise<FollowupReminder | undefined> {
    const [reminder] = await db.update(followupReminders)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(followupReminders.id, id))
      .returning();
    return reminder;
  }

  async deleteFollowupReminder(id: string): Promise<boolean> {
    const result = await db.delete(followupReminders).where(eq(followupReminders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deletePendingRemindersByLeadId(leadId: string): Promise<number> {
    const result = await db.delete(followupReminders)
      .where(and(eq(followupReminders.leadId, leadId), eq(followupReminders.isCompleted, false)));
    return result.rowCount ?? 0;
  }

  async bulkCreateReminders(reminders: InsertFollowupReminder[]): Promise<void> {
    if (reminders.length === 0) return;
    await db.insert(followupReminders).values(reminders);
  }

  generateStandardReminderDays(): number[] {
    const days = [1, 3, 7, 15, 30];
    for (let d = 50; d <= 350; d += 20) {
      days.push(d);
    }
    return days;
  }

  generateHotReminderDays(): number[] {
    const days: number[] = [];
    for (let d = 1; d <= 30; d += 2) {
      days.push(d);
    }
    days.push(30);
    for (let d = 37; d <= 365; d += 7) {
      days.push(d);
    }
    return days;
  }

  buildReminders(leadId: string, startDate: Date, name: string, machineType: string | null, dayOffsets: number[]): InsertFollowupReminder[] {
    return dayOffsets.map((offset, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + offset);
      const dateStr = d.toISOString().split("T")[0];
      const machine = machineType || "machine";
      let msg: string;
      if (offset <= 1) msg = `First follow-up: ${name} se ${machine} ke baare mein baat karo`;
      else if (offset <= 7) msg = `Follow-up #${i + 1}: ${name} ko ${machine} ka update do`;
      else if (offset <= 30) msg = `Reminder: ${name} se ${machine} ki progress puchho`;
      else msg = `Follow-up with ${name} regarding ${machine}`;
      return { leadId, reminderDate: dateStr, reminderTime: "10:00", message: msg };
    });
  }

  async autoCreateRemindersForLead(lead: { id: string; name: string; machineType: string | null; status: string | null; createdAt: Date | null }): Promise<void> {
    const startDate = lead.createdAt ?? new Date();
    const isHot = lead.status === "HOT";
    const days = isHot ? this.generateHotReminderDays() : this.generateStandardReminderDays();
    const reminders = this.buildReminders(lead.id, startDate, lead.name, lead.machineType, days);
    await this.bulkCreateReminders(reminders);
  }

  async switchToHotSchedule(leadId: string): Promise<void> {
    const lead = await this.getLeadById(leadId);
    if (!lead) return;
    await this.deletePendingRemindersByLeadId(leadId);
    const days = this.generateHotReminderDays();
    const reminders = this.buildReminders(leadId, new Date(), lead.name, lead.machineType, days);
    await this.bulkCreateReminders(reminders);
  }

  async getLeadScoring(leadId: string): Promise<LeadScoring | undefined> {
    const [ls] = await db.select().from(leadScoring).where(eq(leadScoring.leadId, leadId)).limit(1);
    return ls;
  }

  async getAllLeadScorings(): Promise<LeadScoring[]> {
    return db.select().from(leadScoring).orderBy(desc(leadScoring.createdAt));
  }

  async upsertLeadScoring(data: InsertLeadScoring): Promise<LeadScoring> {
    const existing = await this.getLeadScoring(data.leadId);
    if (existing) {
      const [ls] = await db.update(leadScoring).set({ ...data, updatedAt: new Date() }).where(eq(leadScoring.leadId, data.leadId)).returning();
      return ls;
    }
    const [ls] = await db.insert(leadScoring).values(data).returning();
    return ls;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
  }

  async createServiceRequest(data: InsertServiceRequest): Promise<ServiceRequest> {
    const [req] = await db.insert(serviceRequests).values(data).returning();
    return req;
  }

  async updateServiceRequestStatus(id: string, status: string): Promise<ServiceRequest | undefined> {
    const [req] = await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id)).returning();
    return req;
  }

  async getSubsidies(): Promise<Subsidy[]> {
    return db.select().from(subsidies);
  }

  async createSubsidy(data: InsertSubsidy): Promise<Subsidy> {
    const [subsidy] = await db.insert(subsidies).values(data).returning();
    return subsidy;
  }

  async getSpareParts(): Promise<SparePart[]> {
    return db.select().from(spareParts);
  }

  async createSparePart(data: InsertSparePart): Promise<SparePart> {
    const [part] = await db.insert(spareParts).values(data).returning();
    return part;
  }

  async getAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appt] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return appt;
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const passCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const [appt] = await db.insert(appointments).values({ ...data, passCode }).returning();
    return appt;
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const [appt] = await db.update(appointments).set(data).where(eq(appointments.id, id)).returning();
    return appt;
  }

  async getSuppliers(state?: string): Promise<SupplierProfile[]> {
    if (state) {
      return db.select().from(supplierProfiles).where(eq(supplierProfiles.state, state)).orderBy(desc(supplierProfiles.createdAt));
    }
    return db.select().from(supplierProfiles).orderBy(desc(supplierProfiles.createdAt));
  }

  async getSupplier(id: string): Promise<SupplierProfile | undefined> {
    const [supplier] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.id, id)).limit(1);
    return supplier;
  }

  async createSupplier(data: InsertSupplierProfile): Promise<SupplierProfile> {
    const [supplier] = await db.insert(supplierProfiles).values(data).returning();
    return supplier;
  }

  async updateSupplier(id: string, data: Partial<SupplierProfile>): Promise<SupplierProfile | undefined> {
    const [supplier] = await db.update(supplierProfiles).set(data).where(eq(supplierProfiles.id, id)).returning();
    return supplier;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(supplierProfiles).where(eq(supplierProfiles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getReviewsForSupplier(supplierId: string): Promise<Review[]> {
    return db.select().from(reviews).where(and(eq(reviews.supplierId, supplierId), eq(reviews.isApproved, true))).orderBy(desc(reviews.createdAt));
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    await this.recalculateSupplierRating(data.supplierId);
    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    if (review) await this.recalculateSupplierRating(review.supplierId);
    return (result.rowCount ?? 0) > 0;
  }

  async recalculateSupplierRating(supplierId: string): Promise<void> {
    const [result] = await db.select({
      avgRating: avg(reviews.rating),
      ratingCount: count(reviews.id),
    }).from(reviews).where(and(eq(reviews.supplierId, supplierId), eq(reviews.isApproved, true)));

    await db.update(supplierProfiles).set({
      rating: result.avgRating?.toString() || "0",
      ratingCount: Number(result.ratingCount) || 0,
    }).where(eq(supplierProfiles.id, supplierId));
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    return ticket;
  }

  async createSupportTicket(data: InsertSupportTicket): Promise<SupportTicket> {
    const ticketNumber = `TKT-${Date.now().toString().slice(-8)}`;
    const [ticket] = await db.insert(supportTickets).values({ ...data, ticketNumber }).returning();
    return ticket;
  }

  async updateSupportTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [ticket] = await db.update(supportTickets).set({ ...data, updatedAt: new Date() }).where(eq(supportTickets.id, id)).returning();
    return ticket;
  }

  async getAmcPlans(): Promise<AmcPlan[]> {
    return db.select().from(amcPlans);
  }

  async createAmcPlan(data: InsertAmcPlan): Promise<AmcPlan> {
    const [plan] = await db.insert(amcPlans).values(data).returning();
    return plan;
  }

  async updateAmcPlan(id: string, data: Partial<AmcPlan>): Promise<AmcPlan | undefined> {
    const [plan] = await db.update(amcPlans).set(data).where(eq(amcPlans.id, id)).returning();
    return plan;
  }

  async deleteAmcPlan(id: string): Promise<boolean> {
    const result = await db.delete(amcPlans).where(eq(amcPlans.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAmcSubscriptions(): Promise<AmcSubscription[]> {
    return db.select().from(amcSubscriptions).orderBy(desc(amcSubscriptions.createdAt));
  }

  async createAmcSubscription(data: InsertAmcSubscription): Promise<AmcSubscription> {
    const subscriptionNumber = `AMC-${Date.now().toString().slice(-8)}`;
    const [sub] = await db.insert(amcSubscriptions).values({ ...data, subscriptionNumber }).returning();
    return sub;
  }

  async updateAmcSubscription(id: string, data: Partial<AmcSubscription>): Promise<AmcSubscription | undefined> {
    const [sub] = await db.update(amcSubscriptions).set(data).where(eq(amcSubscriptions.id, id)).returning();
    return sub;
  }

  async getMachineDocuments(): Promise<MachineDocument[]> {
    return db.select().from(machineDocuments).orderBy(desc(machineDocuments.createdAt));
  }

  async createMachineDocument(data: InsertMachineDocument): Promise<MachineDocument> {
    const [doc] = await db.insert(machineDocuments).values(data).returning();
    return doc;
  }

  async deleteMachineDocument(id: string): Promise<boolean> {
    const result = await db.delete(machineDocuments).where(eq(machineDocuments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getInspections(): Promise<Inspection[]> {
    return db.select().from(inspections).orderBy(desc(inspections.createdAt));
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    const [insp] = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1);
    return insp;
  }

  async createInspection(data: InsertInspection): Promise<Inspection> {
    const inspectionNumber = `INS-${Date.now().toString().slice(-8)}`;
    const [insp] = await db.insert(inspections).values({ ...data, inspectionNumber }).returning();
    return insp;
  }

  async updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection | undefined> {
    const [insp] = await db.update(inspections).set(data).where(eq(inspections.id, id)).returning();
    return insp;
  }

  async getIsoDocuments(): Promise<IsoDocument[]> {
    return db.select().from(isoDocuments).orderBy(desc(isoDocuments.createdAt));
  }

  async createIsoDocument(data: InsertIsoDocument): Promise<IsoDocument> {
    const documentNumber = `ISO-DOC-${Date.now().toString().slice(-6)}`;
    const [doc] = await db.insert(isoDocuments).values({ ...data, documentNumber }).returning();
    return doc;
  }

  async updateIsoDocument(id: string, data: Partial<IsoDocument>): Promise<IsoDocument | undefined> {
    const [doc] = await db.update(isoDocuments).set({ ...data, updatedAt: new Date() }).where(eq(isoDocuments.id, id)).returning();
    return doc;
  }

  async deleteIsoDocument(id: string): Promise<boolean> {
    const result = await db.delete(isoDocuments).where(eq(isoDocuments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getIsoAudits(): Promise<IsoAudit[]> {
    return db.select().from(isoAudits).orderBy(desc(isoAudits.createdAt));
  }

  async createIsoAudit(data: InsertIsoAudit): Promise<IsoAudit> {
    const auditNumber = `AUDIT-${Date.now().toString().slice(-6)}`;
    const [audit] = await db.insert(isoAudits).values({ ...data, auditNumber }).returning();
    return audit;
  }

  async updateIsoAudit(id: string, data: Partial<IsoAudit>): Promise<IsoAudit | undefined> {
    const [audit] = await db.update(isoAudits).set(data).where(eq(isoAudits.id, id)).returning();
    return audit;
  }

  async getCapas(): Promise<Capa[]> {
    return db.select().from(capas).orderBy(desc(capas.createdAt));
  }

  async createCapa(data: InsertCapa): Promise<Capa> {
    const capaNumber = `CAPA-${Date.now().toString().slice(-6)}`;
    const [capa] = await db.insert(capas).values({ ...data, capaNumber }).returning();
    return capa;
  }

  async updateCapa(id: string, data: Partial<Capa>): Promise<Capa | undefined> {
    const [capa] = await db.update(capas).set(data).where(eq(capas.id, id)).returning();
    return capa;
  }

  async getQuotations(): Promise<Quotation[]> {
    return db.select().from(quotations).orderBy(desc(quotations.createdAt));
  }

  async getQuotation(id: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
    return quotation;
  }

  async getQuotationByAccessCode(accessCode: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.accessCode, accessCode)).limit(1);
    return quotation;
  }

  async createQuotation(data: InsertQuotation): Promise<Quotation> {
    const quotationNumber = `QT-${Date.now().toString().slice(-8)}`;
    const [quotation] = await db.insert(quotations).values({ ...data, quotationNumber }).returning();
    return quotation;
  }

  async updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation | undefined> {
    const [quotation] = await db.update(quotations).set({ ...data, updatedAt: new Date() }).where(eq(quotations.id, id)).returning();
    return quotation;
  }

  async getAppSettings(): Promise<AppSettings | undefined> {
    const [settings] = await db.select().from(appSettings).limit(1);
    return settings;
  }

  async upsertAppSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    const existing = await this.getAppSettings();
    if (existing) {
      const [settings] = await db.update(appSettings).set(data).where(eq(appSettings.id, "default")).returning();
      return settings;
    }
    const [settings] = await db.insert(appSettings).values({ id: "default", ...data }).returning();
    return settings;
  }

  async getMarketPrices(): Promise<MarketPrice[]> {
    return db.select().from(marketPrices).orderBy(desc(marketPrices.createdAt));
  }

  async createMarketPrice(data: InsertMarketPrice): Promise<MarketPrice> {
    const [price] = await db.insert(marketPrices).values(data).returning();
    return price;
  }

  async updateMarketPrice(id: string, data: Partial<MarketPrice>): Promise<MarketPrice | undefined> {
    const [price] = await db.update(marketPrices).set(data).where(eq(marketPrices.id, id)).returning();
    return price;
  }

  async deleteMarketPrice(id: string): Promise<boolean> {
    const result = await db.delete(marketPrices).where(eq(marketPrices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getHealthChecks(): Promise<HealthCheck[]> {
    return db.select().from(machineHealthChecks).orderBy(desc(machineHealthChecks.createdAt));
  }

  async createHealthCheck(data: InsertHealthCheck): Promise<HealthCheck> {
    const [hc] = await db.insert(machineHealthChecks).values(data).returning();
    return hc;
  }

  async getQuotationComparisons(): Promise<QuotationComparison[]> {
    return db.select().from(quotationComparisons).orderBy(desc(quotationComparisons.createdAt));
  }

  async createQuotationComparison(data: InsertComparison): Promise<QuotationComparison> {
    const [comp] = await db.insert(quotationComparisons).values(data).returning();
    return comp;
  }

  async getBanners(): Promise<Banner[]> {
    return db.select().from(banners).orderBy(banners.order);
  }

  async createBanner(data: InsertBanner): Promise<Banner> {
    const [banner] = await db.insert(banners).values(data).returning();
    return banner;
  }

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner | undefined> {
    const [banner] = await db.update(banners).set(data).where(eq(banners.id, id)).returning();
    return banner;
  }

  async deleteBanner(id: string): Promise<boolean> {
    const result = await db.delete(banners).where(eq(banners.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new Storage();
