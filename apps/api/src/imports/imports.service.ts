import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImportDto } from './dto/create-import.dto';
import { ImportStatus, Prisma } from '@sindiwallet/db';

interface CsvRow {
  [key: string]: string;
}

@Injectable()
export class ImportsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateImportDto) {
    // Decodificar CSV
    let csvContent: string;
    try {
      csvContent = Buffer.from(dto.csvBase64, 'base64').toString('utf-8');
    } catch {
      throw new BadRequestException('CSV inválido (base64 malformado)');
    }

    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new BadRequestException('El CSV debe tener al menos un header y una fila de datos');
    }

    const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase());
    const totalRows = lines.length - 1;

    // Crear job
    const job = await this.prisma.importJob.create({
      data: {
        orgId,
        type: dto.type,
        fileName: dto.fileName,
        totalRows,
        status: ImportStatus.PENDING,
      },
    });

    // Procesar async
    this.processAsync(job.id, orgId, dto.type, headers, lines.slice(1)).catch(() => {});

    return job;
  }

  private async processAsync(
    jobId: string,
    orgId: string,
    type: string,
    headers: string[],
    dataLines: string[],
  ) {
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: ImportStatus.PROCESSING },
    });

    let processedRows = 0;
    let errorRows = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = dataLines[i]!.split(',').map((v) => v.trim());
        const row: CsvRow = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] ?? '';
        });

        await this.processRow(orgId, type, row);
        processedRows++;
      } catch (error) {
        errorRows++;
        errors.push({
          row: i + 2, // +1 header +1 base-1
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }

      // Update progress cada 50 filas
      if ((i + 1) % 50 === 0 || i === dataLines.length - 1) {
        await this.prisma.importJob.update({
          where: { id: jobId },
          data: { processedRows, errorRows },
        });
      }
    }

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        status: ImportStatus.COMPLETED,
        processedRows,
        errorRows,
        errors: errors as unknown as Prisma.JsonArray,
        completedAt: new Date(),
      },
    });
  }

  private async processRow(orgId: string, type: string, row: CsvRow) {
    switch (type) {
      case 'USERS':
        await this.prisma.user.create({
          data: {
            orgId,
            supabaseUserId: `IMPORT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            email: row['email'] ?? '',
            firstName: row['nombre'] ?? row['first_name'] ?? '',
            lastName: row['apellido'] ?? row['last_name'] ?? '',
            dni: row['dni'] ?? '',
            phone: row['telefono'] ?? row['phone'] ?? undefined,
            cuit: row['cuit'] ?? undefined,
            salary: (row['salario'] || row['salary']) ? parseFloat(row['salario'] || row['salary'] || '0') : undefined,
          },
        });
        break;

      case 'DUES':
        // Importar pagos de cuotas históricos
        if (!row['user_dni'] || !row['due_name'] || !row['period']) {
          throw new Error('Faltan campos: user_dni, due_name, period');
        }
        const user = await this.prisma.user.findFirst({
          where: { orgId, dni: row['user_dni'] },
        });
        if (!user) throw new Error(`Usuario con DNI ${row['user_dni']} no encontrado`);

        const due = await this.prisma.due.findFirst({
          where: { orgId, name: row['due_name'] },
        });
        if (!due) throw new Error(`Cuota "${row['due_name']}" no encontrada`);

        await this.prisma.duePayment.upsert({
          where: {
            dueId_userId_period: {
              dueId: due.id,
              userId: user.id,
              period: row['period'],
            },
          },
          update: { status: 'PAID', paidAt: new Date(), source: 'EXTERNAL' },
          create: {
            dueId: due.id,
            userId: user.id,
            period: row['period'],
            amount: parseFloat(row['amount'] ?? String(due.amount)),
            status: 'PAID',
            paidAt: new Date(),
            source: 'EXTERNAL',
          },
        });
        break;

      case 'MERCHANTS':
        const merchantUser = await this.prisma.user.findFirst({
          where: { orgId, dni: row['user_dni'] ?? row['dni'] },
        });
        if (!merchantUser) throw new Error(`Usuario con DNI ${row['user_dni'] ?? row['dni']} no encontrado`);

        await this.prisma.merchant.create({
          data: {
            orgId,
            userId: merchantUser.id,
            businessName: row['razon_social'] ?? row['business_name'] ?? '',
            cuit: row['cuit'] ?? '',
            category: row['categoria'] ?? row['category'] ?? 'General',
            address: row['direccion'] ?? row['address'] ?? undefined,
            discountPercent: row['descuento'] ? parseFloat(row['descuento']) : 0,
          },
        });
        break;

      default:
        throw new Error(`Tipo de importación no soportado: ${type}`);
    }
  }

  async findAll(orgId: string) {
    return this.prisma.importJob.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(orgId: string, id: string) {
    const job = await this.prisma.importJob.findFirst({
      where: { id, orgId },
    });
    if (!job) throw new NotFoundException('Job de importación no encontrado');
    return job;
  }
}
