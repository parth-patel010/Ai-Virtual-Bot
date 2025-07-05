import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateCodeResponse, ChatMessage } from "@shared/schema";
import { apiConfigService } from "./api-config";

export async function generateCode(prompt: string, chatHistory: ChatMessage[] = []): Promise<GenerateCodeResponse> {
  const config = await apiConfigService.getGeminiConfig();
  
  if (!config.apiKey) {
    console.error("No Gemini API key found in api.json or environment variables");
    return generateFallbackCode(prompt);
  }

  const genAI = new GoogleGenerativeAI(config.apiKey);
  try {
    const systemPrompt = `You are an expert web developer who creates beautiful, functional, and modern websites. 
Your task is to generate complete HTML, CSS, and JavaScript code based on user prompts.

IMPORTANT RULES:
1. Generate production-ready, clean, and well-structured code
2. Use modern web standards and best practices
3. Make the design responsive and mobile-friendly
4. Include Tailwind CSS via CDN for styling (always include: <script src="https://cdn.tailwindcss.com"></script>)
5. Use semantic HTML elements
6. Add proper accessibility attributes
7. Include smooth animations and transitions where appropriate
8. Make sure the JavaScript is functional and error-free
9. Use modern JavaScript (ES6+) features
10. Ensure cross-browser compatibility

RESPONSE FORMAT:
Return a JSON object with exactly these three fields:
- "html": Complete HTML document with proper DOCTYPE, head, and body
- "css": Additional custom CSS styles (if needed beyond Tailwind)
- "javascript": Functional JavaScript code for interactivity

The HTML should be a complete, standalone document that works immediately when opened in a browser.
Include proper meta tags, viewport settings, and Tailwind CSS CDN.
`;

    const model = genAI.getGenerativeModel({ 
      model: config.model,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: config.maxTokens,
        temperature: config.temperature,
      }
    });

    // Build conversation context from chat history
    let conversationContext = "";
    if (chatHistory.length > 0) {
      conversationContext = "Previous conversation:\n";
      chatHistory.forEach(msg => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      conversationContext += "\n---\n\n";
    }

    const fullPrompt = conversationContext + `Create a website based on this description: ${prompt}

Make it visually appealing, modern, and fully functional. Include interactive elements where appropriate.
Ensure the design is responsive and works well on all devices.
${chatHistory.length > 0 ? 'Consider the previous conversation context and build upon or modify the existing code as needed.' : ''}`;

    const result = await model.generateContent(fullPrompt);

    const rawJson = result.response.text();

    if (!rawJson) {
      throw new Error("Empty response from Gemini API");
    }

    try {
      const data = JSON.parse(rawJson);
      
      // Validate the response structure
      if (!data.html || typeof data.html !== 'string') {
        throw new Error("Invalid HTML in response");
      }
      
      // Ensure CSS and JavaScript are strings (can be empty)
      const result: GenerateCodeResponse = {
        html: data.html,
        css: data.css || "",
        javascript: data.javascript || "",
      };

      // Basic validation to ensure HTML includes Tailwind CDN
      if (!result.html.includes('tailwindcss') && !result.html.includes('tailwind')) {
        // Add Tailwind CDN if missing
        result.html = result.html.replace(
          '</head>',
          '    <script src="https://cdn.tailwindcss.com"></script>\n</head>'
        );
      }

      return result;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response:", rawJson);
      throw new Error("Failed to parse AI response as valid JSON");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing Gemini API key. Please check your environment variables.");
      }
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
      if (error.message.includes("safety")) {
        throw new Error("Content filtered by safety settings. Please try a different prompt.");
      }
      throw error;
    }
    
    throw new Error("Failed to generate code. Please try again.");
  }
}

// Fallback function for when API fails - generates a basic template
export function generateFallbackCode(prompt: string): GenerateCodeResponse {
  const title = prompt.split(' ').slice(0, 5).join(' ');
  
  return {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome</h1>
            <p class="text-lg text-gray-600 mb-8">Your request: "${prompt}"</p>
            <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p>AI code generation is temporarily unavailable. This is a basic template.</p>
            </div>
        </div>
    </div>
</body>
</html>`,
    css: `/* Custom styles can be added here */
.container {
    max-width: 1200px;
}

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
}`,
    javascript: `// Basic JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully');
    
    // Add any interactive features here
    const title = document.querySelector('h1');
    if (title) {
        title.addEventListener('click', function() {
            alert('Hello from Craftor AI!');
        });
    }
});`
  };
}
