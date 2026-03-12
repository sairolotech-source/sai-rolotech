import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { storage as db } from "../storage.js";
import { requireAdmin, hashPassword, comparePasswords } from "../auth.js";

const router = Router();

router.post("/admin/settings/assistant-pin", requireAdmin, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ message: "PIN must be 4-6 digits" });
    }
    const hashedPin = await hashPassword(pin);
    await db.upsertAppSettings({ assistantPin: hashedPin });
    return res.json({ message: "PIN set successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/assistant/verify-pin", requireAdmin, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: "PIN required" });
    const settings = await db.getAppSettings();
    if (!settings?.assistantPin) {
      return res.status(400).json({ message: "PIN not set yet. Go to Settings to set it." });
    }
    const valid = await comparePasswords(pin, settings.assistantPin);
    if (!valid) return res.status(401).json({ message: "Galat PIN" });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/assistant/pin-status", requireAdmin, async (req, res) => {
  try {
    const settings = await db.getAppSettings();
    return res.json({ hasPin: !!settings?.assistantPin });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

const toolDeclarations = [
  {
    name: "get_leads_summary",
    description: "Get summary of all leads: total count, HOT/NORMAL/COLD counts, today's follow-ups, upcoming visits",
    parameters: { type: "OBJECT" as const, properties: {}, required: [] as string[] },
  },
  {
    name: "get_upcoming_visits",
    description: "Get list of upcoming factory visits scheduled in the next 7 days",
    parameters: { type: "OBJECT" as const, properties: {}, required: [] as string[] },
  },
  {
    name: "search_leads",
    description: "Search leads by name, city, or machine type",
    parameters: {
      type: "OBJECT" as const,
      properties: {
        query: { type: "STRING" as const, description: "Search term for name, city, or machine type" },
      },
      required: ["query"],
    },
  },
  {
    name: "update_lead_status",
    description: "Update a lead's status. IMPORTANT: Always ask admin for confirmation before calling this.",
    parameters: {
      type: "OBJECT" as const,
      properties: {
        leadId: { type: "STRING" as const, description: "The lead's ID" },
        status: { type: "STRING" as const, description: "New status: HOT, NORMAL, COLD, or STOP" },
      },
      required: ["leadId", "status"],
    },
  },
  {
    name: "add_reminder",
    description: "Add a follow-up reminder for a lead. Always confirm with admin before creating.",
    parameters: {
      type: "OBJECT" as const,
      properties: {
        leadId: { type: "STRING" as const, description: "The lead's ID" },
        reminderDate: { type: "STRING" as const, description: "Date in YYYY-MM-DD format" },
        message: { type: "STRING" as const, description: "Reminder message" },
      },
      required: ["leadId", "reminderDate", "message"],
    },
  },
  {
    name: "web_search",
    description: "Search the internet for real-time information like steel prices, market trends, news, competitor info, etc.",
    parameters: {
      type: "OBJECT" as const,
      properties: {
        query: { type: "STRING" as const, description: "Search query in natural language" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_products",
    description: "Get list of all products/machines in the catalog",
    parameters: { type: "OBJECT" as const, properties: {}, required: [] as string[] },
  },
  {
    name: "get_today_reminders",
    description: "Get today's pending follow-up reminders",
    parameters: { type: "OBJECT" as const, properties: {}, required: [] as string[] },
  },
];

const SYSTEM_PROMPT = `Tu Sai Rolotech ka AI Personal Assistant hai. Tujhe admin ki tarah kaam karna hai - business ke baare mein sawal ka jawab de, leads manage kar, reminders set kar, internet se info la, aur sab kuch handle kar.

Rules:
1. Hindi/Hinglish mein baat kar (admin ki preference hai). English mein bhi bol sakta hai agar zaroori ho.
2. Chhota aur seedha jawab de. Zyada lamba mat kar.
3. Koi bhi data CHANGE karne se pehle (lead status change, reminder add, etc.) - PEHLE admin se confirm kar. Bolo "Kya aap sure hain? Haan ya Naa bolein."
4. Internet search ke results ko clear aur simple format mein dikhaa.
5. Numbers aur stats ko readable format mein de (commas, Rs symbol, etc.)
6. Tu ek industrial roll forming machine manufacturer ka assistant hai. Company: Sai Rolotech. Products: Rolling Shutter machines, C/Z Purlin machines, Roof Panel machines, etc.
7. Markdown use mat kar. Plain text mein jawab de. Bold, italic, headers mat use kar.
8. Jab leads ki list dikhaani ho, concise format mein dikhaa: Naam - Phone - City - Status
9. Professional aur helpful tone mein baat kar.`;

async function executeTool(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case "get_leads_summary": {
      const stats = await db.getLeadStats();
      return `Lead Summary:\nTotal: ${stats.total}\nHOT: ${stats.hot}\nNORMAL: ${stats.normal}\nCOLD: ${stats.cold}\nSTOP: ${stats.stop}\nAaj ke follow-ups: ${stats.todayFollowups}\nUpcoming visits (7 din): ${stats.upcomingVisits}`;
    }
    case "get_upcoming_visits": {
      const allLeads = await db.getLeads();
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = allLeads.filter(l => l.visitScheduledAt && new Date(l.visitScheduledAt) >= now && new Date(l.visitScheduledAt) <= nextWeek);
      if (upcoming.length === 0) return "Agle 7 din mein koi visit scheduled nahi hai.";
      return upcoming.map(l => `${l.name} - ${l.phone} - ${l.city || "N/A"} - Visit: ${new Date(l.visitScheduledAt!).toLocaleDateString("hi-IN")}`).join("\n");
    }
    case "search_leads": {
      const q = (args.query || "").toLowerCase();
      const allLeads = await db.getLeads();
      const matches = allLeads.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.machineType && l.machineType.toLowerCase().includes(q)) ||
        l.phone.includes(q)
      );
      if (matches.length === 0) return `"${args.query}" se koi lead nahi mili.`;
      return matches.slice(0, 10).map(l => `${l.name} - ${l.phone} - ${l.city || "N/A"} - ${l.machineType || "N/A"} - Status: ${l.status} [ID: ${l.id}]`).join("\n");
    }
    case "update_lead_status": {
      const { leadId, status } = args;
      const lead = await db.updateLead(leadId, { status, isStopList: status === "STOP" });
      if (!lead) return "Lead nahi mili. ID check karo.";
      if (status === "STOP") {
        await db.deletePendingRemindersByLeadId(leadId);
      } else if (status === "HOT") {
        await db.switchToHotSchedule(leadId);
      }
      return `${lead.name} ka status "${status}" mein change ho gaya.`;
    }
    case "add_reminder": {
      const { leadId, reminderDate, message } = args;
      const reminder = await db.createFollowupReminder({ leadId, reminderDate, reminderTime: "10:00", message });
      return `Reminder set ho gaya: "${message}" on ${reminderDate}`;
    }
    case "web_search": {
      try {
        const response = await fetch(`https://www.google.com/search?q=${encodeURIComponent(args.query)}`, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        return `Internet search for "${args.query}" - Please note: Direct web search from server is limited. Admin ko internet browser se check karna chahiye.`;
      } catch {
        return `Internet search for "${args.query}" abhi available nahi hai. Admin ko browser se check karna chahiye.`;
      }
    }
    case "get_products": {
      const products = await db.getProducts();
      if (products.length === 0) return "Abhi koi product catalog mein nahi hai.";
      return products.map(p => `${p.name} - ${p.category} - ${p.automation} - Rs ${p.estimatedPrice || "N/A"}`).join("\n");
    }
    case "get_today_reminders": {
      const today = new Date().toISOString().split("T")[0];
      const allReminders = await db.getFollowupReminders();
      const todayReminders = allReminders.filter(r => r.reminderDate === today && !r.isCompleted);
      if (todayReminders.length === 0) return "Aaj koi pending reminder nahi hai.";
      return todayReminders.map(r => `${r.message} [Lead ID: ${r.leadId}]`).join("\n");
    }
    default:
      return "Unknown tool";
  }
}

router.post("/admin/assistant/chat", requireAdmin, async (req, res) => {
  try {
    const { messages: clientMessages } = req.body;
    if (!clientMessages || !Array.isArray(clientMessages)) {
      return res.status(400).json({ message: "messages array required" });
    }

    const contents = clientMessages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    let response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        maxOutputTokens: 8192,
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: toolDeclarations }],
      },
    });

    let iterations = 0;
    const maxIterations = 5;

    while (response.functionCalls && response.functionCalls.length > 0 && iterations < maxIterations) {
      iterations++;

      const functionResponses: any[] = [];
      for (const fc of response.functionCalls) {
        const result = await executeTool(fc.name, fc.args || {});
        functionResponses.push({
          name: fc.name,
          response: { result },
        });
      }

      contents.push({
        role: "model",
        parts: response.candidates?.[0]?.content?.parts || [],
      });

      contents.push({
        role: "user",
        parts: functionResponses.map((fr: any) => ({
          functionResponse: fr,
        })),
      });

      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          maxOutputTokens: 8192,
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations: toolDeclarations }],
        },
      });
    }

    const reply = response.text || "Koi jawab nahi mila. Dobara try karo.";
    return res.json({ reply });
  } catch (err: any) {
    console.error("Assistant chat error:", err);
    return res.status(500).json({ message: "AI assistant error: " + (err.message || "Unknown error") });
  }
});

