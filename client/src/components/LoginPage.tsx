import React, { useState } from 'react';
import { Users, Code, ArrowRight, Zap } from 'lucide-react';

interface LoginPageProps {
  onJoin: (roomId: string, userName: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !userName.trim()) return;

    setIsJoining(true);
    try {
      onJoin(roomId.trim(), userName.trim());
      // Remove the artificial delay that was preventing navigation
    } finally {
      setIsJoining(false);
    }
  };

  const generateRoomId = () => {
    const id = Math.random().toString(36).substr(2, 8).toUpperCase();
    setRoomId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CodeSync</h1>
          <p className="text-gray-400">Real-time collaborative code editor</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-300">Multi-user</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-300">Real-time</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Code className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-300">5 Languages</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 mb-2">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room ID"
                  required
                />
                <button
                  type="button"
                  onClick={generateRoomId}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isJoining || !roomId.trim() || !userName.trim()}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Room
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Share the room ID with your team to start collaborating
        </p>
      </div>
    </div>
  );
};