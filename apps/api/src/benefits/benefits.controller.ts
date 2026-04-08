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
import { BenefitsService } from './benefits.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { RequestBenefitDto } from './dto/request-benefit.dto';
import { ReviewBenefitDto } from './dto/review-benefit.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Benefits (Beneficios)')
@ApiBearerAuth()
@Controller('benefits')
@UseGuards(RolesGuard)
export class BenefitsController {
  constructor(private benefitsService: BenefitsService) {}

  // ── Catálogo ──

  @Get()
  @ApiOperation({ summary: 'Catálogo de beneficios disponibles' })
  findAll(@OrgId() orgId: string, @Query('category') category?: string) {
    return this.benefitsService.findAll(orgId, category);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías de beneficios' })
  categories(@OrgId() orgId: string) {
    return this.benefitsService.getCategories(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un beneficio' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.benefitsService.findOne(orgId, id);
  }

  // ── Admin ──

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear beneficio (admin)' })
  create(@OrgId() orgId: string, @Body() dto: CreateBenefitDto) {
    return this.benefitsService.create(orgId, dto);
  }

  @Get('requests/pending')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Solicitudes pendientes de revisión (admin)' })
  pendingRequests(@OrgId() orgId: string) {
    return this.benefitsService.getPendingRequests(orgId);
  }

  @Post('requests/:id/review')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Aprobar o rechazar solicitud (admin)' })
  review(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewBenefitDto,
  ) {
    return this.benefitsService.review(orgId, id, reviewerId, dto);
  }

  @Post('requests/:id/disburse')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desembolsar beneficio aprobado (admin)' })
  disburse(@OrgId() orgId: string, @Param('id') id: string) {
    return this.benefitsService.disburse(orgId, id);
  }

  // ── Afiliado ──

  @Post('request')
  @ApiOperation({ summary: 'Solicitar un beneficio' })
  request(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RequestBenefitDto,
  ) {
    return this.benefitsService.requestBenefit(orgId, userId, dto);
  }

  @Get('my/requests')
  @ApiOperation({ summary: 'Mis solicitudes de beneficios' })
  myRequests(@OrgId() orgId: string, @CurrentUser('id') userId: string) {
    return this.benefitsService.getMyRequests(orgId, userId);
  }
}
