import { 
  generatedCode, 
  type GeneratedCode, 
  type InsertGeneratedCode,
  type ChatSession,
  type ChatMessage,
  type InsertChatSession,
  type InsertChatMessage 
} from "@shared/schema";

export interface IStorage {
  saveGeneratedCode(code: InsertGeneratedCode): Promise<GeneratedCode>;
  getGeneratedCode(id: number): Promise<GeneratedCode | undefined>;
  getRecentGeneratedCodes(limit: number): Promise<GeneratedCode[]>;
  
  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getRecentChatSessions(limit: number): Promise<ChatSession[]>;
  updateChatSessionTimestamp(id: number): Promise<void>;
  
  // Chat message methods
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private codes: Map<number, GeneratedCode>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage[]>;
  private currentId: number;
  private currentSessionId: number;
  private currentMessageId: number;

  constructor() {
    this.codes = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.currentId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
  }

  async saveGeneratedCode(insertCode: InsertGeneratedCode): Promise<GeneratedCode> {
    const id = this.currentId++;
    const code: GeneratedCode = { 
      ...insertCode,
      htmlCode: insertCode.htmlCode || "",
      cssCode: insertCode.cssCode || "",
      jsCode: insertCode.jsCode || "",
      aiModel: insertCode.aiModel || "gemini",
      id,
      createdAt: new Date()
    };
    this.codes.set(id, code);
    return code;
  }

  async getGeneratedCode(id: number): Promise<GeneratedCode | undefined> {
    return this.codes.get(id);
  }

  async getRecentGeneratedCodes(limit: number): Promise<GeneratedCode[]> {
    const codes = Array.from(this.codes.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return codes;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const chatSession: ChatSession = {
      ...session,
      id,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    this.chatSessions.set(id, chatSession);
    this.chatMessages.set(id, []); // Initialize empty message array for this session
    return chatSession;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getRecentChatSessions(limit: number): Promise<ChatSession[]> {
    const sessions = Array.from(this.chatSessions.values())
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, limit);
    return sessions;
  }

  async updateChatSessionTimestamp(id: number): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      session.lastUpdated = new Date();
      this.chatSessions.set(id, session);
    }
  }

  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const chatMessage: ChatMessage = {
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      codeId: message.codeId ?? null,
      id,
      createdAt: new Date()
    };
    
    const sessionMessages = this.chatMessages.get(message.sessionId) || [];
    sessionMessages.push(chatMessage);
    this.chatMessages.set(message.sessionId, sessionMessages);
    
    // Update session timestamp
    await this.updateChatSessionTimestamp(message.sessionId);
    
    return chatMessage;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return this.chatMessages.get(sessionId) || [];
  }
}

export const storage = new MemStorage();
