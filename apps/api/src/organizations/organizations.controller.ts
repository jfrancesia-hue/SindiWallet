import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(RolesGuard)
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Post()
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Crear organización (SUPERADMIN)' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgsService.create(dto);
  }

  @Get()
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Listar organizaciones (SUPERADMIN)' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.orgsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  findOne(@Param('id') id: string) {
    return this.orgsService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener organización por slug (público)' })
  findBySlug(@Param('slug') slug: string) {
    return this.orgsService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Actualizar organización (SUPERADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.orgsService.update(id, dto);
  }

  @Patch(':id/branding')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar branding white-label' })
  updateBranding(@Param('id') id: string, @Body() dto: UpdateBrandingDto) {
    return this.orgsService.updateBranding(id, dto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Desactivar organización (soft delete)' })
  remove(@Param('id') id: string) {
    return this.orgsService.remove(id);
  }

  @Get(':id/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Estadísticas de la organización' })
  getStats(@Param('id') id: string) {
    return this.orgsService.getStats(id);
  }
}
