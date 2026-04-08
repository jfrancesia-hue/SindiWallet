import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Chatbot (Asistente IA)')
@ApiBearerAuth()
@Controller('chatbot')
@UseGuards(RolesGuard)
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Post('message')
  @ApiOperation({ summary: 'Enviar mensaje al asistente IA' })
  sendMessage(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatbotService.sendMessage(orgId, userId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Listar mis sesiones de chat' })
  sessions(@CurrentUser('id') userId: string) {
    return this.chatbotService.getSessions(userId);
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Historial de mensajes de una sesión' })
  messages(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.chatbotService.getSessionMessages(userId, sessionId);
  }

  @Post('sessions/:id/close')
  @ApiOperation({ summary: 'Cerrar sesión de chat' })
  close(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.chatbotService.closeSession(userId, sessionId);
  }
}
