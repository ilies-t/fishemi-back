import { SetMetadata } from '@nestjs/common';

export const AuthDisabled = () => SetMetadata('AUTH_DISABLED', true);
