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