const CLIENT_SYSTEM_PROMPT = `Tu Sai Rolotech ka AI Customer Assistant hai. Tu visitors aur buyers ko help karta hai - machines ke baare mein info dena, pricing, delivery timelines, factory visit booking, etc.

Company: Sai Rolotech
Products: Rolling Shutter Patti Machines, False Ceiling (POP Channel, Gypsum Channel, T-Grid), Roof Panel machines, Door Frame machines, C/Z Purlin machines
Location: Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi, Delhi 110041
Phone: +91 9090-486-262
Email: sairolotech@gmail.com

Pricing Guide:
- Shutter Patti Basic: Rs 2.7L-3.6L
- Shutter Patti Medium: Rs 4.4L-5.5L
- Shutter Patti Advance: Rs 7.8L
- POP Channel 3-in-1: Rs 6L-8.5L
- POP Channel 2-in-1: Rs 5L-7L
- Gypsum Single: Rs 3.5L-4.5L
- Gypsum 2-in-1: Rs 7.5L
- Gypsum 4-in-1: Rs 12L
- T-Grid Line: Rs 15.5L

Delivery: Basic 20-30 days, Medium 30-40 days, Advance 35-45 days

Rules:
1. Hindi/Hinglish ya English mein baat kar - jo customer bole.
2. Friendly aur helpful tone rakho.
3. Pricing info share karo but exact quote ke liye call karne bolo.
4. Factory visit encourage karo.
5. Markdown use mat kar. Plain text mein jawab de.
6. Chhota aur useful jawab de. Zyada lamba mat kar.
7. Agar koi technical ya sales question ho jo tu handle nahi kar sakta, customer ko phone karne bolo.`;

