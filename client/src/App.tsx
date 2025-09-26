import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { CodeEditor } from './components/CodeEditor';
import type { User } from './types';
import { WebSocketService } from './services/websocket';
import { getRandomColor } from './utils/colors';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsService = WebSocketService.getInstance();

  // 🔹 Restore user + room from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRoomId = localStorage.getItem('roomId');

    wsService.connect(); // Always connect first

    if (savedUser && savedRoomId) {
      const user: User = JSON.parse(savedUser);
      setCurrentUser(user);
      setRoomId(savedRoomId);
      wsService.joinRoom(savedRoomId, user);
      setIsConnected(true);
    }
  }, []);

  // 🔹 Setup WebSocket listeners
  useEffect(() => {
    const handleRoomJoined = (data: any) => {
      setUsers(data.room.users || []);
    };

    const handleRoomUpdate = (data: any) => {
      setUsers(data.users || []);
    };

    wsService.on('room-joined', handleRoomJoined);
    wsService.on('room-update', handleRoomUpdate);

    return () => {
      wsService.off('room-joined', handleRoomJoined);
      wsService.off('room-update', handleRoomUpdate);
    };
  }, [wsService]);

  // 🔹 Join room handler
  const handleJoinRoom = (roomIdInput: string, userName: string) => {
    const user: User = {
      id: uuidv4(),
      name: userName,
      color: getRandomColor(),
    };

    setCurrentUser(user);
    setRoomId(roomIdInput);
    setIsConnected(true);

    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('roomId', roomIdInput);

    wsService.joinRoom(roomIdInput, user);
  };

  // 🔹 Leave room handler
  const handleLeaveRoom = () => {
    if (roomId && currentUser) {
      wsService.leaveRoom(roomId);
    }

    setCurrentUser(null);
    setRoomId('');
    setUsers([]);
    setIsConnected(false);

    localStorage.removeItem('currentUser');
    localStorage.removeItem('roomId');
  };

  if (!currentUser || !isConnected) {
    return <LoginPage onJoin={handleJoinRoom} />;
  }

  return (
    <CodeEditor
      roomId={roomId}
      currentUser={currentUser}
      users={users}
      onLeave={handleLeaveRoom}
    />
  );
}

export default App;