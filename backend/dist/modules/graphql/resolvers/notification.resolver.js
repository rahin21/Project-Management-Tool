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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const notification_entity_1 = require("../../notifications/notification.entity");
const notifications_service_1 = require("../../notifications/notifications.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const user_entity_1 = require("../../users/user.entity");
let NotificationResolver = class NotificationResolver {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async notifications(user) {
        return this.notificationsService.findByUserId(user.id);
    }
    async markNotificationAsRead(id) {
        return this.notificationsService.markAsRead(id);
    }
    async markAllNotificationsAsRead(user) {
        return this.notificationsService.markAllAsRead(user.id);
    }
};
exports.NotificationResolver = NotificationResolver;
__decorate([
    (0, graphql_1.Query)(() => [notification_entity_1.Notification]),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "notifications", null);
__decorate([
    (0, graphql_1.Mutation)(() => notification_entity_1.Notification, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markNotificationAsRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => [notification_entity_1.Notification]),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markAllNotificationsAsRead", null);
exports.NotificationResolver = NotificationResolver = __decorate([
    (0, graphql_1.Resolver)(() => notification_entity_1.Notification),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationResolver);
//# sourceMappingURL=notification.resolver.js.map