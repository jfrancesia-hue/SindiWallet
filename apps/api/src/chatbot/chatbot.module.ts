import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ClaudeService } from './claude.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, ClaudeService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
