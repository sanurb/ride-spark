import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ConflictException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatabaseErrorMessageMap } from '../maps';
import { DatabaseErrorCode } from '../enums';

@Injectable()
export class DatabaseErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(
                catchError(this.handleDatabaseError)
            );
    }

    private handleDatabaseError(error: any): Observable<never> {
        const errorMessage = DatabaseErrorMessageMap[error.code as DatabaseErrorCode];
        if (errorMessage) {
            throw new ConflictException(errorMessage);
        }
        return throwError(() => error);
    }
}
