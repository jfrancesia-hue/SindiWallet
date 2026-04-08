import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoansService } from './loans.service';
import { SimulateLoanDto } from './dto/simulate-loan.dto';
import { RequestLoanDto } from './dto/request-loan.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Loans (Micropréstamos)')
@ApiBearerAuth()
@Controller('loans')
@UseGuards(RolesGuard)
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post('simulate')
  @ApiOperation({ summary: 'Simular préstamo con scoring en tiempo real' })
  simulate(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SimulateLoanDto,
  ) {
    return this.loansService.simulate(orgId, userId, dto);
  }

  @Post('request')
  @ApiOperation({ summary: 'Solicitar préstamo' })
  request(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RequestLoanDto,
  ) {
    return this.loansService.request(orgId, userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar mis préstamos' })
  myLoans(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.loansService.getMyLoans(orgId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un préstamo' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.loansService.getLoanDetail(orgId, id);
  }

  // ── Admin ──

  @Post(':id/disburse')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desembolsar préstamo aprobado (admin)' })
  disburse(@OrgId() orgId: string, @Param('id') id: string) {
    return this.loansService.disburse(orgId, id);
  }

  // ── Affiliate ──

  @Post(':id/pay-installment')
  @ApiOperation({ summary: 'Pagar siguiente cuota del préstamo' })
  payInstallment(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') loanId: string,
    @Body('idempotencyKey') idempotencyKey: string,
  ) {
    return this.loansService.payInstallment(orgId, userId, loanId, idempotencyKey);
  }
}
