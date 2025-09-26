import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, Download, Copy, CheckCircle } from 'lucide-react';
import type { User, Language, CompilerResult } from '../types';
import { LANGUAGES, getLanguageById } from '../utils/languages';
import { CompilerService } from '../services/compiler';
import { WebSocketService } from '../services/websocket';

interface CodeEditorProps {
  roomId: string;
  currentUser: User;
  users: User[];
  onLeave: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ roomId, currentUser, users: initialUsers, onLeave }) => {
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [output, setOutput] = useState<CompilerResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wsService = WebSocketService.getInstance();
  const compilerService = CompilerService.getInstance();
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Listen for remote updates
  useEffect(() => {
    const handleCodeChange = (data: any) => {
      if (data.userId !== currentUser.id) setCode(data.code);
    };

    const handleRoomUpdate = (data: any) => {
      setUsers(data.users || []);
      if (data.language) {
        const newLang = getLanguageById(data.language);
        if (newLang) setLanguage(newLang);
      }
      if (data.code) setCode(data.code);
    };

    const handleLanguageChange = (data: any) => {
      const newLang = getLanguageById(data.language);
      if (newLang) {
        setLanguage(newLang);
        setCode(newLang.defaultCode);
      }
    };

    wsService.on('code-changed', handleCodeChange);
    wsService.on('room-update', handleRoomUpdate);
    wsService.on('language-changed', handleLanguageChange);

    return () => {
      wsService.off('code-changed', handleCodeChange);
      wsService.off('room-update', handleRoomUpdate);
      wsService.off('language-changed', handleLanguageChange);
    };
  }, [currentUser.id]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    wsService.sendCodeChange({ content: newCode, userId: currentUser.id });
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(newLanguage.defaultCode);
    wsService.sendLanguageChange(newLanguage.id);
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput(null);

    try {
      const result = await compilerService.executeCode(code, language.judge0Id);
      setOutput(result);
    } catch (error) {
      setOutput({ output: '', error: 'Execution failed', executionTime: 0 });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold">CodeSync</h1>
          <button onClick={copyRoomId} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded">
            {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {roomId}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language.id}
            onChange={(e) => {
              const newLang = getLanguageById(e.target.value);
              if (newLang) handleLanguageChange(newLang);
            }}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>

          <div className="relative">
            <button onClick={() => setShowUsers(!showUsers)} className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded">
              <Users className="w-4 h-4" /> {users.length}
            </button>
            {showUsers && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 min-w-48 z-10">
                <h3 className="text-white font-medium mb-2">Users ({users.length})</h3>
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 py-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.color }} />
                    <span className="text-gray-300 text-sm">{user.name}</span>
                    {user.id === currentUser.id && <span className="text-xs text-gray-500">(You)</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={downloadCode} className="p-2 bg-gray-700 text-white rounded">
            <Download className="w-4 h-4" />
          </button>

          <button onClick={onLeave} className="px-3 py-2 bg-red-600 text-white rounded">
            Leave
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-r border-gray-700">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-white font-medium">Editor</h2>
            <button onClick={executeCode} disabled={isExecuting} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded">
              {isExecuting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />} Run
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Output */}
        <div className="w-full lg:w-96 flex flex-col bg-gray-850">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <h2 className="text-white font-medium">Output</h2>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {output ? (
              <div className="space-y-4">
                {output.output && <pre className="text-gray-300 bg-gray-800 p-3 rounded">{output.output}</pre>}
                {output.error && <pre className="text-red-300 bg-gray-800 p-3 rounded">{output.error}</pre>}
                <div className="text-gray-400 text-xs">Execution time: {(Number(output.executionTime) || 0).toFixed(3)}s</div>
              </div>
            ) : (
              <div className="text-gray-500">No output yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};