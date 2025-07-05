import { useState } from "react";
import { PromptPanel } from "@/components/prompt-panel";
import { ChatPanel } from "@/components/chat-panel";
import { CodeEditor } from "@/components/code-editor";
import { LivePreview } from "@/components/live-preview";
import { HistorySidebar } from "@/components/history-sidebar";
import { DatasetPanel } from "@/components/dataset-panel";
import { ApiConfigPanel } from "@/components/api-config-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import type { GeneratedCode } from "@shared/schema";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{
    html: string;
    css: string;
    javascript: string;
    id?: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [mobileView, setMobileView] = useState<"prompt" | "code" | "preview" | "history" | "dataset" | "config">("prompt");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDatasetOpen, setIsDatasetOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isInChatMode, setIsInChatMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Template code generators for popular examples
  const getTemplateCode = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("portfolio") || lowerPrompt.includes("developer portfolio")) {
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Developer Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <nav class="fixed w-full bg-gray-900/90 backdrop-blur-sm z-50 border-b border-gray-800">
        <div class="max-w-6xl mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <h1 class="text-xl font-bold text-blue-400">John Doe</h1>
                <div class="hidden md:flex space-x-8">
                    <a href="#about" class="hover:text-blue-400 transition-colors">About</a>
                    <a href="#skills" class="hover:text-blue-400 transition-colors">Skills</a>
                    <a href="#projects" class="hover:text-blue-400 transition-colors">Projects</a>
                </div>
            </div>
        </div>
    </nav>
    <section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div class="text-center">
            <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">Hi, I'm John</h1>
            <p class="text-xl md:text-2xl text-gray-300 mb-8">Full Stack Developer & UI/UX Designer</p>
            <button onclick="scrollToSection('projects')" class="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                View My Work
            </button>
        </div>
    </section>
</body>
</html>`,
        css: `@keyframes fade-in {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
    animation: fade-in 1s ease-out;
}

html {
    scroll-behavior: smooth;
}`,
        javascript: `function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}`
      };
    }
    
    if (lowerPrompt.includes("dashboard") || lowerPrompt.includes("admin")) {
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <div class="w-64 bg-gray-900 text-white">
            <div class="p-6">
                <h1 class="text-xl font-bold">Dashboard</h1>
            </div>
            <nav class="mt-6">
                <a href="#" class="flex items-center px-6 py-3 bg-blue-600 text-white">
                    <span class="mr-3">📊</span>
                    Overview
                </a>
                <a href="#" class="flex items-center px-6 py-3 hover:bg-gray-800 transition-colors">
                    <span class="mr-3">👥</span>
                    Users
                </a>
            </nav>
        </div>
        <div class="flex-1 overflow-auto">
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="px-6 py-4 flex justify-between items-center">
                    <h2 class="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        New Report
                    </button>
                </div>
            </header>
            <main class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600">Total Users</p>
                                <p class="text-2xl font-bold text-gray-900">12,345</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span class="text-blue-600 text-xl">👥</span>
                            </div>
                        </div>
                        <p class="text-sm text-green-600 mt-2">+12% from last month</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</body>
</html>`,
        css: `::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}`,
        javascript: `document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('bg-blue-600'));
            this.classList.add('bg-blue-600');
        });
    });
});`
      };
    }
    
    if (lowerPrompt.includes("landing") || lowerPrompt.includes("product landing")) {
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProductName - Revolutionary Solution</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
    <nav class="fixed w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-blue-600 rounded-lg"></div>
                    <span class="text-xl font-bold text-gray-900">ProductName</span>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#features" class="text-gray-600 hover:text-gray-900">Features</a>
                    <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    </nav>
    <section class="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 class="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        The Future of 
                        <span class="text-blue-600">Productivity</span>
                    </h1>
                    <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                        Transform your workflow with our revolutionary platform. 
                        Increase efficiency by 300% and collaborate seamlessly with your team.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button onclick="startTrial()" class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105">
                            Start Free Trial
                        </button>
                    </div>
                </div>
                <div class="relative">
                    <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl h-96 flex items-center justify-center text-white text-2xl font-semibold shadow-2xl">
                        Product Demo
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`,
        css: `html {
    scroll-behavior: smooth;
}`,
        javascript: `function startTrial() {
    alert('🎉 Welcome to your free trial! Check your email for setup instructions.');
}`
      };
    }
    
    if (lowerPrompt.includes("e-commerce") || lowerPrompt.includes("shop") || lowerPrompt.includes("store")) {
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechStore - Product Details</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold text-gray-900">TechStore</h1>
                <div class="flex items-center space-x-4">
                    <button class="relative">
                        <span class="text-2xl">🛒</span>
                        <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" id="cart-count">0</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
    <main class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid lg:grid-cols-2 gap-12">
            <div>
                <div class="bg-white rounded-lg p-8 mb-4">
                    <div class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span class="text-gray-500">Product Image</span>
                    </div>
                </div>
            </div>
            <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Premium Wireless Headphones</h1>
                <div class="text-3xl font-bold text-gray-900 mb-6">$299.99</div>
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Quantity</h3>
                    <div class="flex items-center space-x-3">
                        <button onclick="changeQuantity(-1)" class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">-</button>
                        <span id="quantity" class="text-xl font-semibold">1</span>
                        <button onclick="changeQuantity(1)" class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">+</button>
                    </div>
                </div>
                <button onclick="addToCart()" class="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
                    Add to Cart
                </button>
            </div>
        </div>
    </main>
</body>
</html>`,
        css: `/* E-commerce specific styles */
.product-image:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
}`,
        javascript: `let quantity = 1;
let cartCount = 0;

function changeQuantity(change) {
    quantity = Math.max(1, quantity + change);
    document.getElementById('quantity').textContent = quantity;
}

function addToCart() {
    cartCount += quantity;
    document.getElementById('cart-count').textContent = cartCount;
    alert(\`Added \${quantity} item(s) to cart!\`);
    quantity = 1;
    document.getElementById('quantity').textContent = quantity;
}`
      };
    }
    
    // Return demo code for any other prompt
    return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo from Craftora</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
    <div class="text-center text-white">
        <h1 class="text-6xl font-bold mb-4 animate-pulse">Hello Craftora!</h1>
        <p class="text-xl mb-8">This is a demo generated by Craftora AI</p>
        <button class="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105" onclick="celebrate()">
            Click me!
        </button>
    </div>
