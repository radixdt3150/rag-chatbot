import { Injectable } from '@nestjs/common';
import { AskRequestDto } from './dto/ask-request.dto';
import { AskResponseDto } from './dto/ask-response.dto';

@Injectable()
export class AskService {
    askQuestion(data: AskRequestDto): AskResponseDto {
        return {
            answer: `This is a dummy response to your question: "${data.question}"`,
        };
    }
}
