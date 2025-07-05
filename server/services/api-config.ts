import { promises as fs } from 'fs';
import path from 'path';

interface ApiConfig {
  gemini: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  team: {
    description: string;
    instructions: string[];
  };
  fallback: {
    enabled: boolean;
    description: string;
  };
}

export class ApiConfigService {
  private configPath = 'api.json';
  private config: ApiConfig | null = null;

  async loadConfig(): Promise<ApiConfig> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      return this.config!;
    } catch (error) {
      console.error('Error loading API config:', error);
      // Return default config if file doesn't exist
      const defaultConfig: ApiConfig = {
        gemini: {
          apiKey: "",
          model: "gemini-2.0-flash-exp",
          maxTokens: 4096,
          temperature: 0.7
        },
        team: {
          description: "Each team member can add their own Gemini API key here",
          instructions: [
            "1. Get your API key from https://aistudio.google.com/app/apikey",
            "2. Replace the empty apiKey value with your key",
            "3. Keep this file private and don't commit it to version control"
          ]
        },
        fallback: {
          enabled: true,
          description: "Template responses when no API key is provided"
        }
      };
      
      // Save default config
      await this.saveConfig(defaultConfig);
      this.config = defaultConfig;
      return defaultConfig;
    }
  }

  async saveConfig(config: ApiConfig): Promise<void> {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf8');
      this.config = config;
      console.log('API configuration saved successfully');
    } catch (error) {
      console.error('Error saving API config:', error);
      throw new Error(`Failed to save API configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getGeminiApiKey(): Promise<string | null> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    // Check api.json first
    if (this.config?.gemini.apiKey) {
      return this.config.gemini.apiKey;
    }
    
    // Fall back to environment variables
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  }

  async getGeminiConfig(): Promise<{
    apiKey: string | null;
    model: string;
    maxTokens: number;
    temperature: number;
  }> {
    if (!this.config) {
      await this.loadConfig();
    }

    const apiKey = await this.getGeminiApiKey();
    
    return {
      apiKey,
      model: this.config?.gemini.model || "gemini-2.0-flash-exp",
      maxTokens: this.config?.gemini.maxTokens || 4096,
      temperature: this.config?.gemini.temperature || 0.7
    };
  }

  async updateApiKey(apiKey: string): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }

    if (this.config) {
      this.config.gemini.apiKey = apiKey;
      await this.saveConfig(this.config);
    }
  }

  async getConfigStatus(): Promise<{
    hasApiKey: boolean;
    source: 'api.json' | 'environment' | 'none';
    model: string;
    fallbackEnabled: boolean;
  }> {
    const config = await this.getGeminiConfig();
    
    let source: 'api.json' | 'environment' | 'none' = 'none';
    if (config.apiKey) {
      if (this.config?.gemini.apiKey) {
        source = 'api.json';
      } else {
        source = 'environment';
      }
    }

    return {
      hasApiKey: !!config.apiKey,
      source,
      model: config.model,
      fallbackEnabled: this.config?.fallback.enabled || false
    };
  }
}

export const apiConfigService = new ApiConfigService();