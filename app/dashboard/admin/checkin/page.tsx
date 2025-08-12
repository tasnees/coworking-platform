"use client";

import React, { useState, useEffect } from 'react';

// The following imports are not available in this environment.
// They have been replaced with standard HTML elements and Tailwind CSS.
// import { Button } from './shadcn/Button';
// import { Input } from './shadcn/Input';
// import { Label } from './shadcn/Label';
// import { Card, CardContent, CardHeader, CardTitle } from './shadcn/Card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './shadcn/Tabs';
// import { Badge } from './shadcn/Badge';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './shadcn/Dialog';
// import { toast } from './shadcn/Toast';
// import { Toaster } from './shadcn/Toaster';

// Define a type for the code history items to resolve TypeScript errors
interface HistoryItem {
  prompt: string;
  language: string;
  code: string;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [showDialog, setShowDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ visible: boolean; message: string; type: string }>({ visible: false, message: '', type: 'success' });
  // Explicitly type the history array with the HistoryItem interface
  const [codeHistory, setCodeHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple toast/message box implementation
  const showToast = (message: string, type = 'success') => {
    setToastMessage({ visible: true, message, type });
    setTimeout(() => {
      setToastMessage({ visible: false, message: '', type: 'success' });
    }, 3000);
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = generatedCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Code copied to clipboard!', 'success');
      } catch (err) {
        showToast('Failed to copy code.', 'error');
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const generateCode = async (retries = 3) => {
    if (!prompt) {
      showToast('Please enter a prompt.', 'error');
      return;
    }

    setIsLoading(true);
    setGeneratedCode('');
    let attempt = 0;
    const maxRetries = retries;

    while (attempt < maxRetries) {
      try {
        const chatHistory = [];
        chatHistory.push({
          role: 'user',
          parts: [{ text: `Generate a complete and runnable code snippet in ${language} for the following prompt: "${prompt}". Do not provide any conversational text, only the code.` }],
        });

        const payload = {
          contents: chatHistory,
        };

        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          setGeneratedCode(text);
          // Add to history with the correct type
          setCodeHistory(prevHistory => [...prevHistory, { prompt, language, code: text }]);
        } else {
          showToast('Failed to generate code. Please try again.', 'error');
        }

        setIsLoading(false);
        break; // Exit the loop on success
      } catch (error) {
        console.error('API call failed:', error);
        attempt++;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          console.log(`Retrying API call... attempt ${attempt + 1}`);
        } else {
          showToast('Failed to generate code after multiple attempts. Please check your network.', 'error');
          setIsLoading(false);
        }
      }
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedCode('');
    showToast('Cleared!', 'success');
  };

  // Custom SVG loader
  const TailSpinLoader = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 38 38" stroke="#ffffff" className="animate-spin">
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl space-y-8">
        {/* Toast Notification */}
        {toastMessage.visible && (
          <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg transition-all duration-300 ${toastMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toastMessage.message}
          </div>
        )}

        {/* Card and Tabs */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="flex justify-center p-4 border-b border-gray-700">
            <div className="flex space-x-2 bg-gray-700 p-1 rounded-full">
              <button
                onClick={() => setActiveTab('write')}
                className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'write' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-6 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'history' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                History
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'write' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-gray-300 block text-sm font-medium">Prompt</label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="e.g., 'A React component for a multi-step form with validation'"
                    className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="language" className="text-gray-300 block text-sm font-medium">Language</label>
                  <select
                    id="language"
                    value={language}
                    onChange={handleLanguageChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="java">Java</option>
                    <option value="c++">C++</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => generateCode()}
                    disabled={isLoading}
                    className="flex-1 py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <TailSpinLoader />
                        <span>Generating...</span>
                      </>
                    ) : (
                      'Generate Code'
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    className="py-3 px-6 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {generatedCode && (
                  <div className="relative mt-6 p-4 bg-gray-700 rounded-md shadow-inner group">
                    <pre className="overflow-x-auto text-sm text-gray-200 p-2">
                      <code>{generatedCode}</code>
                    </pre>
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Copy code to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {isClient && codeHistory.length > 0 ? (
                  codeHistory.map((item, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-md border border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        {/* TypeScript now recognizes item.prompt and item.language */}
                        <h4 className="text-sm font-semibold text-gray-300 truncate">{item.prompt}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-500 text-white font-medium">
                          {item.language}
                        </span>
                      </div>
                      <pre className="text-sm text-gray-200 overflow-x-auto p-2 bg-gray-800 rounded-md">
                        {/* TypeScript now recognizes item.code */}
                        <code>{item.code.substring(0, 100)}...</code>
                      </pre>
                      <button
                        onClick={() => {
                          setGeneratedCode(item.code);
                          setPrompt(item.prompt);
                          setLanguage(item.language);
                          setActiveTab('write');
                          showToast('Loaded from history!', 'success');
                        }}
                        className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                      >
                        Load to Editor
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    {isClient ? 'Your generation history is empty.' : 'Loading history...'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dialog/Modal */}
        {showDialog && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4 border border-gray-700">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-100">About this App</h3>
                <p className="text-sm text-gray-400">
                  This is a simple code generation app built with React and Tailwind CSS. It uses the Gemini API to
                  generate code snippets based on your prompts.
                </p>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-400">
          <button onClick={() => setShowDialog(true)} className="hover:text-gray-200 transition-colors">
            About
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
