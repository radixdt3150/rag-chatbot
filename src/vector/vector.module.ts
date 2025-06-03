import { Module } from "@nestjs/common";
import { VectorService } from "./vector.service";
import { VectorController } from "./vector.controller";

@Module({
    controllers: [VectorController],
    providers: [VectorService],
})
export class VectorModule {}
