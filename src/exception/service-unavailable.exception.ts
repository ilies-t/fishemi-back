import { HttpException, HttpStatus } from '@nestjs/common';

export class ServiceUnavailableException extends HttpException {
  constructor(message?: string) {
    super(message || 'Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
