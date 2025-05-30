import { IsString } from 'class-validator';

export class AskRequestDto {
  @IsString()
  question: string;
}