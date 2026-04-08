import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
@UseGuards(RolesGuard)
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear wallet para el usuario autenticado' })
  create(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWalletDto,
  ) {
    return this.walletsService.create(orgId, userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener mi wallet' })
  getMyWallet(
    @OrgId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletsService.findByUser(orgId, userId);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener wallet por ID (admin)' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.walletsService.findOne(orgId, id);
  }

  @Get(':id/balance')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener saldo de wallet (admin)' })
  getBalance(@OrgId() orgId: string, @Param('id') id: string) {
    return this.walletsService.getBalance(orgId, id);
  }

  @Post(':id/freeze')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Congelar wallet (admin)' })
  freeze(@OrgId() orgId: string, @Param('id') id: string) {
    return this.walletsService.freeze(orgId, id);
  }

  @Post(':id/unfreeze')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Descongelar wallet (admin)' })
  unfreeze(@OrgId() orgId: string, @Param('id') id: string) {
    return this.walletsService.unfreeze(orgId, id);
  }
}
