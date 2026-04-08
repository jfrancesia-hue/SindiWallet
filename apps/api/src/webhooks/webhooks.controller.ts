import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { BaasWebhookDto } from './dto/baas-webhook.dto';
import { Public } from '../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('baas')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook para callbacks de BaaS (Bind/Mock)' })
  handleBaas(@Body() dto: BaasWebhookDto, @Req() req: Request) {
    const rawBody = JSON.stringify(req.body);
    return this.webhooksService.handleBaasWebhook(dto, rawBody);
  }
}
