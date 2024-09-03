import { admin_account } from '@prisma/client';

export class SettingsAccountDto {
  public email: string;
  public company_name: string;
  public admins: Pick<admin_account, 'id' | 'email' | 'full_name'>[];

  public constructor(
    email: string,
    company_name: string,
    admins: Pick<admin_account, 'id' | 'email' | 'full_name'>[],
  ) {
    this.email = email;
    this.company_name = company_name;
    this.admins = admins;
  }
}

export class CreateManagerDto {
  public email: string;
  public full_name: string;
  public roles: ['lector'] | ['lector', 'writer'];

  public constructor(email: string, full_name: string) {
    this.email = email;
    this.full_name = full_name;
    this.roles = ['lector'];
  }
}
