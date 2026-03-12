import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { generateImage } from "@workspace/integrations-gemini-ai/image";
import { storage as db } from "../../storage.js";
import { requireAdmin } from "../../auth.js";

const router = Router();

router.get("/gemini/conversations", requireAdmin, async (req, res) => {
  try {
    const conversations = await db.getGeminiConversations();
    return res.json(conversations);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/gemini/conversations", requireAdmin, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    const conversation = await db.createGeminiConversation(title);
    return res.status(201).json(conversation);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/gemini/conversations/:id", requireAdmin, async (req, res) => {
  try {
    const conversation = await db.getGeminiConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const messages = await db.getGeminiMessages(req.params.id);
    return res.json({ ...conversation, messages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/gemini/conversations/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteGeminiConversation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/gemini/conversations/:id/messages", requireAdmin, async (req, res) => {
  try {
    const messages = await db.getGeminiMessages(req.params.id);
    return res.json(messages);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/gemini/conversations/:id/messages", requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const conversation = await db.getGeminiConversation(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await db.addGeminiMessage(req.params.id, "user", content);

    const previousMessages = await db.getGeminiMessages(req.params.id);
    const chatContents = previousMessages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: chatContents,
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.addGeminiMessage(req.params.id, "assistant", fullResponse || "No response generated.");

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Gemini message error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message });
    }
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

router.post("/gemini/generate-image", requireAdmin, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }
    const { b64_json, mimeType } = await generateImage(prompt);
    return res.json({ b64_json, mimeType });
  } catch (err: any) {
    console.error("Gemini image generation error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
