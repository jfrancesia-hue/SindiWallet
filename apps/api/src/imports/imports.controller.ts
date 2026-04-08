import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { CreateImportDto } from './dto/create-import.dto';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Imports (Importación Masiva)')
@ApiBearerAuth()
@Controller('imports')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class ImportsController {
  constructor(private importsService: ImportsService) {}

  @Post()
  @ApiOperation({ summary: 'Subir CSV para importación masiva' })
  create(@OrgId() orgId: string, @Body() dto: CreateImportDto) {
    return this.importsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar jobs de importación' })
  findAll(@OrgId() orgId: string) {
    return this.importsService.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Estado y detalle de un job de importación' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.importsService.findOne(orgId, id);
  }
}
