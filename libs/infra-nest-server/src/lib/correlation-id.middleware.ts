import { NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express'

export const CORRELATIONAL_ID_HEADER = 'X-Correlation-ID';

export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Si el encabezado ya existe en la solicitud, úsalo; de lo contrario, genera uno nuevo
    const id = req.get(CORRELATIONAL_ID_HEADER) || randomUUID();

    // Establecer el ID de correlación en la solicitud y en el encabezado de respuesta
    req[CORRELATIONAL_ID_HEADER] = id;
    res.set(CORRELATIONAL_ID_HEADER, id);

    next();
  }
}
