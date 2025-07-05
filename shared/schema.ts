import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const generatedCode = pgTable("generated_code", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  htmlCode: text("html_code").notNull().default(""),
  cssCode: text("css_code").notNull().default(""),
  jsCode: text("js_code").notNull().default(""),
  aiModel: text("ai_model").notNull().default("gemini"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatSession = pgTable("chat_session", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const chatMessage = pgTable("chat_message", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  codeId: integer("code_id"), // reference to generated code if applicable
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGeneratedCodeSchema = createInsertSchema(generatedCode).pick({
  prompt: true,
  htmlCode: true,
  cssCode: true,
  jsCode: true,
  aiModel: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSession).pick({
  title: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessage).pick({
  sessionId: true,
  role: true,
  content: true,
  codeId: true,
});

export type InsertGeneratedCode = z.infer<typeof insertGeneratedCodeSchema>;
export type GeneratedCode = typeof generatedCode.$inferSelect;
export type ChatSession = typeof chatSession.$inferSelect;
export type ChatMessage = typeof chatMessage.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export const generateCodeRequestSchema = z.object({
  prompt: z.string().max(100), // Maximum 100 characters as requested
  sessionId: z.number().nullable().optional(),
});

export type GenerateCodeRequest = z.infer<typeof generateCodeRequestSchema>;

export const generateCodeResponseSchema = z.object({
  html: z.string(),
  css: z.string(),
  javascript: z.string(),
  sessionId: z.number().optional(),
});

export type GenerateCodeResponse = z.infer<typeof generateCodeResponseSchema>;
