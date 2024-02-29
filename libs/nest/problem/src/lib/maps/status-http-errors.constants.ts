import { BadGatewayException, BadRequestException, ConflictException, ForbiddenException, GatewayTimeoutException, GoneException, HttpException, HttpStatus, InternalServerErrorException, MethodNotAllowedException, NotAcceptableException, NotFoundException, NotImplementedException, PayloadTooLargeException, PreconditionFailedException, RequestTimeoutException, ServiceUnavailableException, UnauthorizedException, UnprocessableEntityException, UnsupportedMediaTypeException } from "@nestjs/common";

export const STATUS_ERRORS: { [key: number]: new (message: string) => HttpException  } = {
  [HttpStatus.BAD_REQUEST]: BadRequestException,
  [HttpStatus.UNAUTHORIZED]: UnauthorizedException,
  [HttpStatus.FORBIDDEN]: ForbiddenException,
  [HttpStatus.NOT_FOUND]: NotFoundException,
  [HttpStatus.METHOD_NOT_ALLOWED]: MethodNotAllowedException,
  [HttpStatus.NOT_ACCEPTABLE]: NotAcceptableException,
  [HttpStatus.REQUEST_TIMEOUT]: RequestTimeoutException,
  [HttpStatus.CONFLICT]: ConflictException,
  [HttpStatus.GONE]: GoneException,
  [HttpStatus.LENGTH_REQUIRED]: PayloadTooLargeException,
  [HttpStatus.PRECONDITION_FAILED]: PreconditionFailedException,
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: UnsupportedMediaTypeException,
  [HttpStatus.UNPROCESSABLE_ENTITY]: UnprocessableEntityException,
  [HttpStatus.TOO_MANY_REQUESTS]: BadRequestException,
  [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorException,
  [HttpStatus.NOT_IMPLEMENTED]: NotImplementedException,
  [HttpStatus.BAD_GATEWAY]: BadGatewayException,
  [HttpStatus.SERVICE_UNAVAILABLE]: ServiceUnavailableException,
  [HttpStatus.GATEWAY_TIMEOUT]: GatewayTimeoutException,
};
