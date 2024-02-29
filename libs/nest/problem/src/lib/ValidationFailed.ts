import { ProblemType, ValidationFailedFields } from '@shared/problem'
import { ProblemError } from './ProblemError'

export class ValidationFailed extends ProblemError {
  constructor(fields: ValidationFailedFields) {
    super({
      type: ProblemType.VALIDATION_FAILED,
      title: 'Validation Failed',
      status: 400,
      detail: `Found issues in these fields: ${Object.keys(fields).join(', ')}`,
      fields,
    })
  }
}
