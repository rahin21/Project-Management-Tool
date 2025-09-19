"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchModule = exports.ELASTIC_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@elastic/elasticsearch");
exports.ELASTIC_CLIENT = 'ELASTIC_CLIENT';
let ElasticsearchModule = class ElasticsearchModule {
};
exports.ElasticsearchModule = ElasticsearchModule;
exports.ElasticsearchModule = ElasticsearchModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.ELASTIC_CLIENT,
                useFactory: () => {
                    const node = process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200';
                    return new elasticsearch_1.Client({ node });
                },
            },
        ],
        exports: [exports.ELASTIC_CLIENT],
    })
], ElasticsearchModule);
//# sourceMappingURL=elasticsearch.module.js.map