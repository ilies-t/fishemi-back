import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyExistException extends HttpException {
  constructor() {
    super('Already exist', HttpStatus.CONFLICT);
  }
}
