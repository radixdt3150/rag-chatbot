import {
    Body,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { VectorService } from "./vector.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("vector")
export class VectorController {
    constructor(private readonly vectorService: VectorService) {}

    @Post()
    async askQuestion(@Body() body: { question: string }) {
        return this.vectorService.answerQuestion(body.question);
    }

    @Post("pdf")
    @UseInterceptors(FileInterceptor("file"))
    async uploadPdf(@UploadedFile() file: Express.Multer.File) {
        return this.vectorService.indexPdf(file.buffer);
    }
}
