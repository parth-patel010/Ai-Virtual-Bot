import { useEffect, useState, useRef } from "react";

interface LivePreviewProps {
  generatedCode: {
    html: string;
    css: string;
    javascript: string;
  } | null;
}

export function LivePreview({ generatedCode }: LivePreviewProps) {
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const createPreviewContent = () => {
    if (!generatedCode) return "";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${generatedCode.css}
    </style>
</head>
<body>
    ${generatedCode.html}
    <script>
        ${generatedCode.javascript}
    </script>
</body>
</html>
    `;
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsPreviewLoading(true);
      iframeRef.current.srcdoc = createPreviewContent();
      setTimeout(() => setIsPreviewLoading(false), 500);
    }
  };

  const openInNewTab = () => {
    const content = createPreviewContent();
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  useEffect(() => {
    if (generatedCode && iframeRef.current) {
      setIsPreviewLoading(true);
      iframeRef.current.srcdoc = createPreviewContent();
      setTimeout(() => setIsPreviewLoading(false), 500);
    }
  }, [generatedCode]);

  const getDeviceClass = () => {
    switch (previewDevice) {
      case "tablet":
        return "max-w-2xl";
      case "mobile":
        return "max-w-sm";
      default:
        return "w-full";
    }
  };

  return (
    <div className="w-full lg:w-1/3 bg-gray-100 flex flex-col">
      {/* Preview Header */}
      <div className="glass-dark border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-white flex items-center space-x-2">
            <i className="fas fa-globe text-purple-400"></i>
            <span>Live Preview</span>
          </h3>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 bg-red-400 rounded-full hover:bg-red-500 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors cursor-pointer"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-500 transition-colors cursor-pointer"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={previewDevice}
            onChange={(e) => setPreviewDevice(e.target.value)}
            className="bg-black/30 text-gray-200 text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:border-purple-500/50 transition-colors"
          >
            <option value="desktop">🖥️ Desktop</option>
            <option value="tablet">📱 Tablet</option>
            <option value="mobile">📱 Mobile</option>
          </select>
          <button
            onClick={refreshPreview}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            title="Refresh Preview"
          >
            <i className="fas fa-sync-alt text-sm"></i>
          </button>
          <button
            onClick={openInNewTab}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            title="Open in New Tab"
          >
            <i className="fas fa-external-link-alt text-sm"></i>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-start justify-center p-6">
        <div className={`${getDeviceClass()} h-full relative transition-all duration-300`}>
          {generatedCode ? (
            <div className="relative w-full h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
              <iframe
                ref={iframeRef}
                className="relative w-full h-full border-0 bg-white rounded-xl shadow-2xl"
                title="Code Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="w-full h-full glass-dark rounded-xl flex items-center justify-center text-gray-400 animate-fadeIn">
              <div className="text-center">
                <i className="fas fa-eye text-5xl mb-4 text-gray-600"></i>
                <p className="text-lg">Preview will appear here</p>
                <p className="text-xs mt-2 text-gray-600">Generate code to see live preview</p>
              </div>
            </div>
          )}

          {/* Loading Overlay for Preview */}
          {isPreviewLoading && (
            <div className="absolute inset-0 glass-dark rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-purple-300 text-sm">Updating preview...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
