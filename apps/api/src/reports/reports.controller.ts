import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar generación de reporte' })
  create(@OrgId() orgId: string, @Body() dto: CreateReportDto) {
    return this.reportsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reportes generados' })
  findAll(@OrgId() orgId: string) {
    return this.reportsService.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Estado/detalle de un reporte' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.reportsService.findOne(orgId, id);
  }
}
