import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AskModule } from "./ask/ask.module";
import { VectorModule } from "./vector/vector.module";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AskModule,
        VectorModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
