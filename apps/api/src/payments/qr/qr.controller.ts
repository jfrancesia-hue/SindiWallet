import {
  Controller,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { GenerateQrDto } from './dto/generate-qr.dto';
import { PayQrDto } from './dto/pay-qr.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrgId } from '../../common/decorators/org-id.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('QR Payments')
@ApiBearerAuth()
@Controller('payments/qr')
@UseGuards(RolesGuard)
export class QrController {
  constructor(private qrService: QrService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generar QR de cobro' })
  generate(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateQrDto,
  ) {
    return this.qrService.generateQr(orgId, userId, dto);
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview de un QR escaneado — muestra comercio, monto y descuento' })
  preview(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body('qrData') qrData: string,
  ) {
    return this.qrService.previewQr(orgId, userId, qrData);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Confirmar pago QR escaneado' })
  pay(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PayQrDto,
  ) {
    return this.qrService.payQr(orgId, userId, dto);
  }
}
