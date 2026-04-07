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
import { UsersService } from './users.service';
import { UsersImportService } from './users-import.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, KycUpdateDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrgId } from '../common/decorators/org-id.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private importService: UsersImportService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findMe(userId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear usuario (ADMIN)' })
  create(@OrgId() orgId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(orgId, dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar usuarios de la organización' })
  findAll(
    @OrgId() orgId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.usersService.findAll(orgId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      role,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@OrgId() orgId: string, @Param('id') id: string) {
    return this.usersService.findOne(orgId, id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(@OrgId() orgId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(orgId, id, dto);
  }

  @Patch(':id/kyc')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar estado KYC' })
  updateKyc(@OrgId() orgId: string, @Param('id') id: string, @Body() dto: KycUpdateDto) {
    return this.usersService.updateKyc(orgId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desactivar usuario (soft delete)' })
  remove(@OrgId() orgId: string, @Param('id') id: string) {
    return this.usersService.remove(orgId, id);
  }

  @Post('import-csv')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Importar usuarios desde CSV' })
  importCsv(@OrgId() orgId: string, @Body('csv') csv: string) {
    return this.importService.importCsv(orgId, csv);
  }

  @Get('import-jobs')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar jobs de importación' })
  getImportJobs(@OrgId() orgId: string, @Query('page') page?: string) {
    return this.importService.getImportJobs(orgId, page ? parseInt(page, 10) : 1);
  }
}
