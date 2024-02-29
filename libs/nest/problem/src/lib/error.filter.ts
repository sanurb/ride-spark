import { Catch } from '@nestjs/common'
import { BaseProblemFilter } from './base-problem.filter'
import { Problem, ProblemType } from '@shared/problem'

@Catch(Error)
export class ErrorFilter extends BaseProblemFilter {
  getProblem(error: Error): Problem {
    const extraDetails =
      process.env.NODE_ENV !== 'production'
        ? { detail: error.message, stack: error.stack }
        : null

    return {
      status: 500,
      type: ProblemType.HTTP_INTERNAL_SERVER_ERROR,
      title: 'Internal server error',
      ...extraDetails,
    }
  }
}
