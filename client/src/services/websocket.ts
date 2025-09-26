import { io, Socket } from 'socket.io-client';
import type { User } from '../types';

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private currentUser: User | null = null;
  private roomId: string | null = null;
  private codeChangeTimeout: any = null;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(serverUrl: string = 'http://localhost:3001', roomId?: string, user?: User): void {
    if (this.socket) return;

    this.socket = io(serverUrl, { transports: ['websocket', 'polling'], timeout: 20000, reconnection: true });

    if (roomId && user) {
      this.roomId = roomId;
      this.currentUser = user;
    }

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (this.roomId && this.currentUser) {
        this.joinRoom(this.roomId, this.currentUser);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    ['room-joined', 'room-update', 'code-changed', 'language-changed', 'cursor-moved', 'error']
      .forEach(event => {
        this.socket?.on(event, (data) => this.emit(event, data));
      });
  }

  public joinRoom(roomId: string, user: User): void {
    this.currentUser = user;
    this.roomId = roomId;

    if (this.socket) {
      this.socket.emit('join-room', { roomId, user });
    }
  }

  public leaveRoom(_roomId: string): void {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
    }
    this.currentUser = null;
    this.roomId = null;
  }

  public sendCodeChange(change: { content: string; userId: string }): void {
    if (!this.socket || !this.roomId || !this.currentUser) return;

    if (this.codeChangeTimeout) clearTimeout(this.codeChangeTimeout);

    this.codeChangeTimeout = setTimeout(() => {
      if (this.socket && this.roomId) {
        this.socket.emit('code-change', { roomId: this.roomId, change });
      }
      this.codeChangeTimeout = null;
    }, 200);
  }

  public sendLanguageChange(language: string): void {
    if (this.socket && this.roomId) {
      this.socket.emit('language-change', { roomId: this.roomId, language });
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    const arr = this.listeners.get(event);
    if (arr) {
      const idx = arr.indexOf(callback);
      if (idx > -1) arr.splice(idx, 1);
    }
  }

  private emit(event: string, data: any): void {
    const arr = this.listeners.get(event);
    if (arr) arr.forEach(cb => cb(data));
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.currentUser = null;
    this.roomId = null;
  }
}