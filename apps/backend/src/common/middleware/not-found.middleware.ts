import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NotFoundMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Trigger global exception handler with a 404 error
    next(new NotFoundException(`Route ${req.method} ${req.originalUrl} not found`));
  }
}
