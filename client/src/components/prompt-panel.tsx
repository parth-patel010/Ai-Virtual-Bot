interface QuickExample {
  title: string;
  description: string;
  prompt: string;
}

interface PromptPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  quickExamples: QuickExample[];
}

export function PromptPanel({
  prompt,
  setPrompt,
  isGenerating,
  onGenerate,
  quickExamples,
}: PromptPanelProps) {
  return (
    <div className="w-full lg:w-1/3 glass-dark border-r border-white/10 flex flex-col">
      {/* Prompt Input Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center shadow-lg">
            <i className="fas fa-sparkles text-white"></i>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              AI Code Generator
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Create stunning web projects</p>
          </div>
        </div>
        
        {/* Model Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            AI Model
          </label>
          <select 
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            defaultValue="c1-1.0"
          >
            <option value="c1-1.0">c1 1.0 - Advanced Code Generation</option>
          </select>
        </div>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your project briefly... e.g., 'Modern portfolio with dark theme' (maximum 100 characters)"
            className="w-full h-36 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
            maxLength={100}
          />
          <div className="absolute bottom-3 right-3 text-xs">
            <span className={prompt.length > 80 ? "text-orange-400" : prompt.length > 100 ? "text-red-400" : "text-gray-400"}>
              {prompt.length}/100 max
            </span>
          </div>
        </div>
        
        {/* Generation Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating || prompt.trim().length === 0 || prompt.trim().length > 100}
          className="w-full mt-4 btn-gradient text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          {isGenerating ? (
            <>
              <div className="absolute inset-0 shimmer"></div>
              <i className="fas fa-circle-notch fa-spin relative z-10"></i>
              <span className="relative z-10">Generating your code...</span>
            </>
          ) : (
            <>
              <i className="fas fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i>
              <span>Generate Code</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Examples */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center space-x-2">
          <i className="fas fa-lightbulb text-yellow-400"></i>
          <span>Popular Templates</span>
        </h3>
        <div className="space-y-3">
          {quickExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example.prompt)}
              className="w-full text-left p-4 surface-secondary rounded-xl hover:border-purple-500/30 transition-all duration-300 group animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
                  {example.title}
                </div>
                <i className="fas fa-arrow-right text-gray-600 group-hover:text-purple-400 transition-all group-hover:translate-x-1"></i>
              </div>
              <div className="text-xs text-gray-500 line-clamp-2">{example.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
