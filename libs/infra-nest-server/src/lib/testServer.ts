
import { Type, ValidationPipe } from '@nestjs/common'
import { InfraNestServerModule as InfraModule } from './infra/infra-nest-server.module'
import { Test } from '@nestjs/testing'
import { TestingModuleBuilder } from '@nestjs/testing/testing-module.builder'

export type TestServerOptions = {
  /**
   * Main nest module.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appModule: Type<any>

  /**
   * Hook to override providers.
   */
  override?: (builder: TestingModuleBuilder) => TestingModuleBuilder
}

export const testServer = async ({
  appModule,
  override,
}: TestServerOptions) => {
  let builder = Test.createTestingModule({
    imports: [
      InfraModule.forRoot({
        appModule,
      }),
    ],
  })
  if (override) {
    builder = override(builder)
  }

  const moduleRef = await builder.compile()
  const app = moduleRef.createNestApplication()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
    }),
  )

  return app.init()
}
