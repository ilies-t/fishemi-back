import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatusEnum } from '@enumerators/template.enum';
import { IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';

export class NewCampaignDto {
  @IsUUID(null, { each: true })
  @ApiProperty()
  public lists: string[];

  @IsString()
  @MaxLength(255)
  @ApiProperty()
  public name: string;

  @IsEnum(CampaignStatusEnum)
  @ApiProperty({ example: CampaignStatusEnum.Microsoft })
  public template: CampaignStatusEnum;

  @IsString()
  @MaxLength(255)
  @ApiProperty()
  public subject: string;

  @IsString()
  @MaxLength(1000)
  @ApiProperty()
  public content: string;
}
