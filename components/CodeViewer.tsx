import React, { useState } from 'react';

interface CodeViewerProps {
  code: string;
  libraries: string[];
  explanation: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, libraries, explanation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Libraries Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-primary-400 text-sm font-bold uppercase tracking-wide mb-3">Prerequisites</h3>
        <div className="flex flex-wrap gap-2">
            <span className="text-gray-400 text-sm font-mono mr-2 select-none">$</span>
            <span className="font-mono text-green-400 text-sm">pip install {libraries.join(' ')}</span>
        </div>
      </div>

      {/* Main Code Block */}
      <div className="relative group rounded-xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-800">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-xs text-gray-500 font-mono">scraper.py</span>
          <button 
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors text-white"
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div className="p-4 overflow-x-auto max-h-[600px]">
          <pre className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
        <h3 className="text-primary-400 text-lg font-bold mb-2">How it works</h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{explanation}</p>
      </div>
    </div>
  );
};

export default CodeViewer;
