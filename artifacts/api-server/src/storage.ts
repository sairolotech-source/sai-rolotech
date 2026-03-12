import { firestore, FieldValue } from "@workspace/db";
import {
  type User, type InsertUser,
  OtpCode,
  Product, InsertProduct,
  Dealer, InsertDealer,
  Operator, InsertOperator,
  Post, InsertPost,
  PostReport, InsertPostReport,
  Lead, InsertLead,
  ServiceRequest, InsertServiceRequest,
  Subsidy, InsertSubsidy,
  SparePart, InsertSparePart,
  Appointment, InsertAppointment,
  SupplierProfile, InsertSupplierProfile,
  Review, InsertReview,
  SupportTicket, InsertSupportTicket,
  AmcPlan, InsertAmcPlan,
  AmcSubscription, InsertAmcSubscription,
  MachineDocument, InsertMachineDocument,
  Inspection, InsertInspection,
  IsoDocument, InsertIsoDocument,
  IsoAudit, InsertIsoAudit,
  Capa, InsertCapa,
  Quotation, InsertQuotation,
  VendorMaterial, InsertVendorMaterial,
  VendorBill, InsertVendorBill,
  VideoCallSlot, InsertVideoCallSlot,
  VideoCallBooking, InsertVideoCallBooking,
  AppSettings,
  MarketPrice, InsertMarketPrice,
  HealthCheck, InsertHealthCheck,
  QuotationComparison, InsertComparison,
  Banner, InsertBanner,
  LeadScoring, InsertLeadScoring,
  FollowupReminder, InsertFollowupReminder,
  UserConsent, InsertUserConsent,
  NotificationSubscription, InsertNotificationSubscription,
  AuditLog, InsertAuditLog,
  ActiveSession, InsertActiveSession,
  BroadcastPost, InsertBroadcastPost,
  BroadcastNotificationPref,
  BroadcastNotification,
  AssemblyTask, InsertAssemblyTask,
  PushSubscription,
  Referral, InsertReferral,
  ReferralReward, InsertReferralReward,
  IndustryData, InsertIndustryData,
  ProductionPost, InsertProductionPost,
  Manufacturer, InsertManufacturer,
  MachineOrder, InsertMachineOrder,
  ProductionWorkflow, InsertProductionWorkflow,
  JobWork, InsertJobWork,
  MaterialRequest, InsertMaterialRequest,
  EngineerNote,
  JobApplication, InsertJobApplication,
} from "@workspace/db/schema";

function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function toFirestoreData(data: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (value instanceof Date) {
      result[key] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

function fromFirestoreDoc<T>(doc: FirebaseFirestore.DocumentSnapshot): T | undefined {
  if (!doc.exists) return undefined;
  const data = doc.data()!;
  const result: any = { id: doc.id };
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && typeof value.toDate === "function") {
      result[key] = value.toDate();
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

function fromFirestoreDocs<T>(snapshot: FirebaseFirestore.QuerySnapshot): T[] {
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const result: any = { id: doc.id };
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === "object" && typeof value.toDate === "function") {
        result[key] = value.toDate();
      } else {
        result[key] = value;
      }
    }
    return result as T;
  });
}

class Storage {
  private col(name: string) {
    return firestore.collection(name);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snap = await this.col("users").where("username", "==", username).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<User>(snap.docs[0]);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const doc = await this.col("users").doc(id).get();
    return fromFirestoreDoc<User>(doc);
  }

  async createUser(data: InsertUser, customId?: string): Promise<User> {
    const id = customId || generateId();
    const now = new Date();
    const userData = toFirestoreData({ ...data, createdAt: now, lastLoginAt: null });
    await this.col("users").doc(id).set(userData);
    return { id, ...userData } as User;
  }

  async getUsers(): Promise<User[]> {
    const snap = await this.col("users").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<User>(snap);
  }

