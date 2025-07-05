import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { GeneratedCode } from "@shared/schema";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (code: GeneratedCode) => void;
  currentCodeId?: number;
}

export function HistorySidebar({ isOpen, onClose, onSelectHistory, currentCodeId }: HistorySidebarProps) {
  const { data: recentCodes, isLoading } = useQuery<GeneratedCode[]>({
    queryKey: ["/api/recent-codes"],
    enabled: isOpen,
  });

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncatePrompt = (prompt: string, maxLength = 60) => {
    return prompt.length > maxLength ? prompt.slice(0, maxLength) + "..." : prompt;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 glass-dark border-l border-white/10 z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"} lg:relative lg:translate-x-0 lg:w-72`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <i className="fas fa-clock-rotate-left text-purple-400"></i>
            </div>
            <h2 className="text-lg font-semibold text-white">History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg lg:hidden"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-slate-400 text-sm">Loading history...</p>
            </div>
          ) : !recentCodes || recentCodes.length === 0 ? (
            <div className="p-4 text-center">
              <i className="fas fa-history text-3xl text-slate-600 mb-3"></i>
              <p className="text-slate-400 text-sm">No history yet</p>
              <p className="text-slate-500 text-xs mt-1">Generate some code to see it here</p>
            </div>
          ) : (
            <div className="p-2">
              {recentCodes.map((code: GeneratedCode) => (
                <button
                  key={code.id}
                  onClick={() => onSelectHistory(code)}
                  className={`w-full text-left p-4 mb-3 rounded-xl transition-all duration-300 group ${
                    currentCodeId === code.id
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "surface-secondary hover:border-purple-500/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border border-green-500/20">
                        <i className="fas fa-sparkles text-[10px] mr-1"></i>
                        Gemini
                      </span>
                      <span className="text-xs text-gray-500">#{code.id}</span>
                    </div>
                  </div>
                  
                  <p className={`text-sm font-medium mb-2 leading-tight ${
                    currentCodeId === code.id ? "text-white" : "text-gray-200 group-hover:text-white"
                  }`}>
                    {truncatePrompt(code.prompt)}
                  </p>
                  
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <i className="far fa-clock text-[10px]"></i>
                    <span>{formatDate(code.createdAt)}</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}