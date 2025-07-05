import { useEffect, useState } from "react";

interface CodeDisplayProps {
  code: string;
  language: string;
  isGenerating: boolean;
}

export function CodeDisplay({ code, language, isGenerating }: CodeDisplayProps) {
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaderText, setLoaderText] = useState("");
  const [loaderIndex, setLoaderIndex] = useState(0);

  // Different programming language examples for the loader
  const loaderExamples = [
    'print("Craftor is the best")',
    'console.log("Craftor is the best");',
    'echo "Craftor is the best"',
    'System.out.println("Craftor is the best");',
    'puts "Craftor is the best"',
    'print("Craftor is the best")',
    'fmt.Println("Craftor is the best")',
    'std::cout << "Craftor is the best" << std::endl;',
    'Console.WriteLine("Craftor is the best");',
    'println!("Craftor is the best");',
  ];

  useEffect(() => {
    if (isGenerating && code) {
      // Reset when new generation starts
      setDisplayedCode("");
      setCurrentIndex(0);
    }
  }, [isGenerating, code]);

  // Loader animation effect
  useEffect(() => {
    if (isGenerating && !code) {
      const interval = setInterval(() => {
        setLoaderIndex((prev) => (prev + 1) % loaderExamples.length);
      }, 1500); // Change every 1.5 seconds

      return () => clearInterval(interval);
    }
  }, [isGenerating, code, loaderExamples.length]);

  useEffect(() => {
    if (isGenerating && code && currentIndex < code.length) {
      const timer = setTimeout(() => {
        // Add characters in chunks for smoother animation
        const chunkSize = Math.min(5, code.length - currentIndex);
        setDisplayedCode(prev => prev + code.slice(currentIndex, currentIndex + chunkSize));
        setCurrentIndex(prev => prev + chunkSize);
      }, 10); // Adjust speed as needed

      return () => clearTimeout(timer);
    } else if (!isGenerating && code) {
      // Show full code immediately when not generating
      setDisplayedCode(code);
      setCurrentIndex(code.length);
    }
  }, [code, currentIndex, isGenerating]);

  // Simple syntax highlighting
  const highlightCode = (codeText: string, lang: string) => {
    if (!codeText) return "";

    let highlighted = codeText;
    
    if (lang === "html") {
      // HTML tags
      highlighted = highlighted.replace(/(&lt;\/?)(\w+)([^&]*?&gt;)/g, 
        '$1<span class="token-tag">$2</span>$3');
      // Attributes
      highlighted = highlighted.replace(/(\w+)=(["'][^"']*["'])/g, 
        '<span class="token-attr">$1</span>=<span class="token-string">$2</span>');
    } else if (lang === "css") {
      // CSS selectors
      highlighted = highlighted.replace(/([.#]?[\w-]+)\s*{/g, 
        '<span class="token-function">$1</span> {');
      // CSS properties
      highlighted = highlighted.replace(/([\w-]+):/g, 
        '<span class="token-keyword">$1</span>:');
      // CSS values
      highlighted = highlighted.replace(/:\s*([^;]+);/g, 
        ': <span class="token-string">$1</span>;');
    } else if (lang === "javascript") {
      // Keywords
      const keywords = /\b(const|let|var|function|return|if|else|for|while|class|extends|new|this|import|export|default|from)\b/g;
      highlighted = highlighted.replace(keywords, '<span class="token-keyword">$1</span>');
      // Strings
      highlighted = highlighted.replace(/(["'`])([^"'`]*)(\1)/g, 
        '<span class="token-string">$1$2$3</span>');
      // Functions
      highlighted = highlighted.replace(/(\w+)\s*\(/g, 
        '<span class="token-function">$1</span>(');
    }

    return highlighted;
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const processedCode = isGenerating ? displayedCode : code;
  const escapedCode = escapeHtml(processedCode);
  const highlightedCode = highlightCode(escapedCode, language);

  return (
    <div className="relative h-full">
      {/* Show loader examples when generating but no code yet */}
      {isGenerating && !code && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            <div className="mb-6">
              <i className="fas fa-cogs text-4xl text-purple-400 animate-spin"></i>
            </div>
            <div className="bg-black/50 border border-white/10 rounded-lg p-4 max-w-md">
              <div className="text-sm text-gray-300 mb-2">Craftor is working...</div>
              <pre className="text-sm text-purple-300 font-mono">
                <code className="animate-pulse">{loaderExamples[loaderIndex]}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
      
      {/* Show code when available */}
      {(code || !isGenerating) && (
        <pre className="code-preview overflow-auto h-full p-4 text-sm">
          <code 
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="block"
          />
          {isGenerating && currentIndex < code.length && (
            <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1"></span>
          )}
        </pre>
      )}
      
      {isGenerating && code && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 text-xs text-purple-400">
          <i className="fas fa-circle-notch fa-spin"></i>
          <span>Generating...</span>
        </div>
      )}
    </div>
  );
}