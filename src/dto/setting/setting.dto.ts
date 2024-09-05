import { admin_account } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { SettingsAccountAdminsDto } from '@dto/setting/setting-account-admins.dto';

export class SettingsAccountDto {
  @ApiProperty()
  public email: string;

  @ApiProperty()
  public company_name: string;

  @ApiProperty({ type: SettingsAccountAdminsDto, isArray: true })
  public admins: SettingsAccountAdminsDto[];

  public constructor(
    email: string,
    company_name: string,
    admins: admin_account[],
  ) {
    this.email = email;
    this.company_name = company_name;
    this.admins = SettingsAccountAdminsDto.of(admins);
  }
}