router.post("/client/chat", async (req, res) => {
  try {
    const { messages: clientMessages } = req.body;
    if (!clientMessages || !Array.isArray(clientMessages)) {
      return res.status(400).json({ message: "messages array required" });
    }

    const contents = clientMessages.slice(-10).map((m: any) => ({
      role: m.role === "bot" || m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text || m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        maxOutputTokens: 1024,
        systemInstruction: CLIENT_SYSTEM_PROMPT,
      },
    });

    const reply = response.text || "Sorry, I could not process your request. Please call us at +91 9090-486-262.";
    return res.json({ reply });
  } catch (err: any) {
    console.error("Client chat error:", err);
    return res.json({ reply: "I'm having trouble right now. Please call us at +91 9090-486-262 or WhatsApp us for immediate help!" });
  }
});

const OTP_EXPIRY_MINUTES = 10;

router.post("/admin/assistant/send-otp", requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db.createOtpCode({
      userId: (req as any).user?.id || null,
      email,
      code,
      purpose: "assistant_unlock",
      expiresAt,
    });

    const { sendOTPEmail } = await import("../email.js");
    const username = (req as any).user?.name || (req as any).user?.username || "Admin";
    const sent = await sendOTPEmail(email, code, username);

    if (!sent) {
      return res.json({ success: true, message: "OTP generated (email delivery may be unavailable)", devCode: process.env.NODE_ENV === "development" ? code : undefined });
    }

    return res.json({ success: true, message: `OTP sent to ${email}` });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/assistant/verify-otp", requireAdmin, async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and OTP code required" });
    }

    const otp = await db.getValidOtpCode(email, code, "assistant_unlock");
    if (!otp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    await db.markOtpUsed(otp.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
