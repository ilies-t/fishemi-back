import { SetMetadata } from '@nestjs/common';

export const RoleRestricted = () => SetMetadata('ROLE_RESTRICTED', true);
