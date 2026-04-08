import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditFilterDto } from './dto/audit-filter.dto';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Audit Log')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar log de auditoría con filtros (admin)' })
  findAll(@OrgId() orgId: string, @Query() filters: AuditFilterDto) {
    return this.auditService.findAll(orgId, filters);
  }
}
