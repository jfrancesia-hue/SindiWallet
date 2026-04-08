import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { MerchantFilterDto } from './dto/merchant-filter.dto';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Merchants (Comercios)')
@ApiBearerAuth()
@Controller('merchants')
@UseGuards(RolesGuard)
export class MerchantsController {
  constructor(private merchantsService: MerchantsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comercios adheridos con filtros' })
  findAll(@OrgId() orgId: string, @Query() filters: MerchantFilterDto) {
    return this.merchantsService.findAll(orgId, filters);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Categorías de comercios' })
  categories(@OrgId() orgId: string) {
    return this.merchantsService.getCategories(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un comercio' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.merchantsService.findOne(orgId, id);
  }

  // ── Admin ──

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registrar comercio adherido (admin)' })
  create(@OrgId() orgId: string, @Body() dto: CreateMerchantDto) {
    return this.merchantsService.create(orgId, dto);
  }

  @Post(':id/toggle-active')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Activar/desactivar comercio (admin)' })
  toggleActive(@OrgId() orgId: string, @Param('id') id: string) {
    return this.merchantsService.toggleActive(orgId, id);
  }

  @Patch(':id/discount')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar porcentaje de descuento (admin)' })
  updateDiscount(
    @OrgId() orgId: string,
    @Param('id') id: string,
    @Body('discountPercent') discountPercent: number,
  ) {
    return this.merchantsService.updateDiscount(orgId, id, discountPercent);
  }
}
