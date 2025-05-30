import { Body, Controller, Post } from '@nestjs/common';
import { AskService } from './ask.service';
import { AskRequestDto } from './dto/ask-request.dto';
import { AskResponseDto } from './dto/ask-response.dto';

@Controller('ask')
export class AskController {
    constructor(private readonly askService: AskService) { }

    @Post()
    ask(@Body() request: AskRequestDto): AskResponseDto {
        return this.askService.askQuestion(request);
    }
}
