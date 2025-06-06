import {
    Body,
    Controller,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { VectorService } from "./vector.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";

@Controller("vector")
export class VectorController {
    constructor(private readonly vectorService: VectorService) {}

    @Post()
    async askQuestion(
        @Body() body: { question: string },
        @Res() res: Response
    ) {
        const result = await this.vectorService.answerQuestion(body.question);
        res.status(200).json({ answer: result });
    }

    @Post("document")
    @UseInterceptors(FileInterceptor("file"))
    async uploadPdf(@UploadedFile() file: Express.Multer.File) {
        return this.vectorService.indexDocument(file.buffer);
    }
}
