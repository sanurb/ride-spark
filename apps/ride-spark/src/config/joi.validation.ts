import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),

  PORT: Joi.number()
      .port()
      .default(4444)
      .required(),

  DB_PORT: Joi.number()
      .port()
      .default(5432)
      .required(),

  DB_HOST: Joi.string()
      .hostname()
      .default('localhost')
      .required(),

  DB_NAME: Joi.string()
      .required(),

  DB_USER: Joi.string()
      .required(),

  DB_PASSWORD: Joi.string()
      .required(),

  WOMPI_BASE_URL: Joi.string()
      .uri({
          scheme: [
              /https?/
          ]
      })
      .default('https://sandbox.wompi.co/v1')
      .required(),

  WOMPI_PUBLIC_KEY: Joi.string()
      .required(),

  WOMPI_PRIVATE_KEY: Joi.string()
      .required(),
})
