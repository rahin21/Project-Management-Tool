"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let NotificationsGateway = class NotificationsGateway {
    onModuleInit() {
        console.log('NotificationsGateway initialized - running on same port as main app');
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id} from ${client.handshake.address}`);
        client.emit('connected', { message: 'Successfully connected to notifications' });
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id} - reason: ${client.disconnected}`);
    }
    emitToUser(userId, event, data) {
        this.server.to(userId).emit(event, data);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'],
            credentials: true,
        },
        allowEIO3: true,
        transports: ['polling'],
        upgrade: false,
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 30000,
        maxHttpBufferSize: 1e6,
        allowRequest: (req, callback) => {
            console.log('Connection attempt from:', req.headers.origin);
            callback(null, true);
        },
    })
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map