import { ApiProperty } from '@nestjs/swagger';
import { TemplateEnum } from '@enumerators/template.enum';
import { IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';

export class NewCampaignDto {
  @IsUUID(null, { each: true })
  @ApiProperty()
  public lists: string[];

  @IsString()
  @MaxLength(255)
  @ApiProperty()
  public name: string;

  @IsEnum(TemplateEnum)
  @ApiProperty({ example: TemplateEnum.Microsoft })
  public template: TemplateEnum;

  @IsString()
  @MaxLength(255)
  @ApiProperty()
  public subject: string;

  @IsString()
  @MaxLength(1000)
  @ApiProperty()
  public content: string;
}

export class updateCampaignDto extends NewCampaignDto {
  @IsUUID()
  @ApiProperty()
  public id: string;
}
