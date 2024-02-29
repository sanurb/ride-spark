import { OpenAPIObject } from "@nestjs/swagger";

export const openApi: Omit<OpenAPIObject, 'paths'> = {
  openapi: process.env.OPENAPI_VERSION || '3.0.0',
  info: {
    title: process.env.API_TITLE || 'API Coltefinanciera Wallet',
    version: process.env.API_VERSION || '1.0',
    description: process.env.API_DESCRIPTION || 'API Coltefinanciera Wallet',
  },
  servers: [
    {
      url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4444}`,
      description: process.env.SERVER_DESCRIPTION || 'Local server',
    },
    {
      url: `http://44.203.191.25:4444`,
      description: 'Production server',
    }
  ],
};
