import { INestApplication, NestInterceptor, Type } from '@nestjs/common'
import { OpenAPIObject } from '@nestjs/swagger'
import { Server } from 'http'

export type RunServerOptions = {
  /**
   * Main nest module.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appModule: Type<any>

  /**
   * Server name.
   */
  name: string

  /**
   * The base path of the swagger documentation.
   */
  swaggerPath?: string

  /**
   * OpenAPI definition.
   */
  openApi?: Omit<OpenAPIObject, 'paths'>

  /**
   * The port to start the server on.
   */
  port?: number

  /**
   * Hook up global interceptors to app
   */
  interceptors?: NestInterceptor[]

  /**
   * Global url prefix for the app
   */
  globalPrefix?: string

  stripNonClassValidatorInputs?: boolean

  /**
   * Enables NestJS versioning.
   */
  enableVersioning?: boolean

  /**
   * Configures metrics collection and starts metric server.
   */
  collectMetrics?: boolean

  /**
   * Controls the maximum request json body size. If this is a number, then the
   * value specifies the number of bytes; if it is a string, the value is passed
   * to the bytes library for parsing. Defaults to '100kb'.
   */
  jsonBodyLimit?: number | string
}

export interface InfraNestServer {
  app: INestApplication
  server: Server
  metricsServer?: Server | undefined;
  close?: () => Promise<void>
}
