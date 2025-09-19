import { Module } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

export const ELASTIC_CLIENT = 'ELASTIC_CLIENT';

@Module({
  providers: [
    {
      provide: ELASTIC_CLIENT,
      useFactory: () => {
        const node = process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200';
        return new Client({ node });
      },
    },
  ],
  exports: [ELASTIC_CLIENT],
})
export class ElasticsearchModule {}


