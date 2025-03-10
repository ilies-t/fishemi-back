import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundError extends HttpException {
  constructor(message?: string) {
    super(message || 'Not Found', HttpStatus.NOT_FOUND);
  }
}
