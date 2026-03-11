import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { storage as db } from "../storage.js";
import { requireAdmin, hashPassword, comparePasswords } from "../auth.js";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

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

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_leads_summary",
      description: "Get summary of all leads: total count, HOT/NORMAL/COLD counts, today's follow-ups, upcoming visits",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upcoming_visits",
      description: "Get list of upcoming factory visits scheduled in the next 7 days",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_leads",
      description: "Search leads by name, city, or machine type",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term for name, city, or machine type" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead_status",
      description: "Update a lead's status. IMPORTANT: Always ask admin for confirmation before calling this.",
      parameters: {
        type: "object",
        properties: {
          leadId: { type: "string", description: "The lead's ID" },
          status: { type: "string", enum: ["HOT", "NORMAL", "COLD", "STOP"], description: "New status" },
        },
        required: ["leadId", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_reminder",
      description: "Add a follow-up reminder for a lead. Always confirm with admin before creating.",
      parameters: {
        type: "object",
        properties: {
          leadId: { type: "string", description: "The lead's ID" },
          reminderDate: { type: "string", description: "Date in YYYY-MM-DD format" },
          message: { type: "string", description: "Reminder message" },
        },
        required: ["leadId", "reminderDate", "message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the internet for real-time information like steel prices, market trends, news, competitor info, etc.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query in natural language" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_products",
      description: "Get list of all products/machines in the catalog",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_today_reminders",
      description: "Get today's pending follow-up reminders",
      parameters: { type: "object", properties: {}, required: [] },
    },
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

    const chatMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...clientMessages,
    ];

    let response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8192,
      messages: chatMessages,
      tools,
    });

    let assistantMessage = response.choices[0]?.message;
    let iterations = 0;
    const maxIterations = 5;

    while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0 && iterations < maxIterations) {
      iterations++;
      chatMessages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        let fnArgs: Record<string, any> = {};
        try {
          fnArgs = JSON.parse(toolCall.function.arguments);
        } catch {}

        const result = await executeTool(fnName, fnArgs);
        chatMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 8192,
        messages: chatMessages,
        tools,
      });
      assistantMessage = response.choices[0]?.message;
    }

    const reply = assistantMessage?.content || "Koi jawab nahi mila. Dobara try karo.";
    return res.json({ reply });
  } catch (err: any) {
    console.error("Assistant chat error:", err);
    return res.status(500).json({ message: "AI assistant error: " + (err.message || "Unknown error") });
  }
});

export default router;
