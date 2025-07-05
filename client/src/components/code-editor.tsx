import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";
import { CodeDisplay } from "./code-display";

interface CodeEditorProps {
  generatedCode: {
    html: string;
    css: string;
    javascript: string;
  } | null;
  activeTab: "html" | "css" | "js";
  setActiveTab: (tab: "html" | "css" | "js") => void;
  isGenerating: boolean;
}

export function CodeEditor({
  generatedCode,
  activeTab,
  setActiveTab,
  isGenerating,
}: CodeEditorProps) {
  const { toast } = useToast();
  const codeRef = useRef<HTMLElement>(null);
  const [currentLoadingText, setCurrentLoadingText] = useState(0);

  // Craftora features loading messages
  const loadingMessages = [
    'print("Craftora generates amazing code!")',
    'console.log("Craftora powers your creativity");',
    'echo "Craftora builds beautiful websites";',
    '// Craftora: AI-powered code generation',
    '<!-- Craftora makes web development easy -->',
    'SELECT * FROM crafted_websites WHERE quality = "excellent";',
    'function craftora() { return "perfect_code"; }',
    'def craftora(): return "stunning_websites"',
    '<h1>Craftora: Your coding companion</h1>',
    'const craftora = () => "innovative_solutions";',
    'puts "Craftora crafts code with precision"',
    '# Craftora: Where ideas become reality',
    'System.out.println("Craftora exceeds expectations");',
    'fmt.Println("Craftora delivers excellence")',
    'console.log("Craftora transforms your vision");'
  ];

  // Rotate loading messages
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setCurrentLoadingText((prev) => (prev + 1) % loadingMessages.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isGenerating, loadingMessages.length]);

  const getCurrentCode = () => {
    if (!generatedCode) return "";
    
    switch (activeTab) {
      case "html":
        return generatedCode.html;
      case "css":
        return generatedCode.css;
      case "js":
        return generatedCode.javascript;
      default:
        return "";
    }
  };

  const copyCode = async () => {
    const code = getCurrentCode();
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied!",
        description: "Code has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadCode = async () => {
    if (!generatedCode) return;

    try {
      const zip = new JSZip();

      // Add HTML file
      if (generatedCode.html) {
        zip.file("index.html", generatedCode.html);
      }

      // Add CSS file only if it has content
      if (generatedCode.css && generatedCode.css.trim()) {
        zip.file("styles.css", generatedCode.css);
      }

      // Add JavaScript file only if it has content
      if (generatedCode.javascript && generatedCode.javascript.trim()) {
        zip.file("script.js", generatedCode.javascript);
      }

      // Add a README file with project info
      const readme = `# Generated Website

This website was generated using Craftor AI.

## Files included:
- index.html - Main HTML structure
${generatedCode.css?.trim() ? "- styles.css - Custom CSS styles\n" : ""}${generatedCode.javascript?.trim() ? "- script.js - JavaScript functionality\n" : ""}

## How to use:
1. Extract all files to a folder
2. Open index.html in your web browser
3. Enjoy your new website!

Generated on: ${new Date().toLocaleDateString()}
`;
      zip.file("README.md", readme);

      // Generate and download the zip file
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "website-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Project downloaded!",
        description: "Your website files have been packaged and downloaded as a ZIP file.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Failed to create ZIP file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full lg:w-1/3 glass-dark border-r border-white/10 flex flex-col">
      {/* Code Tabs */}
      <div className="surface-secondary border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex">
          <button
            onClick={() => setActiveTab("html")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "html"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fab fa-html5 mr-2"></i>HTML
          </button>
          <button
            onClick={() => setActiveTab("css")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "css"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fab fa-css3-alt mr-2"></i>CSS
          </button>
          <button
            onClick={() => setActiveTab("js")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "js"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <i className="fab fa-js-square mr-2"></i>JavaScript
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyCode}
            disabled={!generatedCode}
            className="text-slate-400 hover:text-slate-200 disabled:text-slate-600 transition-colors p-2"
            title="Copy Code"
          >
            <i className="far fa-copy"></i>
          </button>
          <button
            onClick={downloadCode}
            disabled={!generatedCode}
            className="text-slate-400 hover:text-slate-200 disabled:text-slate-600 transition-colors p-2"
            title="Download"
          >
            <i className="fas fa-download"></i>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 relative bg-black/50">
        {/* Loading State */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <div className="text-center animate-fadeIn">
              <div className="relative mb-8">
                {/* Circular Loading Spinner */}
                <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                
                {/* Pulsing Code Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-code text-blue-400 text-xl animate-pulse"></i>
                </div>
              </div>
              
              {/* Rotating Code Messages */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <div className="font-mono text-sm text-green-400 mb-2 animate-fadeIn">
                  {loadingMessages[currentLoadingText]}
                </div>
                <div className="text-xs text-gray-400">
                  Craftora is generating your code...
                </div>
              </div>
              
              {/* Progress Dots */}
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedCode && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center animate-fadeIn">
              <i className="fas fa-code text-4xl mb-4 text-gray-600"></i>
              <p>Enter a prompt to generate code</p>
              <p className="text-xs mt-2 text-gray-600">Your code will appear here</p>
            </div>
          </div>
        )}

        {/* Code Display */}
        {generatedCode && (
          <div className="absolute inset-0 overflow-auto">
            <CodeDisplay 
              code={getCurrentCode()} 
              language={activeTab === "js" ? "javascript" : activeTab}
              isGenerating={isGenerating}
            />
          </div>
        )}
      </div>
    </div>
  );
}
