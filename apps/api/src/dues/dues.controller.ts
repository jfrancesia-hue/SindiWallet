import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DuesService } from './dues.service';
import { CreateDueDto } from './dto/create-due.dto';
import { PayDueDto } from './dto/pay-due.dto';
import { BulkRetentionDto } from './dto/bulk-retention.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Dues (Cuotas Sindicales)')
@ApiBearerAuth()
@Controller('dues')
@UseGuards(RolesGuard)
export class DuesController {
  constructor(private duesService: DuesService) {}

  // ── Admin endpoints ──

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear tipo de cuota sindical (admin)' })
  create(@OrgId() orgId: string, @Body() dto: CreateDueDto) {
    return this.duesService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de cuota de la organización' })
  findAll(@OrgId() orgId: string) {
    return this.duesService.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un tipo de cuota' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.duesService.findOne(orgId, id);
  }

  @Post('retention/bulk')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Retención masiva de cuotas por nómina (admin)' })
  bulkRetention(@OrgId() orgId: string, @Body() dto: BulkRetentionDto) {
    return this.duesService.bulkRetention(orgId, dto);
  }

  // ── Affiliate endpoints ──

  @Post('pay')
  @ApiOperation({ summary: 'Pagar cuota desde mi wallet' })
  pay(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PayDueDto,
  ) {
    return this.duesService.payFromWallet(orgId, userId, dto);
  }

  @Get('my/history')
  @ApiOperation({ summary: 'Mi historial de cuotas por año' })
  myHistory(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Query('year') year?: string,
  ) {
    return this.duesService.getMyHistory(
      orgId,
      userId,
      year ? parseInt(year, 10) : undefined,
    );
  }
}
