// libs/api/infra-nest-server/src/lib/buildOpenApi.ts
import { writeFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { Logger, Type } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import yaml from 'yaml';

import { InfraNestServerModule as InfraModule } from './infra/infra-nest-server.module';

const logger = new Logger('buildOpenApi');

export const buildOpenApi = async ({
  appModule,
  openApi,
  path,
  enableVersioning,
}: {
  appModule: Type<any>;
  openApi: Omit<OpenAPIObject, 'paths'>;
  path: string;
  enableVersioning?: boolean;
}) => {
  try {
    logger.log('Creating openapi.yaml file ...', path);
    console.log('Creating openapi.yaml file ...', path);

    const app = await NestFactory.create(InfraModule.forRoot({ appModule }));
    if (enableVersioning) {
      app.enableVersioning();
    }
    const document = SwaggerModule.createDocument(app, openApi);

    writeFileSync(path, yaml.stringify(document));

    // Shut down everything so the process ends.
    await app.close();
  } catch (error) {
    logger.error('Error while creating openapi.yaml', error);
  }
};
