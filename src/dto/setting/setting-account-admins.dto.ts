import { ApiProperty } from '@nestjs/swagger';
import { admin_account } from '@prisma/client';

export class SettingsAccountAdminsDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public full_name: string;

  constructor(admin: admin_account) {
    this.id = admin.id;
    this.email = admin.email;
    this.full_name = admin.full_name;
  }

  public static of(admins: admin_account[]): SettingsAccountAdminsDto[] {
    return admins.map((admin) => new SettingsAccountAdminsDto(admin));
  }
}
