import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCode } from "./services/gemini";
import { generateCodeRequestSchema } from "@shared/schema";
import { datasetSaver } from "./services/dataset-saver";
import { apiConfigService } from "./services/api-config";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate code using AI
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, sessionId } = generateCodeRequestSchema.parse(req.body);
      
      let chatHistory: any[] = [];
      let currentSessionId = sessionId;
      
      // If no sessionId provided, create a new chat session
      if (!currentSessionId) {
        const newSession = await storage.createChatSession({
          title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '')
        });
        currentSessionId = newSession.id;
      } else {
        // Get existing chat history
        chatHistory = await storage.getChatMessages(currentSessionId);
      }
      
      // Save user message
      await storage.saveChatMessage({
        sessionId: currentSessionId,
        role: 'user',
        content: prompt,
        codeId: null
      });
      
      // Generate code with context
      const result = await generateCode(prompt, chatHistory);
      
      // Save generated code
      const saved = await storage.saveGeneratedCode({
        prompt,
        htmlCode: result.html,
        cssCode: result.css,
        jsCode: result.javascript,
        aiModel: "gemini",
      });
      
      // Save to dataset for potential c2 model training
      await datasetSaver.saveGeneratedCode(saved, prompt);
      
      // Save assistant message with code reference
      await storage.saveChatMessage({
        sessionId: currentSessionId,
        role: 'assistant',
        content: `Generated code for: ${prompt}`,
        codeId: saved.id
      });
      
      res.json({
        id: saved.id,
        html: result.html,
        css: result.css,
        javascript: result.javascript,
        aiModel: saved.aiModel,
        sessionId: currentSessionId,
      });
    } catch (error) {
      console.error("Code generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate code"
      });
    }
  });

  // Get generated code by ID
  app.get("/api/generated/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const code = await storage.getGeneratedCode(id);
      
      if (!code) {
        return res.status(404).json({ message: "Generated code not found" });
      }
      
      res.json(code);
    } catch (error) {
      console.error("Error fetching generated code:", error);
      res.status(500).json({ message: "Failed to fetch generated code" });
    }
  });

  // Save generated code separately
  app.post("/api/save-code", async (req, res) => {
    try {
      const { prompt, htmlCode, cssCode, jsCode } = req.body;
      
      const saved = await storage.saveGeneratedCode({
        prompt,
        htmlCode,
        cssCode,
        jsCode,
        aiModel: "gemini",
      });
      
      res.json(saved);
    } catch (error) {
      console.error("Error saving code:", error);
      res.status(500).json({ message: "Failed to save code" });
    }
  });

  // Get recent generated codes
  app.get("/api/recent-codes", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const codes = await storage.getRecentGeneratedCodes(limit);
      res.json(codes);
    } catch (error) {
      console.error("Error fetching recent codes:", error);
      res.status(500).json({ message: "Failed to fetch recent codes" });
    }
  });

  // Update existing generated code
  app.put("/api/generated/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { prompt } = generateCodeRequestSchema.parse(req.body);
      
      const result = await generateCode(prompt);
      
      // Save updated version
      const saved = await storage.saveGeneratedCode({
        prompt,
        htmlCode: result.html,
        cssCode: result.css,
        jsCode: result.javascript,
        aiModel: "gemini",
      });
      
      res.json({
        id: saved.id,
        html: result.html,
        css: result.css,
        javascript: result.javascript,
        aiModel: saved.aiModel,
      });
    } catch (error) {
      console.error("Code update error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update code"
      });
    }
  });

  // Get chat sessions
  app.get("/api/chat/sessions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await storage.getRecentChatSessions(limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  // Get chat messages for a session
  app.get("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Get chat session details
  app.get("/api/chat/sessions/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const messages = await storage.getChatMessages(sessionId);
      res.json({ ...session, messages });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  // Dataset management endpoints
  app.get("/api/dataset/stats", async (req, res) => {
    try {
      const stats = await datasetSaver.getDatasetStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dataset stats:", error);
      res.status(500).json({ message: "Failed to fetch dataset stats" });
    }
  });

  app.get("/api/dataset/export", async (req, res) => {
    try {
      const dataset = await datasetSaver.exportDatasetForTraining();
      res.json(dataset);
    } catch (error) {
      console.error("Error exporting dataset:", error);
      res.status(500).json({ message: "Failed to export dataset" });
    }
  });

  // Training data export for c2 model
  app.get("/api/dataset/training-format", async (req, res) => {
    try {
      const dataset = await datasetSaver.exportDatasetForTraining();
      
      // Format for training: input-output pairs
      const trainingData = dataset.prompts.map((prompt, index) => ({
        input: prompt,
        output: {
          html: dataset.htmlOutputs[index],
          css: dataset.cssOutputs[index],
          javascript: dataset.jsOutputs[index]
        },
        metadata: dataset.metadata[index]
      }));

      res.json({
        format: "training-pairs",
        total_samples: trainingData.length,
        data: trainingData
      });
    } catch (error) {
      console.error("Error exporting training format:", error);
      res.status(500).json({ message: "Failed to export training format" });
    }
  });

  // API Configuration endpoints
  app.get("/api/config/status", async (req, res) => {
    try {
      const status = await apiConfigService.getConfigStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting config status:", error);
      res.status(500).json({ message: "Failed to get config status" });
    }
  });

  app.post("/api/config/api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ message: "API key is required" });
      }

      await apiConfigService.updateApiKey(apiKey);
      res.json({ message: "API key updated successfully" });
    } catch (error) {
      console.error("Error updating API key:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update API key";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/config", async (req, res) => {
    try {
      const config = await apiConfigService.getGeminiConfig();
      
      // Don't expose the actual API key for security
      res.json({
        hasApiKey: !!config.apiKey,
        model: config.model,
        maxTokens: config.maxTokens,
        temperature: config.temperature
      });
    } catch (error) {
      console.error("Error getting config:", error);
      res.status(500).json({ message: "Failed to get config" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
