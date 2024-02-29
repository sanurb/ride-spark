import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ErrorFilter } from './error.filter'
import { HttpExceptionFilter } from './httpException.filter'
import { DatabaseErrorInterceptor } from './interceptor/database-error.interceptor'
import { ProblemFilter } from './problem.filter'
import { PROBLEM_OPTIONS, ProblemOptions } from './problem.options'

@Module({
  imports: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DatabaseErrorInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ProblemFilter,
    },
    {
      provide: PROBLEM_OPTIONS,
      useValue: { logAllErrors: false },
    },
  ],
})
export class ProblemModule {
  static forRoot(options: ProblemOptions) {
    return {
      module: ProblemModule,
      providers: [
        {
          provide: PROBLEM_OPTIONS,
          useValue: options,
        },
      ],
    }
  }
}
