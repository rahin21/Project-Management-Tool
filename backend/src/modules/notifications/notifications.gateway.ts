import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['polling'], // Use only polling to match frontend
  upgrade: false, // Disable transport upgrades
  pingTimeout: 60000, // Reduce ping timeout
  pingInterval: 25000, // Reduce ping interval
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6,
  allowRequest: (req, callback) => {
    // Add logging for connection attempts
    console.log('Connection attempt from:', req.headers.origin);
    callback(null, true);
  },
})
export class NotificationsGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  onModuleInit() {
    console.log('NotificationsGateway initialized - running on same port as main app');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id} from ${client.handshake.address}`);
    
    // Send a welcome message to confirm connection
    client.emit('connected', { message: 'Successfully connected to notifications' });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id} - reason: ${client.disconnected}`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }
}