  private async safeUpdate<T>(collection: string, id: string, data: Partial<T>): Promise<T | undefined> {
    const ref = this.col(collection).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const { id: _id, ...updateData } = data as any;
    await ref.update(toFirestoreData(updateData));
    const doc = await ref.get();
    return fromFirestoreDoc<T>(doc);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    return this.safeUpdate<User>("users", id, data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snap = await this.col("users").where("email", "==", email).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<User>(snap.docs[0]);
  }

  async deleteUser(id: string): Promise<boolean> {
    const doc = await this.col("users").doc(id).get();
    if (!doc.exists) return false;
    await this.col("users").doc(id).delete();
    return true;
  }

  async createOtpCode(data: { userId: string | null; email: string; code: string; purpose: string; expiresAt: Date }): Promise<OtpCode> {
    const id = generateId();
    const now = new Date();
    const otpData = toFirestoreData({ ...data, isUsed: false, createdAt: now });
    await this.col("otpCodes").doc(id).set(otpData);
    return { id, ...otpData } as OtpCode;
  }

  async getValidOtpCode(email: string, code: string, purpose: string): Promise<OtpCode | undefined> {
    const snap = await this.col("otpCodes")
      .where("email", "==", email)
      .where("code", "==", code)
      .where("purpose", "==", purpose)
      .where("isUsed", "==", false)
      .limit(1)
      .get();
    if (snap.empty) return undefined;
    const otp = fromFirestoreDoc<OtpCode>(snap.docs[0]);
    if (!otp) return undefined;
    const expiresAt = otp.expiresAt instanceof Date ? otp.expiresAt : new Date(otp.expiresAt);
    if (expiresAt < new Date()) return undefined;
    return otp;
  }

  async markOtpUsed(id: string): Promise<void> {
    await this.col("otpCodes").doc(id).update({ isUsed: true });
  }

  async deleteExpiredOtps(): Promise<number> {
    const now = new Date();
    const snap = await this.col("otpCodes").where("expiresAt", "<", now).get();
    const batch = firestore.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return snap.size;
  }

  async getProducts(isUsed?: boolean): Promise<Product[]> {
    let query: FirebaseFirestore.Query = this.col("products");
    if (isUsed !== undefined) {
      query = query.where("isUsed", "==", isUsed);
    }
    const snap = await query.get();
    return fromFirestoreDocs<Product>(snap);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const doc = await this.col("products").doc(id).get();
    return fromFirestoreDoc<Product>(doc);
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const id = generateId();
    const productData = toFirestoreData(data);
    await this.col("products").doc(id).set(productData);
    return { id, ...productData } as Product;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    return this.safeUpdate<Product>("products", id, data);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const doc = await this.col("products").doc(id).get();
    if (!doc.exists) return false;
    await this.col("products").doc(id).delete();
    return true;
  }

  async getDealers(): Promise<Dealer[]> {
    const snap = await this.col("dealers").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Dealer>(snap);
  }

  async getDealer(id: string): Promise<Dealer | undefined> {
    const doc = await this.col("dealers").doc(id).get();
    return fromFirestoreDoc<Dealer>(doc);
  }

  async createDealer(data: InsertDealer): Promise<Dealer> {
    const id = generateId();
    const now = new Date();
    const dealerData = toFirestoreData({ ...data, createdAt: now });
    await this.col("dealers").doc(id).set(dealerData);
    return { id, ...dealerData } as Dealer;
  }

  async updateDealer(id: string, data: Partial<Dealer>): Promise<Dealer | undefined> {
    return this.safeUpdate<Dealer>("dealers", id, data);
  }

  async deleteDealer(id: string): Promise<boolean> {
    const doc = await this.col("dealers").doc(id).get();
    if (!doc.exists) return false;
    await this.col("dealers").doc(id).delete();
    return true;
  }

  async getOperators(): Promise<Operator[]> {
    const snap = await this.col("operators").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Operator>(snap);
  }

  async createOperator(data: InsertOperator): Promise<Operator> {
    const id = generateId();
    const now = new Date();
    const opData = toFirestoreData({ ...data, createdAt: now });
    await this.col("operators").doc(id).set(opData);
    return { id, ...opData } as Operator;
  }

  async getPosts(): Promise<Post[]> {
    const snap = await this.col("posts").where("isApproved", "==", true).orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Post>(snap);
  }

  async getAllPosts(): Promise<Post[]> {
    const snap = await this.col("posts").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Post>(snap);
  }

  async createPost(data: InsertPost): Promise<Post> {
    const id = generateId();
    const now = new Date();
    const postData = toFirestoreData({ ...data, reportCount: 0, createdAt: now });
    await this.col("posts").doc(id).set(postData);
    return { id, ...postData } as Post;
  }

  async likePost(id: string): Promise<Post | undefined> {
    const doc = await this.col("posts").doc(id).get();
    if (!doc.exists) return undefined;
    await this.col("posts").doc(id).update({ likes: FieldValue.increment(1) });
    return fromFirestoreDoc<Post>(await this.col("posts").doc(id).get());
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | undefined> {
    return this.safeUpdate<Post>("posts", id, data);
  }

  async deletePost(id: string): Promise<boolean> {
    const doc = await this.col("posts").doc(id).get();
    if (!doc.exists) return false;
    await this.col("posts").doc(id).delete();
    return true;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const doc = await this.col("posts").doc(id).get();
    return fromFirestoreDoc<Post>(doc);
  }

  async incrementPostReportCount(id: string): Promise<Post | undefined> {
    const doc = await this.col("posts").doc(id).get();
    if (!doc.exists) return undefined;
    await this.col("posts").doc(id).update({ reportCount: FieldValue.increment(1) });
    return fromFirestoreDoc<Post>(await this.col("posts").doc(id).get());
  }

  async createPostReport(data: InsertPostReport): Promise<PostReport> {
    const id = `${data.postId}_${data.reporterUserId}`;
    const now = new Date();
    const reportData = toFirestoreData({ ...data, createdAt: now });
    await this.col("postReports").doc(id).set(reportData);
    return { id, ...reportData } as PostReport;
  }

  async getPostReport(postId: string, reporterUserId: string): Promise<PostReport | undefined> {
    const snap = await this.col("postReports")
      .where("postId", "==", postId)
      .where("reporterUserId", "==", reporterUserId)
      .limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<PostReport>(snap.docs[0]);
  }

  async getReportedPosts(): Promise<Post[]> {
    const snap = await this.col("posts")
      .where("reportCount", ">=", 1)
      .where("isApproved", "==", true)
      .orderBy("reportCount", "desc").get();
    return fromFirestoreDocs<Post>(snap);
  }

  async getUsersWithWarnings(): Promise<User[]> {
    const snap = await this.col("users")
      .where("warningCount", ">=", 1)
      .orderBy("warningCount", "desc").get();
    return fromFirestoreDocs<User>(snap);
  }

  async getFrozenUsers(): Promise<User[]> {
    const snap = await this.col("users")
      .where("isFrozen", "==", true)
      .orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<User>(snap);
  }

  async incrementUserWarning(userId: string): Promise<User | undefined> {
    const doc = await this.col("users").doc(userId).get();
    if (!doc.exists) return undefined;
    await this.col("users").doc(userId).update({ warningCount: FieldValue.increment(1) });
    return fromFirestoreDoc<User>(await this.col("users").doc(userId).get());
  }

  async freezeUser(userId: string): Promise<User | undefined> {
    await this.col("users").doc(userId).update({ isFrozen: true });
    return fromFirestoreDoc<User>(await this.col("users").doc(userId).get());
  }

  async unfreezeUser(userId: string): Promise<User | undefined> {
    await this.col("users").doc(userId).update({ isFrozen: false, warningCount: 0 });
    return fromFirestoreDoc<User>(await this.col("users").doc(userId).get());
  }

  async getLeads(): Promise<Lead[]> {
    const snap = await this.col("leads").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Lead>(snap);
  }

  async createLead(data: InsertLead): Promise<Lead> {
    const id = generateId();
    const now = new Date();
    const leadData = toFirestoreData({ ...data, createdAt: now });
    await this.col("leads").doc(id).set(leadData);
    return { id, ...leadData } as Lead;
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead | undefined> {
    return this.safeUpdate<Lead>("leads", id, { status } as any);
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined> {
    return this.safeUpdate<Lead>("leads", id, data);
  }

  async deleteLead(id: string): Promise<boolean> {
    const doc = await this.col("leads").doc(id).get();
    if (!doc.exists) return false;
    await this.col("leads").doc(id).delete();
    return true;
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    const doc = await this.col("leads").doc(id).get();
    return fromFirestoreDoc<Lead>(doc);
  }

  async getTodayFollowups(): Promise<Lead[]> {
    const today = new Date().toISOString().split("T")[0];
    const snap = await this.col("leads")
      .where("nextFollowupDate", "==", today)
      .where("isStopList", "==", false).get();
    return fromFirestoreDocs<Lead>(snap);
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    const snap = await this.col("leads")
      .where("status", "==", status)
      .where("isStopList", "==", false).get();
    return fromFirestoreDocs<Lead>(snap);
  }

  async getStopList(): Promise<Lead[]> {
    const snap = await this.col("leads")
      .where("isStopList", "==", true)
      .orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Lead>(snap);
  }

  async getLeadStats(): Promise<{ total: number; hot: number; normal: number; cold: number; stop: number; todayFollowups: number; upcomingVisits: number }> {
    const today = new Date().toISOString().split("T")[0];
    const snap = await this.col("leads").get();
    const allLeads = fromFirestoreDocs<Lead>(snap);
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
    let query: FirebaseFirestore.Query = this.col("followupReminders");
    if (leadId) {
      query = query.where("leadId", "==", leadId);
    }
    const snap = await query.orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<FollowupReminder>(snap);
  }

  async createFollowupReminder(data: InsertFollowupReminder): Promise<FollowupReminder> {
    const id = generateId();
    const now = new Date();
    const reminderData = toFirestoreData({ ...data, createdAt: now });
    await this.col("followupReminders").doc(id).set(reminderData);
    return { id, ...reminderData } as FollowupReminder;
  }

  async completeFollowupReminder(id: string): Promise<FollowupReminder | undefined> {
    await this.col("followupReminders").doc(id).update({ isCompleted: true, completedAt: new Date() });
    return fromFirestoreDoc<FollowupReminder>(await this.col("followupReminders").doc(id).get());
  }

  async deleteFollowupReminder(id: string): Promise<boolean> {
    const doc = await this.col("followupReminders").doc(id).get();
    if (!doc.exists) return false;
    await this.col("followupReminders").doc(id).delete();
    return true;
  }

  async deletePendingRemindersByLeadId(leadId: string): Promise<number> {
    const snap = await this.col("followupReminders")
      .where("leadId", "==", leadId)
      .where("isCompleted", "==", false).get();
    const batch = firestore.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return snap.size;
  }

  async bulkCreateReminders(reminders: InsertFollowupReminder[]): Promise<void> {
    if (reminders.length === 0) return;
    const batchSize = 500;
    for (let i = 0; i < reminders.length; i += batchSize) {
      const batch = firestore.batch();
      const chunk = reminders.slice(i, i + batchSize);
      for (const reminder of chunk) {
        const id = generateId();
        const now = new Date();
        batch.set(this.col("followupReminders").doc(id), toFirestoreData({ ...reminder, createdAt: now }));
      }
      await batch.commit();
    }
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
      return { leadId, reminderDate: dateStr, reminderTime: "10:00", message: msg, isCompleted: false, completedAt: null };
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
    const snap = await this.col("leadScoring").where("leadId", "==", leadId).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<LeadScoring>(snap.docs[0]);
  }

  async getAllLeadScorings(): Promise<LeadScoring[]> {
    const snap = await this.col("leadScoring").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<LeadScoring>(snap);
  }

  async upsertLeadScoring(data: InsertLeadScoring): Promise<LeadScoring> {
    const existing = await this.getLeadScoring(data.leadId);
    if (existing) {
      await this.col("leadScoring").doc(existing.id).update(toFirestoreData({ ...data, updatedAt: new Date() }));
      return fromFirestoreDoc<LeadScoring>(await this.col("leadScoring").doc(existing.id).get()) as LeadScoring;
    }
    const id = generateId();
    const now = new Date();
    const lsData = toFirestoreData({ ...data, createdAt: now, updatedAt: now });
    await this.col("leadScoring").doc(id).set(lsData);
    return { id, ...lsData } as LeadScoring;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    const snap = await this.col("serviceRequests").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<ServiceRequest>(snap);
  }

  async createServiceRequest(data: InsertServiceRequest): Promise<ServiceRequest> {
    const id = generateId();
    const now = new Date();
    const reqData = toFirestoreData({ ...data, createdAt: now });
    await this.col("serviceRequests").doc(id).set(reqData);
    return { id, ...reqData } as ServiceRequest;
  }

  async updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    return this.safeUpdate<ServiceRequest>("serviceRequests", id, data);
  }

  async getSubsidies(): Promise<Subsidy[]> {
    const snap = await this.col("subsidies").get();
    return fromFirestoreDocs<Subsidy>(snap);
  }

  async createSubsidy(data: InsertSubsidy): Promise<Subsidy> {
    const id = generateId();
    await this.col("subsidies").doc(id).set(toFirestoreData(data));
    return { id, ...data } as Subsidy;
  }

  async getSpareParts(): Promise<SparePart[]> {
    const snap = await this.col("spareParts").get();
    return fromFirestoreDocs<SparePart>(snap);
  }

  async createSparePart(data: InsertSparePart): Promise<SparePart> {
    const id = generateId();
    await this.col("spareParts").doc(id).set(toFirestoreData(data));
    return { id, ...data } as SparePart;
  }

  async getAppointments(): Promise<Appointment[]> {
    const snap = await this.col("appointments").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Appointment>(snap);
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const id = generateId();
    const now = new Date();
    const passCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const apptData = toFirestoreData({ ...data, passCode, createdAt: now });
    await this.col("appointments").doc(id).set(apptData);
    return { id, ...apptData } as Appointment;
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | undefined> {
    return this.safeUpdate<Appointment>("appointments", id, data);
  }

  async getSupplierProfiles(): Promise<SupplierProfile[]> {
    const snap = await this.col("supplierProfiles").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<SupplierProfile>(snap);
  }

  async getSupplierProfile(id: string): Promise<SupplierProfile | undefined> {
    const doc = await this.col("supplierProfiles").doc(id).get();
    return fromFirestoreDoc<SupplierProfile>(doc);
  }

  async getSupplierProfileByUserId(userId: string): Promise<SupplierProfile | undefined> {
    const snap = await this.col("supplierProfiles").where("userId", "==", userId).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<SupplierProfile>(snap.docs[0]);
  }

  async createSupplierProfile(data: InsertSupplierProfile): Promise<SupplierProfile> {
    const id = generateId();
    const now = new Date();
    const profileData = toFirestoreData({ ...data, rating: null, ratingCount: 0, createdAt: now });
    await this.col("supplierProfiles").doc(id).set(profileData);
    return { id, ...profileData } as SupplierProfile;
  }

  async updateSupplierProfile(id: string, data: Partial<SupplierProfile>): Promise<SupplierProfile | undefined> {
    return this.safeUpdate<SupplierProfile>("supplierProfiles", id, data);
  }

  async getReviews(supplierId: string): Promise<Review[]> {
    const snap = await this.col("reviews").where("supplierId", "==", supplierId).orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Review>(snap);
  }

  async createReview(data: InsertReview): Promise<Review> {
    const id = generateId();
    const now = new Date();
    const reviewData = toFirestoreData({ ...data, createdAt: now });
    await this.col("reviews").doc(id).set(reviewData);
    return { id, ...reviewData } as Review;
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    const snap = await this.col("supportTickets").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<SupportTicket>(snap);
  }

  async createSupportTicket(data: InsertSupportTicket): Promise<SupportTicket> {
    const id = generateId();
    const now = new Date();
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    const ticketData = toFirestoreData({ ...data, ticketNumber, createdAt: now, updatedAt: now });
    await this.col("supportTickets").doc(id).set(ticketData);
    return { id, ...ticketData } as SupportTicket;
  }

  async updateSupportTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    return this.safeUpdate<SupportTicket>("supportTickets", id, { ...data, updatedAt: new Date() } as any);
  }

  async getAmcPlans(): Promise<AmcPlan[]> {
    const snap = await this.col("amcPlans").get();
    return fromFirestoreDocs<AmcPlan>(snap);
  }

  async createAmcPlan(data: InsertAmcPlan): Promise<AmcPlan> {
    const id = generateId();
    await this.col("amcPlans").doc(id).set(toFirestoreData(data));
    return { id, ...data } as AmcPlan;
  }

  async updateAmcPlan(id: string, data: Partial<AmcPlan>): Promise<AmcPlan | undefined> {
    return this.safeUpdate<AmcPlan>("amcPlans", id, data);
  }

  async getAmcSubscriptions(): Promise<AmcSubscription[]> {
    const snap = await this.col("amcSubscriptions").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<AmcSubscription>(snap);
  }

  async createAmcSubscription(data: InsertAmcSubscription): Promise<AmcSubscription> {
    const id = generateId();
    const now = new Date();
    const subscriptionNumber = `AMC-${Date.now().toString().slice(-6)}`;
    const subData = toFirestoreData({ ...data, subscriptionNumber, completedVisits: 0, createdAt: now });
    await this.col("amcSubscriptions").doc(id).set(subData);
    return { id, ...subData } as AmcSubscription;
  }

  async updateAmcSubscription(id: string, data: Partial<AmcSubscription>): Promise<AmcSubscription | undefined> {
    return this.safeUpdate<AmcSubscription>("amcSubscriptions", id, data);
  }

  async getMachineDocuments(category?: string): Promise<MachineDocument[]> {
    let query: FirebaseFirestore.Query = this.col("machineDocuments");
    if (category) {
      query = query.where("category", "==", category);
    }
    const snap = await query.orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<MachineDocument>(snap);
  }

  async createMachineDocument(data: InsertMachineDocument): Promise<MachineDocument> {
    const id = generateId();
    const now = new Date();
    const docData = toFirestoreData({ ...data, createdAt: now });
    await this.col("machineDocuments").doc(id).set(docData);
    return { id, ...docData } as MachineDocument;
  }

  async deleteMachineDocument(id: string): Promise<boolean> {
    const doc = await this.col("machineDocuments").doc(id).get();
    if (!doc.exists) return false;
    await this.col("machineDocuments").doc(id).delete();
    return true;
  }

  async getInspections(): Promise<Inspection[]> {
    const snap = await this.col("inspections").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Inspection>(snap);
  }

  async createInspection(data: InsertInspection): Promise<Inspection> {
    const id = generateId();
    const now = new Date();
    const inspectionNumber = `INS-${Date.now().toString().slice(-6)}`;
    const insData = toFirestoreData({ ...data, inspectionNumber, createdAt: now });
    await this.col("inspections").doc(id).set(insData);
    return { id, ...insData } as Inspection;
  }

  async updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection | undefined> {
    return this.safeUpdate<Inspection>("inspections", id, data);
  }

  async getIsoDocuments(): Promise<IsoDocument[]> {
    const snap = await this.col("isoDocuments").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<IsoDocument>(snap);
  }

  async createIsoDocument(data: InsertIsoDocument): Promise<IsoDocument> {
    const id = generateId();
    const now = new Date();
    const documentNumber = `ISO-${Date.now().toString().slice(-6)}`;
    const isoData = toFirestoreData({ ...data, documentNumber, createdAt: now, updatedAt: now });
    await this.col("isoDocuments").doc(id).set(isoData);
    return { id, ...isoData } as IsoDocument;
  }

  async updateIsoDocument(id: string, data: Partial<IsoDocument>): Promise<IsoDocument | undefined> {
    return this.safeUpdate<IsoDocument>("isoDocuments", id, { ...data, updatedAt: new Date() } as any);
  }

  async getIsoAudits(): Promise<IsoAudit[]> {
    const snap = await this.col("isoAudits").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<IsoAudit>(snap);
  }

  async createIsoAudit(data: InsertIsoAudit): Promise<IsoAudit> {
    const id = generateId();
    const now = new Date();
    const auditNumber = `AUD-${Date.now().toString().slice(-6)}`;
    const auditData = toFirestoreData({ ...data, auditNumber, createdAt: now });
    await this.col("isoAudits").doc(id).set(auditData);
    return { id, ...auditData } as IsoAudit;
  }

  async updateIsoAudit(id: string, data: Partial<IsoAudit>): Promise<IsoAudit | undefined> {
    return this.safeUpdate<IsoAudit>("isoAudits", id, data);
  }

  async getCapas(): Promise<Capa[]> {
    const snap = await this.col("capas").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Capa>(snap);
  }

  async createCapa(data: InsertCapa): Promise<Capa> {
    const id = generateId();
    const now = new Date();
    const capaNumber = `CAPA-${Date.now().toString().slice(-6)}`;
    const capaData = toFirestoreData({ ...data, capaNumber, createdAt: now });
    await this.col("capas").doc(id).set(capaData);
    return { id, ...capaData } as Capa;
  }

  async updateCapa(id: string, data: Partial<Capa>): Promise<Capa | undefined> {
    return this.safeUpdate<Capa>("capas", id, data);
  }

  async getQuotations(): Promise<Quotation[]> {
    const snap = await this.col("quotations").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Quotation>(snap);
  }

  async getQuotation(id: string): Promise<Quotation | undefined> {
    const doc = await this.col("quotations").doc(id).get();
    return fromFirestoreDoc<Quotation>(doc);
  }

  async getQuotationByAccessCode(accessCode: string): Promise<Quotation | undefined> {
    const snap = await this.col("quotations").where("accessCode", "==", accessCode).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<Quotation>(snap.docs[0]);
  }

  async createQuotation(data: InsertQuotation): Promise<Quotation> {
    const id = generateId();
    const now = new Date();
    const quotationNumber = `QT-${Date.now().toString().slice(-6)}`;
    const quotData = toFirestoreData({
      ...data,
      quotationNumber,
      viewedAt: null,
      downloadedAt: null,
      approvedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    await this.col("quotations").doc(id).set(quotData);
    return { id, ...quotData } as Quotation;
  }

  async updateQuotation(id: string, data: Partial<Quotation>): Promise<Quotation | undefined> {
    return this.safeUpdate<Quotation>("quotations", id, { ...data, updatedAt: new Date() } as any);
  }

  async getVendorMaterials(vendorId?: string): Promise<VendorMaterial[]> {
    let query: FirebaseFirestore.Query = this.col("vendorMaterials").orderBy("createdAt", "desc");
    if (vendorId) {
      query = this.col("vendorMaterials").where("vendorId", "==", vendorId).orderBy("createdAt", "desc");
    }
    const snap = await query.get();
    return fromFirestoreDocs<VendorMaterial>(snap);
  }

  async createVendorMaterial(data: InsertVendorMaterial): Promise<VendorMaterial> {
    const id = generateId();
    const now = new Date();
    const matData = toFirestoreData({ ...data, createdAt: now });
    await this.col("vendorMaterials").doc(id).set(matData);
    return { id, ...matData } as VendorMaterial;
  }

  async updateVendorMaterial(id: string, data: Partial<VendorMaterial>): Promise<VendorMaterial | undefined> {
    return this.safeUpdate<VendorMaterial>("vendorMaterials", id, data);
  }

  async getVendorBills(vendorId?: string): Promise<VendorBill[]> {
    let query: FirebaseFirestore.Query = this.col("vendorBills").orderBy("uploadedAt", "desc");
    if (vendorId) {
      query = this.col("vendorBills").where("vendorId", "==", vendorId).orderBy("uploadedAt", "desc");
    }
    const snap = await query.get();
    return fromFirestoreDocs<VendorBill>(snap);
  }

  async createVendorBill(data: InsertVendorBill): Promise<VendorBill> {
    const id = generateId();
    const now = new Date();
    const billData = toFirestoreData({ ...data, uploadedAt: now, verifiedAt: null });
    await this.col("vendorBills").doc(id).set(billData);
    return { id, ...billData } as VendorBill;
  }

  async updateVendorBill(id: string, data: Partial<VendorBill>): Promise<VendorBill | undefined> {
    return this.safeUpdate<VendorBill>("vendorBills", id, data);
  }

  async getSettings(): Promise<AppSettings | undefined> {
    const snap = await this.col("appSettings").limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<AppSettings>(snap.docs[0]);
  }

  async updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    const snap = await this.col("appSettings").limit(1).get();
    if (snap.empty) {
      const id = "default";
      const settingsData = toFirestoreData(data);
      await this.col("appSettings").doc(id).set(settingsData);
      return { id, ...settingsData } as AppSettings;
    }
    const doc = snap.docs[0];
    const { id: _id, ...updateData } = data as any;
    await doc.ref.update(toFirestoreData(updateData));
    return fromFirestoreDoc<AppSettings>(await doc.ref.get()) as AppSettings;
  }

  async getMarketPrices(): Promise<MarketPrice[]> {
    const snap = await this.col("marketPrices").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<MarketPrice>(snap);
  }

  async createMarketPrice(data: InsertMarketPrice): Promise<MarketPrice> {
    const id = generateId();
    const now = new Date();
    const priceData = toFirestoreData({ ...data, createdAt: now });
    await this.col("marketPrices").doc(id).set(priceData);
    return { id, ...priceData } as MarketPrice;
  }

  async updateMarketPrice(id: string, data: Partial<MarketPrice>): Promise<MarketPrice | undefined> {
    return this.safeUpdate<MarketPrice>("marketPrices", id, data);
  }

  async deleteMarketPrice(id: string): Promise<boolean> {
    const doc = await this.col("marketPrices").doc(id).get();
    if (!doc.exists) return false;
    await this.col("marketPrices").doc(id).delete();
    return true;
  }

  async getHealthChecks(): Promise<HealthCheck[]> {
    const snap = await this.col("machineHealthChecks").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<HealthCheck>(snap);
  }

  async createHealthCheck(data: InsertHealthCheck): Promise<HealthCheck> {
    const id = generateId();
    const now = new Date();
    const hcData = toFirestoreData({ ...data, createdAt: now });
    await this.col("machineHealthChecks").doc(id).set(hcData);
    return { id, ...hcData } as HealthCheck;
  }

  async getComparisons(): Promise<QuotationComparison[]> {
    const snap = await this.col("quotationComparisons").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<QuotationComparison>(snap);
  }

  async createComparison(data: InsertComparison): Promise<QuotationComparison> {
    const id = generateId();
    const now = new Date();
    const compData = toFirestoreData({ ...data, createdAt: now });
    await this.col("quotationComparisons").doc(id).set(compData);
    return { id, ...compData } as QuotationComparison;
  }

  async getBanners(): Promise<Banner[]> {
    const snap = await this.col("banners").orderBy("order", "asc").get();
    return fromFirestoreDocs<Banner>(snap);
  }

  async createBanner(data: InsertBanner): Promise<Banner> {
    const id = generateId();
    const now = new Date();
    const bannerData = toFirestoreData({ ...data, createdAt: now });
    await this.col("banners").doc(id).set(bannerData);
    return { id, ...bannerData } as Banner;
  }

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner | undefined> {
    return this.safeUpdate<Banner>("banners", id, data);
  }

  async deleteBanner(id: string): Promise<boolean> {
    const doc = await this.col("banners").doc(id).get();
    if (!doc.exists) return false;
    await this.col("banners").doc(id).delete();
    return true;
  }

  async getMachineOrders(): Promise<MachineOrder[]> {
    const snap = await this.col("machineOrders").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<MachineOrder>(snap);
  }

  async getMachineOrder(id: string): Promise<MachineOrder | undefined> {
    const doc = await this.col("machineOrders").doc(id).get();
    return fromFirestoreDoc<MachineOrder>(doc);
  }

  async createMachineOrder(data: InsertMachineOrder): Promise<MachineOrder> {
    const id = generateId();
    const now = new Date();
    const count = (await this.col("machineOrders").get()).size;
    const orderNumber = `MO-${String(count + 1).padStart(4, "0")}`;
    const orderData = toFirestoreData({ ...data, orderNumber, createdAt: now, updatedAt: now });
    await this.col("machineOrders").doc(id).set(orderData);
    return { id, ...orderData } as MachineOrder;
  }

  async updateMachineOrder(id: string, data: Partial<MachineOrder>): Promise<MachineOrder | undefined> {
    const ref = this.col("machineOrders").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const { id: _id, ...updateData } = data as any;
    await ref.update(toFirestoreData({ ...updateData, updatedAt: new Date() }));
    const doc = await ref.get();
    return fromFirestoreDoc<MachineOrder>(doc);
  }

  async deleteMachineOrder(id: string): Promise<boolean> {
    const doc = await this.col("machineOrders").doc(id).get();
    if (!doc.exists) return false;
    await this.col("machineOrders").doc(id).delete();
    return true;
  }

  async getProductionWorkflows(): Promise<ProductionWorkflow[]> {
    const snap = await this.col("productionWorkflows").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<ProductionWorkflow>(snap);
  }

  async getProductionWorkflow(id: string): Promise<ProductionWorkflow | undefined> {
    const doc = await this.col("productionWorkflows").doc(id).get();
    return fromFirestoreDoc<ProductionWorkflow>(doc);
  }

  async createProductionWorkflow(data: InsertProductionWorkflow): Promise<ProductionWorkflow> {
    const id = generateId();
    const now = new Date();
    const count = (await this.col("productionWorkflows").get()).size;
    const jobId = `JOB-${String(count + 1).padStart(4, "0")}`;
    const wfData = toFirestoreData({ ...data, jobId, createdAt: now, updatedAt: now, startedAt: now });
    await this.col("productionWorkflows").doc(id).set(wfData);
    return { id, ...wfData } as ProductionWorkflow;
  }

  async updateProductionWorkflow(id: string, data: Partial<ProductionWorkflow>): Promise<ProductionWorkflow | undefined> {
    const ref = this.col("productionWorkflows").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const { id: _id, ...updateData } = data as any;
    await ref.update(toFirestoreData({ ...updateData, updatedAt: new Date() }));
    const doc = await ref.get();
    return fromFirestoreDoc<ProductionWorkflow>(doc);
  }

  async deleteProductionWorkflow(id: string): Promise<boolean> {
    const doc = await this.col("productionWorkflows").doc(id).get();
    if (!doc.exists) return false;
    await this.col("productionWorkflows").doc(id).delete();
    return true;
  }

  async getJobWorks(): Promise<JobWork[]> {
    const snap = await this.col("jobWorks").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<JobWork>(snap);
  }

  async getJobWork(id: string): Promise<JobWork | undefined> {
    const doc = await this.col("jobWorks").doc(id).get();
    return fromFirestoreDoc<JobWork>(doc);
  }

  async createJobWork(data: InsertJobWork): Promise<JobWork> {
    const id = generateId();
    const now = new Date();
    const jwData = toFirestoreData({ ...data, createdAt: now, updatedAt: now });
    await this.col("jobWorks").doc(id).set(jwData);
    return { id, ...jwData } as JobWork;
  }

  async updateJobWork(id: string, data: Partial<JobWork>): Promise<JobWork | undefined> {
    const ref = this.col("jobWorks").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const { id: _id, ...updateData } = data as any;
    await ref.update(toFirestoreData({ ...updateData, updatedAt: new Date() }));
    const doc = await ref.get();
    return fromFirestoreDoc<JobWork>(doc);
  }

  async deleteJobWork(id: string): Promise<boolean> {
    const doc = await this.col("jobWorks").doc(id).get();
    if (!doc.exists) return false;
    await this.col("jobWorks").doc(id).delete();
    return true;
  }

  async getMaterialRequests(): Promise<MaterialRequest[]> {
    const snap = await this.col("materialRequests").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<MaterialRequest>(snap);
  }

  async createMaterialRequest(data: InsertMaterialRequest): Promise<MaterialRequest> {
    const id = generateId();
    const now = new Date();
    const count = (await this.col("materialRequests").get()).size;
    const requestNumber = `MR-${String(count + 1).padStart(4, "0")}`;
    const mrData = toFirestoreData({ ...data, requestNumber, createdAt: now, updatedAt: now });
    await this.col("materialRequests").doc(id).set(mrData);
    return { id, ...mrData } as MaterialRequest;
  }

  async updateMaterialRequest(id: string, data: Partial<MaterialRequest>): Promise<MaterialRequest | undefined> {
    const ref = this.col("materialRequests").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const { id: _id, ...updateData } = data as any;
    await ref.update(toFirestoreData({ ...updateData, updatedAt: new Date() }));
    const doc = await ref.get();
    return fromFirestoreDoc<MaterialRequest>(doc);
  }

  async deleteMaterialRequest(id: string): Promise<boolean> {
    const doc = await this.col("materialRequests").doc(id).get();
    if (!doc.exists) return false;
    await this.col("materialRequests").doc(id).delete();
    return true;
  }

  async getEngineerNotes(entityType: string, entityId: string): Promise<EngineerNote[]> {
    const snap = await this.col("engineerNotes")
      .where("entityType", "==", entityType)
      .where("entityId", "==", entityId)
      .orderBy("createdAt", "desc")
      .get();
    return fromFirestoreDocs<EngineerNote>(snap);
  }

  async createEngineerNote(data: Omit<EngineerNote, "id" | "createdAt">): Promise<EngineerNote> {
    const id = generateId();
    const now = new Date();
    const noteData = toFirestoreData({ ...data, createdAt: now });
    await this.col("engineerNotes").doc(id).set(noteData);
    return { id, ...noteData } as EngineerNote;
  }

  async getUserConsents(userId: string): Promise<UserConsent[]> {
    const snap = await this.col("userConsents")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc").get();
    return fromFirestoreDocs<UserConsent>(snap);
  }

  async upsertUserConsent(data: InsertUserConsent): Promise<UserConsent> {
    const snap = await this.col("userConsents")
      .where("userId", "==", data.userId)
      .where("category", "==", data.category)
      .limit(1).get();
    const isWithdrawn = data.status === "declined" || data.status === "withdrawn";
    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      const updateData = toFirestoreData({
        status: data.status,
        consentVersion: data.consentVersion,
        ip: data.ip,
        updatedAt: new Date(),
        withdrawnAt: isWithdrawn ? new Date() : null,
      });
      await docRef.update(updateData);
      return fromFirestoreDoc<UserConsent>(await docRef.get()) as UserConsent;
    }
    const id = generateId();
    const now = new Date();
    const consentData = toFirestoreData({
      ...data,
      withdrawnAt: isWithdrawn ? new Date() : null,
      createdAt: now,
      updatedAt: now,
    });
    await this.col("userConsents").doc(id).set(consentData);
    return { id, ...consentData } as UserConsent;
  }

  async getConsentStats(): Promise<{ category: string; accepted: number; declined: number; withdrawn: number }[]> {
    const snap = await this.col("userConsents").get();
    const allConsents = fromFirestoreDocs<UserConsent>(snap);
    const categories = ["push_notifications", "marketing", "analytics"];
    return categories.map(cat => {
      const catConsents = allConsents.filter((c: any) => c.category === cat);
      return {
        category: cat,
        accepted: catConsents.filter((c: any) => c.status === "accepted").length,
        declined: catConsents.filter((c: any) => c.status === "declined").length,
        withdrawn: catConsents.filter((c: any) => c.status === "withdrawn").length,
      };
    });
  }

  async getRecentConsentActivity(limit = 20): Promise<UserConsent[]> {
    const snap = await this.col("userConsents").orderBy("updatedAt", "desc").limit(limit).get();
    return fromFirestoreDocs<UserConsent>(snap);
  }

  async getAllConsents(): Promise<UserConsent[]> {
    const snap = await this.col("userConsents").orderBy("updatedAt", "desc").get();
    return fromFirestoreDocs<UserConsent>(snap);
  }

  async getNotificationSubscription(userId: string): Promise<NotificationSubscription | undefined> {
    const snap = await this.col("notificationSubscriptions")
      .where("userId", "==", userId).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<NotificationSubscription>(snap.docs[0]);
  }

  async upsertNotificationSubscription(data: InsertNotificationSubscription): Promise<NotificationSubscription> {
    const snap = await this.col("notificationSubscriptions")
      .where("userId", "==", data.userId).limit(1).get();
    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      const updateData = toFirestoreData({
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
      });
      await docRef.update(updateData);
      return fromFirestoreDoc<NotificationSubscription>(await docRef.get()) as NotificationSubscription;
    }
    const id = generateId();
    const subData = toFirestoreData({ ...data, createdAt: new Date() });
    await this.col("notificationSubscriptions").doc(id).set(subData);
    return { id, ...subData } as NotificationSubscription;
  }

  async deleteNotificationSubscription(userId: string): Promise<boolean> {
    const snap = await this.col("notificationSubscriptions")
      .where("userId", "==", userId).get();
    if (snap.empty) return false;
    const batch = firestore.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return true;
  }

  async getOptedInPushSubscriptions(): Promise<NotificationSubscription[]> {
    const consentSnap = await this.col("userConsents")
      .where("category", "==", "push_notifications")
      .where("status", "==", "accepted").get();
    const userIds = consentSnap.docs.map(d => d.data().userId);
    if (userIds.length === 0) return [];
    const subsSnap = await this.col("notificationSubscriptions").get();
    const allSubs = fromFirestoreDocs<NotificationSubscription>(subsSnap);
    return allSubs.filter(s => userIds.includes(s.userId));
  }

  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const id = generateId();
    const now = new Date();
    const logData = toFirestoreData({ ...data, createdAt: now });
    await this.col("auditLogs").doc(id).set(logData);
    return { id, ...logData } as AuditLog;
  }

  async getAuditLogs(filters?: { eventType?: string; userId?: string; limit?: number; offset?: number }): Promise<AuditLog[]> {
    let query: FirebaseFirestore.Query = this.col("auditLogs").orderBy("createdAt", "desc");
    if (filters?.eventType) {
      query = query.where("eventType", "==", filters.eventType);
    }
    if (filters?.userId) {
      query = query.where("userId", "==", filters.userId);
    }
    const limit = filters?.limit || 200;
    query = query.limit(limit);
    if (filters?.offset) {
      const offsetSnap = await this.col("auditLogs").orderBy("createdAt", "desc").limit(filters.offset).get();
      if (!offsetSnap.empty) {
        const lastDoc = offsetSnap.docs[offsetSnap.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    const snap = await query.get();
    return fromFirestoreDocs<AuditLog>(snap);
  }

  async getFailedLoginCount24h(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snap = await this.col("auditLogs")
      .where("eventType", "==", "login_failed")
      .where("createdAt", ">=", oneDayAgo)
      .get();
    return snap.size;
  }

  async getLockedAccounts(): Promise<User[]> {
    const now = new Date();
    const snap = await this.col("users")
      .where("accountLockedUntil", ">=", now)
      .get();
    return fromFirestoreDocs<User>(snap);
  }

  async unlockAccount(userId: string): Promise<User | undefined> {
    return this.safeUpdate<User>("users", userId, { failedLoginAttempts: 0, accountLockedUntil: null } as any);
  }

  async incrementFailedLogin(userId: string): Promise<User | undefined> {
    const doc = await this.col("users").doc(userId).get();
    if (!doc.exists) return undefined;
    await this.col("users").doc(userId).update({ failedLoginAttempts: FieldValue.increment(1) });
    return fromFirestoreDoc<User>(await this.col("users").doc(userId).get());
  }

  async lockAccount(userId: string, minutes: number = 15): Promise<User | undefined> {
    const lockUntil = new Date(Date.now() + minutes * 60 * 1000);
    return this.safeUpdate<User>("users", userId, { accountLockedUntil: lockUntil, failedLoginAttempts: 0 } as any);
  }

  async resetFailedLogin(userId: string): Promise<void> {
    const doc = await this.col("users").doc(userId).get();
    if (doc.exists) {
      await this.col("users").doc(userId).update({ failedLoginAttempts: 0 });
    }
  }

  async createActiveSession(data: InsertActiveSession): Promise<ActiveSession> {
    const id = generateId();
    const now = new Date();
    const sessionData = toFirestoreData({ ...data, lastActive: now, createdAt: now });
    await this.col("activeSessions").doc(id).set(sessionData);
    return { id, ...sessionData } as ActiveSession;
  }

  async getActiveSessions(): Promise<ActiveSession[]> {
    const snap = await this.col("activeSessions").orderBy("lastActive", "desc").get();
    return fromFirestoreDocs<ActiveSession>(snap);
  }

  async getUserActiveSessions(userId: string): Promise<ActiveSession[]> {
    const snap = await this.col("activeSessions")
      .where("userId", "==", userId)
      .orderBy("lastActive", "desc").get();
    return fromFirestoreDocs<ActiveSession>(snap);
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    const doc = await this.col("activeSessions").doc(sessionId).get();
    if (!doc.exists) return false;
    await this.col("activeSessions").doc(sessionId).delete();
    return true;
  }

  async revokeSessionBySid(sid: string): Promise<boolean> {
    const snap = await this.col("activeSessions").where("sid", "==", sid).limit(1).get();
    if (snap.empty) return false;
    await snap.docs[0].ref.delete();
    return true;
  }

  async updateSessionActivity(sid: string): Promise<void> {
    const snap = await this.col("activeSessions").where("sid", "==", sid).limit(1).get();
    if (!snap.empty) {
      await snap.docs[0].ref.update({ lastActive: new Date() });
    }
  }

  async deleteSessionsByUserId(userId: string): Promise<void> {
    const snap = await this.col("activeSessions").where("userId", "==", userId).get();
    const batch = firestore.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  async getAssemblyTasks(): Promise<AssemblyTask[]> {
    const snap = await this.col("assemblyTasks").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<AssemblyTask>(snap);
  }

  async getAssemblyTasksByAssignee(userId: string): Promise<AssemblyTask[]> {
    const snap = await this.col("assemblyTasks").where("assignedTo", "==", userId).orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<AssemblyTask>(snap);
  }

  async getAssemblyTaskById(id: string): Promise<AssemblyTask | undefined> {
    const doc = await this.col("assemblyTasks").doc(id).get();
    return fromFirestoreDoc<AssemblyTask>(doc);
  }

  async createAssemblyTask(data: InsertAssemblyTask): Promise<AssemblyTask> {
    const id = generateId();
    const now = new Date();
    const taskData = toFirestoreData({ ...data, completedAt: null, createdAt: now });
    await this.col("assemblyTasks").doc(id).set(taskData);
    return { id, ...taskData } as AssemblyTask;
  }

  async updateAssemblyTask(id: string, data: Partial<AssemblyTask>): Promise<AssemblyTask | undefined> {
    return this.safeUpdate<AssemblyTask>("assemblyTasks", id, data);
  }

  async deleteAssemblyTask(id: string): Promise<boolean> {
    const doc = await this.col("assemblyTasks").doc(id).get();
    if (!doc.exists) return false;
    await this.col("assemblyTasks").doc(id).delete();
    return true;
  }

  async getIncompleteAssemblyTasks(): Promise<AssemblyTask[]> {
    const snap = await this.col("assemblyTasks").where("status", "in", ["pending", "in_progress"]).get();
    return fromFirestoreDocs<AssemblyTask>(snap);
  }

  async savePushSubscription(userId: string, sub: { endpoint: string; p256dh: string; auth: string }): Promise<PushSubscription> {
    const existing = await this.col("pushSubscriptions").where("userId", "==", userId).where("endpoint", "==", sub.endpoint).limit(1).get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      await doc.ref.update(toFirestoreData({ p256dh: sub.p256dh, auth: sub.auth }));
      const updated = await doc.ref.get();
      return fromFirestoreDoc<PushSubscription>(updated)!;
    }
    const id = generateId();
    const now = new Date();
    const data = toFirestoreData({ userId, ...sub, createdAt: now });
    await this.col("pushSubscriptions").doc(id).set(data);
    return { id, ...data } as PushSubscription;
  }

  async getPushSubscriptionsByUser(userId: string): Promise<PushSubscription[]> {
    const snap = await this.col("pushSubscriptions").where("userId", "==", userId).get();
    return fromFirestoreDocs<PushSubscription>(snap);
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    const snap = await this.col("pushSubscriptions").get();
    return fromFirestoreDocs<PushSubscription>(snap);
  }

  async deletePushSubscription(id: string): Promise<boolean> {
    const doc = await this.col("pushSubscriptions").doc(id).get();
    if (!doc.exists) return false;
    await this.col("pushSubscriptions").doc(id).delete();
    return true;
  }

  async getBroadcastPosts(): Promise<BroadcastPost[]> {
    const snap = await this.col("broadcastPosts").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<BroadcastPost>(snap);
  }

  async getBroadcastPostsByAudience(audience: string): Promise<BroadcastPost[]> {
    if (audience === "all") {
      return this.getBroadcastPosts();
    }
    const allSnap = await this.col("broadcastPosts").orderBy("createdAt", "desc").get();
    const allPosts = fromFirestoreDocs<BroadcastPost>(allSnap);
    return allPosts.filter((p: any) => p.audience === audience || p.audience === "all");
  }

  async getBroadcastPost(id: string): Promise<BroadcastPost | undefined> {
    const doc = await this.col("broadcastPosts").doc(id).get();
    if (!doc.exists) return undefined;
    return fromFirestoreDoc<BroadcastPost>(doc);
  }

  async createBroadcastPost(data: InsertBroadcastPost): Promise<BroadcastPost> {
    const id = generateId();
    const userCount = await this.countUsersByAudience(data.audience || "all");
    const now = new Date();
    const postData = toFirestoreData({ ...data, targetUserCount: userCount, viewCount: 0, createdAt: now });
    await this.col("broadcastPosts").doc(id).set(postData);
    return { id, ...postData } as BroadcastPost;
  }

  async updateBroadcastPost(id: string, data: Partial<BroadcastPost>): Promise<BroadcastPost | undefined> {
    return this.safeUpdate<BroadcastPost>("broadcastPosts", id, data);
  }

  async deleteBroadcastPost(id: string): Promise<boolean> {
    const doc = await this.col("broadcastPosts").doc(id).get();
    if (!doc.exists) return false;
    await this.col("broadcastPosts").doc(id).delete();
    return true;
  }

  async incrementBroadcastViewCount(id: string): Promise<void> {
    const ref = this.col("broadcastPosts").doc(id);
    await ref.update({ viewCount: FieldValue.increment(1) });
  }

  async countUsersByAudience(audience: string): Promise<number> {
    if (audience === "all") {
      const snap = await this.col("users").get();
      return snap.size;
    }
    const roleMap: Record<string, string> = { suppliers: "supplier", buyers: "buyer" };
    const role = roleMap[audience] || audience;
    const snap = await this.col("users").where("role", "==", role).get();
    return snap.size;
  }

  async getBroadcastNotificationPref(userId: string): Promise<BroadcastNotificationPref | undefined> {
    const snap = await this.col("broadcastNotificationPrefs")
      .where("userId", "==", userId).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<BroadcastNotificationPref>(snap.docs[0]);
  }

  async upsertBroadcastNotificationPref(userId: string, enabled: boolean): Promise<BroadcastNotificationPref> {
    const snap = await this.col("broadcastNotificationPrefs")
      .where("userId", "==", userId).limit(1).get();
    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      await docRef.update({ enabled });
      return fromFirestoreDoc<BroadcastNotificationPref>(await docRef.get()) as BroadcastNotificationPref;
    }
    const id = generateId();
    const prefData = toFirestoreData({ userId, enabled, createdAt: new Date() });
    await this.col("broadcastNotificationPrefs").doc(id).set(prefData);
    return { id, ...prefData } as BroadcastNotificationPref;
  }

  async createBroadcastNotifications(broadcastPostId: string, audience: string): Promise<number> {
    const targetSnap = audience === "all"
      ? await this.col("users").get()
      : await this.col("users").where("role", "==", (({ suppliers: "supplier", buyers: "buyer" } as Record<string, string>)[audience] || audience)).get();
    const targetUserIds = targetSnap.docs.map(d => d.id);

    const optOutSnap = await this.col("broadcastNotificationPrefs")
      .where("enabled", "==", false).get();
    const optedOutSet = new Set(optOutSnap.docs.map(d => d.data().userId));

    const eligibleUsers = targetUserIds.filter(uid => !optedOutSet.has(uid));

    const batchSize = 500;
    for (let i = 0; i < eligibleUsers.length; i += batchSize) {
      const batch = firestore.batch();
      const chunk = eligibleUsers.slice(i, i + batchSize);
      for (const uid of chunk) {
        const nid = generateId();
        batch.set(this.col("broadcastNotifications").doc(nid), toFirestoreData({
          broadcastPostId,
          userId: uid,
          isRead: false,
          createdAt: new Date(),
        }));
      }
      await batch.commit();
    }
    return eligibleUsers.length;
  }

  async getUnreadBroadcastNotifications(userId: string): Promise<BroadcastNotification[]> {
    const snap = await this.col("broadcastNotifications")
      .where("userId", "==", userId)
      .where("isRead", "==", false)
      .orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<BroadcastNotification>(snap);
  }

  async markBroadcastNotificationRead(notificationId: string, userId: string): Promise<void> {
    const doc = await this.col("broadcastNotifications").doc(notificationId).get();
    if (doc.exists && doc.data()?.userId === userId) {
      await this.col("broadcastNotifications").doc(notificationId).update({ isRead: true });
    }
  }

  async markAllBroadcastNotificationsRead(userId: string): Promise<void> {
    const snap = await this.col("broadcastNotifications")
      .where("userId", "==", userId)
      .where("isRead", "==", false).get();
    const batchSize = 500;
    for (let i = 0; i < snap.docs.length; i += batchSize) {
      const batch = firestore.batch();
      snap.docs.slice(i, i + batchSize).forEach(doc => batch.update(doc.ref, { isRead: true }));
      await batch.commit();
    }
  }

  async getUnreadBroadcastCount(userId: string): Promise<number> {
    const snap = await this.col("broadcastNotifications")
      .where("userId", "==", userId)
      .where("isRead", "==", false).get();
    return snap.size;
  }

  async getMetaSettings(): Promise<{ metaAccessToken: string | null; metaPageId: string | null; metaInstagramAccountId: string | null }> {
    const doc = await this.col("appSettings").doc("default").get();
    if (!doc.exists) return { metaAccessToken: null, metaPageId: null, metaInstagramAccountId: null };
    const data = doc.data()!;
    return {
      metaAccessToken: data.metaAccessToken || null,
      metaPageId: data.metaPageId || null,
      metaInstagramAccountId: data.metaInstagramAccountId || null,
    };
  }

  async updateMetaSettings(data: { metaAccessToken?: string; metaPageId?: string; metaInstagramAccountId?: string }): Promise<void> {
    await this.col("appSettings").doc("default").set(toFirestoreData(data), { merge: true });
  }

  async createPabblyLead(data: {
    name: string;
    phone: string;
    source: string;
    message?: string;
    email?: string;
    location?: string;
    interest?: string;
  }): Promise<Lead> {
    const id = generateId();
    const now = new Date();
    const leadData = toFirestoreData({
      name: data.name || "Unknown",
      phone: data.phone || "",
      source: data.source || "pabbly",
      message: data.message || null,
      email: data.email || null,
      location: data.location || null,
      interest: data.interest || null,
      status: "new",
      isStopList: false,
      createdAt: now,
    });
    await this.col("leads").doc(id).set(leadData);
    return { id, ...leadData } as Lead;
  }

  async getAppDownloads(): Promise<{ ios: number; android: number }> {
    const doc = await this.col("appDownloads").doc("counters").get();
    if (!doc.exists) return { ios: 0, android: 0 };
    const data = doc.data()!;
    return { ios: data.ios || 0, android: data.android || 0 };
  }

  async incrementAppDownload(platform: "ios" | "android"): Promise<{ ios: number; android: number }> {
    const ref = this.col("appDownloads").doc("counters");
    await ref.set({ [platform]: FieldValue.increment(1) }, { merge: true });
    const updated = await ref.get();
    const data = updated.data()!;
    return { ios: data.ios || 0, android: data.android || 0 };
  }

  async setAppDownloads(ios: number, android: number): Promise<{ ios: number; android: number }> {
    const ref = this.col("appDownloads").doc("counters");
    await ref.set({ ios, android }, { merge: true });
    return { ios, android };
  }

  async getInvestments(): Promise<any[]> {
    const snap = await this.col("investments").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<any>(snap);
  }

  async createInvestment(data: {
    platform: string;
    amount: number;
    date: string;
    campaignName?: string;
    notes?: string;
  }): Promise<any> {
    const id = generateId();
    const now = new Date();
    const investmentData = toFirestoreData({ ...data, createdAt: now });
    await this.col("investments").doc(id).set(investmentData);
    return { id, ...investmentData };
  }

  async updateInvestment(id: string, data: any): Promise<any | undefined> {
    return this.safeUpdate<any>("investments", id, data);
  }

  async deleteInvestment(id: string): Promise<boolean> {
    const doc = await this.col("investments").doc(id).get();
    if (!doc.exists) return false;
    await this.col("investments").doc(id).delete();
    return true;
  }

  async getLeadAnalytics(): Promise<any> {
    const leadsSnap = await this.col("leads").orderBy("createdAt", "desc").get();
    const allLeads = fromFirestoreDocs<any>(leadsSnap);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const getDate = (l: any) => l.createdAt instanceof Date ? l.createdAt : new Date(l.createdAt);

    const leadsToday = allLeads.filter(l => getDate(l) >= todayStart).length;
    const leadsThisWeek = allLeads.filter(l => getDate(l) >= weekStart).length;
    const leadsThisMonth = allLeads.filter(l => getDate(l) >= monthStart).length;

    const sourceBreakdown: Record<string, number> = {};
    for (const l of allLeads) {
      const src = l.source || "direct";
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    }

    const statusBreakdown: Record<string, number> = {};
    for (const l of allLeads) {
      const st = l.status || "new";
      statusBreakdown[st] = (statusBreakdown[st] || 0) + 1;
    }

    const dailyLeads: Record<string, number> = {};
    for (const l of allLeads) {
      const dateKey = getDate(l).toISOString().split("T")[0];
      dailyLeads[dateKey] = (dailyLeads[dateKey] || 0) + 1;
    }

    const downloads = await this.getAppDownloads();
    const investments = await this.getInvestments();
    const totalInvestment = investments.reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);

    const investmentByPlatform: Record<string, number> = {};
    for (const inv of investments) {
      const p = inv.platform || "Other";
      investmentByPlatform[p] = (investmentByPlatform[p] || 0) + (Number(inv.amount) || 0);
    }

    const totalLeads = allLeads.length;
    const convertedLeads = allLeads.filter(l => l.status === "converted" || l.status === "qualified").length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      convertedLeads,
      conversionRate,
      sourceBreakdown,
      statusBreakdown,
      dailyLeads,
      downloads,
      totalInvestment,
      investmentByPlatform,
      recentLeads: allLeads.slice(0, 50),
    };
  }

  async getManufacturers(): Promise<Manufacturer[]> {
    const snap = await this.col("manufacturers").where("isActive", "==", true).orderBy("rank", "asc").get();
    return fromFirestoreDocs<Manufacturer>(snap);
  }

  async getAllManufacturers(): Promise<Manufacturer[]> {
    const snap = await this.col("manufacturers").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Manufacturer>(snap);
  }

  async getManufacturer(id: string): Promise<Manufacturer | undefined> {
    return fromFirestoreDoc<Manufacturer>(await this.col("manufacturers").doc(id).get());
  }

  async createManufacturer(data: InsertManufacturer): Promise<Manufacturer> {
    const id = generateId();
    const now = new Date();
    const mfgData = toFirestoreData({ ...data, isActive: data.isActive ?? true, createdAt: now });
    await this.col("manufacturers").doc(id).set(mfgData);
    return { id, ...mfgData } as Manufacturer;
  }

  async updateManufacturer(id: string, data: Partial<Manufacturer>): Promise<Manufacturer | undefined> {
    return this.safeUpdate<Manufacturer>("manufacturers", id, data);
  }

  async deleteManufacturer(id: string): Promise<boolean> {
    const doc = await this.col("manufacturers").doc(id).get();
    if (!doc.exists) return false;
    await this.col("manufacturers").doc(id).delete();
    return true;
  }

  async getJobApplications(): Promise<JobApplication[]> {
    const snap = await this.col("job_applications").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<JobApplication>(snap);
  }

  async createJobApplication(data: InsertJobApplication): Promise<JobApplication> {
    const id = generateId();
    const now = new Date();
    const appData = toFirestoreData({ ...data, status: data.status || "pending", createdAt: now });
    await this.col("job_applications").doc(id).set(appData);
    return { id, ...appData } as JobApplication;
  }

  async updateJobApplication(id: string, data: Partial<JobApplication>): Promise<JobApplication | undefined> {
    return this.safeUpdate<JobApplication>("job_applications", id, data);
  }

  async deleteJobApplication(id: string): Promise<boolean> {
    const doc = await this.col("job_applications").doc(id).get();
    if (!doc.exists) return false;
    await this.col("job_applications").doc(id).delete();
    return true;
  }

  async getVideoCallSlots(): Promise<VideoCallSlot[]> {
    const snap = await this.col("videoCallSlots").orderBy("date", "asc").get();
    return fromFirestoreDocs<VideoCallSlot>(snap);
  }

  async getAvailableVideoCallSlots(): Promise<VideoCallSlot[]> {
    const today = new Date().toISOString().split("T")[0];
    const snap = await this.col("videoCallSlots")
      .where("isActive", "==", true)
      .where("date", ">=", today)
      .orderBy("date", "asc")
      .get();
    const slots = fromFirestoreDocs<VideoCallSlot>(snap);
    return slots.filter(s => s.currentBookings < s.maxBookings);
  }

  async getVideoCallSlot(id: string): Promise<VideoCallSlot | undefined> {
    const doc = await this.col("videoCallSlots").doc(id).get();
    return fromFirestoreDoc<VideoCallSlot>(doc);
  }

  async createVideoCallSlot(data: InsertVideoCallSlot): Promise<VideoCallSlot> {
    const id = generateId();
    const now = new Date();
    const slotData = toFirestoreData({ ...data, currentBookings: 0, createdAt: now });
    await this.col("videoCallSlots").doc(id).set(slotData);
    return { id, ...slotData } as VideoCallSlot;
  }

  async updateVideoCallSlot(id: string, data: Partial<VideoCallSlot>): Promise<VideoCallSlot | undefined> {
    return this.safeUpdate<VideoCallSlot>("videoCallSlots", id, data);
  }

  async deleteVideoCallSlot(id: string): Promise<boolean> {
    const doc = await this.col("videoCallSlots").doc(id).get();
    if (!doc.exists) return false;
    await this.col("videoCallSlots").doc(id).delete();
    return true;
  }

  async getVideoCallBookings(): Promise<VideoCallBooking[]> {
    const snap = await this.col("videoCallBookings").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<VideoCallBooking>(snap);
  }

  async getVideoCallBookingsByUser(userId: string): Promise<VideoCallBooking[]> {
    const snap = await this.col("videoCallBookings")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return fromFirestoreDocs<VideoCallBooking>(snap);
  }

  async getVideoCallBookingsByPhone(phone: string): Promise<VideoCallBooking[]> {
    const snap = await this.col("videoCallBookings")
      .where("userPhone", "==", phone)
      .orderBy("createdAt", "desc")
      .get();
    return fromFirestoreDocs<VideoCallBooking>(snap);
  }

  async getVideoCallBooking(id: string): Promise<VideoCallBooking | undefined> {
    const doc = await this.col("videoCallBookings").doc(id).get();
    return fromFirestoreDoc<VideoCallBooking>(doc);
  }

  async createVideoCallBooking(data: InsertVideoCallBooking): Promise<VideoCallBooking> {
    const id = generateId();
    const now = new Date();
    const bookingNumber = `VC-${Date.now().toString(36).toUpperCase()}`;
    const bookingData = toFirestoreData({ ...data, bookingNumber, createdAt: now, updatedAt: now });
    await this.col("videoCallBookings").doc(id).set(bookingData);
    const slot = await this.getVideoCallSlot(data.slotId);
    if (slot) {
      await this.col("videoCallSlots").doc(data.slotId).update({
        currentBookings: (slot.currentBookings || 0) + 1,
      });
    }
    return { id, ...bookingData } as VideoCallBooking;
  }

  async updateVideoCallBooking(id: string, data: Partial<VideoCallBooking>): Promise<VideoCallBooking | undefined> {
    const updateData = { ...data, updatedAt: new Date() };
    return this.safeUpdate<VideoCallBooking>("videoCallBookings", id, updateData);
  }

  async cancelVideoCallBooking(id: string, reason: string): Promise<VideoCallBooking | undefined> {
    const booking = await this.getVideoCallBooking(id);
    if (!booking) return undefined;
    const updated = await this.updateVideoCallBooking(id, {
      status: "cancelled",
      cancelReason: reason,
    });
    if (booking.slotId) {
      const slot = await this.getVideoCallSlot(booking.slotId);
      if (slot && slot.currentBookings > 0) {
        await this.col("videoCallSlots").doc(booking.slotId).update({
          currentBookings: slot.currentBookings - 1,
        });
      }
    }
    return updated;
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    const snap = await this.col("referrals").where("referrerUserId", "==", userId).orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<Referral>(snap);
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const snap = await this.col("referrals").where("referralCode", "==", code).limit(1).get();
    if (snap.empty) return undefined;
    return fromFirestoreDoc<Referral>(snap.docs[0]);
  }

  async getUserReferralCode(userId: string): Promise<string> {
    const snap = await this.col("referralCodes").doc(userId).get();
    if (snap.exists) return snap.data()!.code;
    const code = "SAI" + userId.slice(0, 4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    await this.col("referralCodes").doc(userId).set({ code, userId, createdAt: new Date() });
    return code;
  }

  async createReferral(data: InsertReferral): Promise<Referral> {
    const id = generateId();
    const now = new Date();
    const refData = toFirestoreData({ ...data, createdAt: now });
    await this.col("referrals").doc(id).set(refData);
    return { id, ...refData } as Referral;
  }

  async getReferralCount(userId: string): Promise<number> {
    const snap = await this.col("referrals").where("referrerUserId", "==", userId).where("status", "==", "joined").get();
    return snap.size;
  }

  async resolveReferralOwner(code: string): Promise<string | null> {
    const snap = await this.col("referralCodes").where("code", "==", code).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data().userId;
  }

  async updateReferralField(id: string, data: Partial<Referral>): Promise<void> {
    const ref = this.col("referrals").doc(id);
    await ref.update(toFirestoreData(data));
  }

  async getReferralRewards(userId: string): Promise<ReferralReward[]> {
    const snap = await this.col("referralRewards").where("userId", "==", userId).get();
    return fromFirestoreDocs<ReferralReward>(snap);
  }

  async unlockReferralReward(userId: string, rewardType: string): Promise<ReferralReward> {
    const id = generateId();
    const now = new Date();
    const data = toFirestoreData({ userId, rewardType, isUnlocked: true, unlockedAt: now, createdAt: now });
    await this.col("referralRewards").doc(id).set(data);
    return { id, ...data } as ReferralReward;
  }

  async getIndustryData(): Promise<IndustryData[]> {
    const snap = await this.col("industryData").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<IndustryData>(snap);
  }

  async getIndustryDataByType(type: string): Promise<IndustryData[]> {
    const snap = await this.col("industryData").where("type", "==", type).orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<IndustryData>(snap);
  }

  async createIndustryData(data: InsertIndustryData): Promise<IndustryData> {
    const id = generateId();
    const now = new Date();
    const indData = toFirestoreData({ ...data, createdAt: now });
    await this.col("industryData").doc(id).set(indData);
    return { id, ...indData } as IndustryData;
  }

  async updateIndustryData(id: string, data: Partial<IndustryData>): Promise<IndustryData | undefined> {
    return this.safeUpdate<IndustryData>("industryData", id, { ...data, updatedAt: new Date() });
  }

  async deleteIndustryData(id: string): Promise<boolean> {
    const doc = await this.col("industryData").doc(id).get();
    if (!doc.exists) return false;
    await this.col("industryData").doc(id).delete();
    return true;
  }

  async getProductionPosts(): Promise<ProductionPost[]> {
    const snap = await this.col("productionPosts").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<ProductionPost>(snap);
  }

  async createProductionPost(data: InsertProductionPost): Promise<ProductionPost> {
    const id = generateId();
    const now = new Date();
    const postData = toFirestoreData({ ...data, likes: 0, createdAt: now });
    await this.col("productionPosts").doc(id).set(postData);
    return { id, ...postData } as ProductionPost;
  }

  async likeProductionPost(id: string): Promise<void> {
    const ref = this.col("productionPosts").doc(id);
    await ref.update({ likes: FieldValue.increment(1) });
  }

  async deleteProductionPost(id: string): Promise<boolean> {
    const doc = await this.col("productionPosts").doc(id).get();
    if (!doc.exists) return false;
    await this.col("productionPosts").doc(id).delete();
    return true;
  }

  async getGeminiConversations(): Promise<any[]> {
    const snap = await this.col("gemini_conversations").orderBy("createdAt", "desc").get();
    return fromFirestoreDocs<any>(snap);
  }

  async createGeminiConversation(title: string): Promise<any> {
    const id = generateId();
    const data = { title, createdAt: new Date() };
    await this.col("gemini_conversations").doc(id).set(data);
    return { id, ...data };
  }

  async getGeminiConversation(id: string): Promise<any | undefined> {
    const doc = await this.col("gemini_conversations").doc(id).get();
    return fromFirestoreDoc<any>(doc);
  }

  async deleteGeminiConversation(id: string): Promise<boolean> {
    const doc = await this.col("gemini_conversations").doc(id).get();
    if (!doc.exists) return false;
    const messagesSnap = await this.col("gemini_messages").where("conversationId", "==", id).get();
    const batch = firestore.batch();
    messagesSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(this.col("gemini_conversations").doc(id));
    await batch.commit();
    return true;
  }

  async getGeminiMessages(conversationId: string): Promise<any[]> {
    const snap = await this.col("gemini_messages").where("conversationId", "==", conversationId).orderBy("createdAt", "asc").get();
    return fromFirestoreDocs<any>(snap);
  }

  async addGeminiMessage(conversationId: string, role: string, content: string): Promise<any> {
    const id = generateId();
    const data = { conversationId, role, content, createdAt: new Date() };
    await this.col("gemini_messages").doc(id).set(data);
    return { id, ...data };
  }

  async getAppSettings(): Promise<AppSettings | undefined> {
    return this.getSettings();
  }

  async getDiscussions(entityType: string, entityId: string): Promise<any[]> {
    const snap = await this.col("discussions")
      .where("entityType", "==", entityType)
      .where("entityId", "==", entityId)
      .orderBy("createdAt", "desc")
      .get();
    return fromFirestoreDocs<any>(snap);
  }

  async createDiscussion(data: { entityType: string; entityId: string; content: string; authorName: string; authorRole: string; authorId?: string }): Promise<any> {
    const id = generateId();
    const now = new Date();
    const discussionData = toFirestoreData({ ...data, createdAt: now });
    await this.col("discussions").doc(id).set(discussionData);
    return { id, ...discussionData };
  }

  async upsertAppSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    const snap = await this.col("appSettings").limit(1).get();
    if (snap.empty) {
      const id = "default";
      const settingsData = toFirestoreData(data);
      await this.col("appSettings").doc(id).set(settingsData);
      return { id, ...settingsData } as AppSettings;
    }
    const doc = snap.docs[0];
    const { id: _id, ...updateData } = data as any;
    if (Object.keys(updateData).length > 0) {
      await doc.ref.update(toFirestoreData(updateData));
    }
    return fromFirestoreDoc<AppSettings>(await doc.ref.get()) as AppSettings;
  }
}

export const storage = new Storage();
