"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'project_management',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
        expiresIn: process.env.JWT_EXPIRATION || '1d',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    },
    elasticsearch: {
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    },
});
//# sourceMappingURL=configuration.js.map