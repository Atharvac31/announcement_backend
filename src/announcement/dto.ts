/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAnnouncementDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAnnouncementStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;
}