</body>
</html>`,
        css: `/* Custom Craftora styles */
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: .5;
    }
}`,
        javascript: `function celebrate() {
    alert("🎉 Craftora AI is amazing! 🎉");
    
    // Add some sparkle effects
    for(let i = 0; i < 20; i++) {
        createSparkle();
    }
}

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.fontSize = '20px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.animation = 'sparkleFloat 3s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 3000);
}

// CSS for sparkle animation
const style = document.createElement('style');
style.textContent = \`
@keyframes sparkleFloat {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
}
\`;
document.head.appendChild(style);`
    };
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length > 100) return;
    
    // Switch to chat mode
    setIsInChatMode(true);
    await handleSendChatMessage(prompt);
  };

  const handleSendChatMessage = async (message: string) => {
    setIsGenerating(true);
    
    try {
      // Check if this is a template-based prompt first
      const lowerMessage = message.toLowerCase();
      const isTemplate = lowerMessage.includes("portfolio") || 
                        lowerMessage.includes("dashboard") || 
                        lowerMessage.includes("landing") || 
                        lowerMessage.includes("e-commerce") ||
                        lowerMessage.includes("shop");
      
      if (isTemplate) {
        // Use template code for quick examples
        const templateCode = getTemplateCode(message);
        
        // Show the animated loader for 3 seconds, then display the template
        setTimeout(() => {
          setGeneratedCode(templateCode);
          setIsGenerating(false);
          if (isMobile) {
            setMobileView("code");
          }
        }, 3000);
        return;
      }
      
      // For non-template prompts, call the Gemini API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: message,
          sessionId: currentSessionId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate code');
      }
      
      const data = await response.json();
      
      // Update session ID if it's a new session
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }
      
      setGeneratedCode({
        html: data.html,
        css: data.css,
        javascript: data.javascript,
        id: data.id,
      });
      
      // Invalidate queries to update the history and chat messages
      queryClient.invalidateQueries({ queryKey: ['/api/recent-codes'] });
      queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions/${data.sessionId}/messages`] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
      
      if (isMobile) {
        setMobileView("code");
      }
    } catch (error) {
      console.error('Error generating code:', error);
      setGeneratedCode({
        html: `<div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #ef4444;">Generation Error</h2>
          <p>Sorry, there was an error generating your code. Please try again.</p>
          <p style="color: #6b7280; font-size: 14px;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>`,
        css: '',
        javascript: '',
      });
      
      if (isMobile) {
        setMobileView("code");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackFromChat = () => {
    setIsInChatMode(false);
    setCurrentSessionId(null);
    setPrompt("");
  };

  const handleSelectHistory = (historyCode: GeneratedCode) => {
    setPrompt(historyCode.prompt);
    setGeneratedCode({
      html: historyCode.htmlCode,
      css: historyCode.cssCode,
      javascript: historyCode.jsCode,
      id: historyCode.id,
    });
    setIsHistoryOpen(false);
    
    if (isMobile) {
      setMobileView("code");
    }
  };

  const quickExamples = [
    {
      title: "Portfolio Website",
      description: "Modern developer portfolio with projects showcase",
      prompt: "Modern developer portfolio with dark theme and blue accents",
    },
    {
      title: "Dashboard UI",
      description: "Clean admin dashboard with charts and tables",
      prompt: "Admin dashboard with sidebar, stats cards, and data tables",
    },
    {
      title: "Landing Page",
      description: "Product landing page with hero and features",
      prompt: "Product landing page with hero, features, and pricing",
    },
    {
      title: "E-commerce Shop",
      description: "Product catalog with shopping cart",
      prompt: "E-commerce product page with gallery and cart button",
    },
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-code-bg text-slate-50">
        {/* Header */}
        <header className="glass-dark border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 btn-gradient rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-code text-white text-xs"></i>
            </div>
            <h1 className="text-lg font-bold text-white">
              Craftora <span className="text-gradient">AI</span>
            </h1>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              <i className="fas fa-circle text-[4px] mr-1"></i>Live
            </span>
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
            title="History"
          >
            <i className="fas fa-history"></i>
          </button>
        </header>

        {/* Mobile Content */}
        <div className="flex-1 h-[calc(100vh-128px)]">
          {mobileView === "prompt" && (
            isInChatMode ? (
              <ChatPanel
                sessionId={currentSessionId}
                isGenerating={isGenerating}
                onSendMessage={handleSendChatMessage}
                onBack={handleBackFromChat}
                currentCode={generatedCode}
              />
            ) : (
              <PromptPanel
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                quickExamples={quickExamples}
              />
            )
          )}
          {mobileView === "code" && (
            <CodeEditor
              generatedCode={generatedCode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isGenerating={isGenerating}
            />
          )}
          {mobileView === "preview" && (
            <LivePreview generatedCode={generatedCode} />
          )}
          {mobileView === "history" && (
            <HistorySidebar
              isOpen={true}
              onClose={() => setMobileView("prompt")}
              onSelectHistory={handleSelectHistory}
              currentCodeId={generatedCode?.id}
            />
          )}
          {mobileView === "dataset" && (
            <div className="h-full overflow-y-auto bg-code-bg">
              <DatasetPanel />
            </div>
          )}
          {mobileView === "config" && (
            <div className="h-full overflow-y-auto bg-code-bg">
              <ApiConfigPanel />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-code-surface border-t border-code-border">
          <div className="flex">
            <button
              onClick={() => setMobileView("prompt")}
              className={`flex-1 px-3 py-3 text-center transition-colors ${
                mobileView === "prompt"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <i className="fas fa-edit text-sm"></i>
                <span className="text-xs">Prompt</span>
              </div>
            </button>
            <button
              onClick={() => setMobileView("code")}
              className={`flex-1 px-3 py-3 text-center transition-colors ${
                mobileView === "code"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <i className="fas fa-code text-sm"></i>
                <span className="text-xs">Code</span>
              </div>
            </button>
            <button
              onClick={() => setMobileView("preview")}
              className={`flex-1 px-3 py-3 text-center transition-colors ${
                mobileView === "preview"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <i className="fas fa-globe text-sm"></i>
                <span className="text-xs">Preview</span>
              </div>
            </button>
            <button
              onClick={() => setMobileView("history")}
              className={`flex-1 px-3 py-3 text-center transition-colors ${
                mobileView === "history"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <i className="fas fa-history text-sm"></i>
                <span className="text-xs">History</span>
              </div>
            </button>
            <button
              onClick={() => setMobileView("dataset")}
              className={`flex-1 px-2 py-3 text-center transition-colors ${
                mobileView === "dataset"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <i className="fas fa-database text-sm"></i>
                <span className="text-xs">Dataset</span>
              </div>
            </button>
            <button
              onClick={() => setMobileView("config")}
              className={`flex-1 px-2 py-3 text-center transition-colors ${
                mobileView === "config"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <i className="fas fa-cog text-sm"></i>
                <span className="text-xs">Config</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-code-bg text-slate-50">
      {/* Header */}
      <header className="glass-dark border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 btn-gradient rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-code text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Craftora <span className="text-gradient">AI</span>
            </h1>
            <p className="text-xs text-gray-400">Advanced Code Generation Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
            title="View History"
          >
            <i className="fas fa-history"></i>
          </button>
          <button
            onClick={() => setIsDatasetOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
            title="Training Dataset"
          >
            <i className="fas fa-database"></i>
          </button>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2"
            title="API Configuration"
          >
            <i className="fas fa-cog"></i>
          </button>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/30">
            <i className="fas fa-circle text-[4px] mr-2"></i>Live
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {isInChatMode ? (
          <ChatPanel
            sessionId={currentSessionId}
            isGenerating={isGenerating}
            onSendMessage={handleSendChatMessage}
            onBack={handleBackFromChat}
            currentCode={generatedCode}
          />
        ) : (
          <PromptPanel
            prompt={prompt}
            setPrompt={setPrompt}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            quickExamples={quickExamples}
          />
        )}
        <CodeEditor
          generatedCode={generatedCode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isGenerating={isGenerating}
        />
        <LivePreview generatedCode={generatedCode} />
        
        {/* History Sidebar */}
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectHistory={handleSelectHistory}
          currentCodeId={generatedCode?.id}
        />
        
        {/* Dataset Sidebar */}
        {isDatasetOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex">
            <div className="ml-auto w-96 bg-code-bg h-full border-l border-white/10 overflow-y-auto">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Training Dataset</h2>
                <button
                  onClick={() => setIsDatasetOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <DatasetPanel />
            </div>
          </div>
        )}

        {/* API Config Sidebar */}
        {isConfigOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex">
            <div className="ml-auto w-96 bg-code-bg h-full border-l border-white/10 overflow-y-auto">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">API Configuration</h2>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <ApiConfigPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}