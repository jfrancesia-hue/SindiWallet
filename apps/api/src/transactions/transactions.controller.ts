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
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { TransferCvuDto } from './dto/transfer-cvu.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Transferencia interna entre wallets de la misma org' })
  transfer(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TransferDto,
  ) {
    return this.transactionsService.transfer(orgId, userId, dto);
  }

  @Post('transfer-cvu')
  @ApiOperation({ summary: 'Transferencia a CVU externo via BaaS' })
  transferCvu(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TransferCvuDto,
  ) {
    return this.transactionsService.transferCvu(orgId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transacciones con filtros y paginación' })
  findAll(
    @OrgId() orgId: string,
    @Query() filters: TransactionFilterDto,
  ) {
    return this.transactionsService.findAll(orgId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una transacción' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.transactionsService.findOne(orgId, id);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Comprobante de una transacción completada' })
  getReceipt(@OrgId() orgId: string, @Param('id') id: string) {
    return this.transactionsService.getReceipt(orgId, id);
  }
}
