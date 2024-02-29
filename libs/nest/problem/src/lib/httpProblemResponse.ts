import { HttpProblem, ProblemType } from '@shared/problem'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'


export class HttpProblemResponse implements HttpProblem {
  @ApiProperty({
    description: 'A URI reference that identifies the problem type',
  })
  type!:
    | ProblemType.HTTP_BAD_REQUEST
    | ProblemType.HTTP_UNAUTHORIZED
    | ProblemType.HTTP_FORBIDDEN
    | ProblemType.HTTP_NOT_FOUND

  @ApiProperty({
    description: 'A short, human-readable summary of the problem type',
  })
  title!: string

  @ApiPropertyOptional({
    description: 'The HTTP status code',
  })
  status?: number

  @ApiPropertyOptional({
    description:
      'A human-readable explanation specific to this occurrence of the problem',
  })
  detail?: string

  @ApiPropertyOptional({
    description:
      'A URI reference that identifies the specific occurrence of the problem.',
  })
  instance?: string
}
