import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyExistException extends HttpException {
  constructor() {
    super('Already exist', HttpStatus.CONFLICT);
  }
}

export class AlreadyExistError extends HttpException {
  constructor(message?: string) {
    super(message || 'Already exist', HttpStatus.CONFLICT);
  }
}
