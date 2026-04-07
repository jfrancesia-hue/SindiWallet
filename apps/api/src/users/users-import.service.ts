import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse/sync';

interface CsvRow {
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  cuit?: string;
  phone?: string;
  employerName?: string;
  employerCuit?: string;
  salary?: string;
  memberSince?: string;
}

@Injectable()
export class UsersImportService {
  constructor(private prisma: PrismaService) {}

  async importCsv(orgId: string, csvContent: string) {
    let rows: CsvRow[];

    try {
      rows = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestException('Error al parsear el archivo CSV');
    }

    if (rows.length === 0) {
      throw new BadRequestException('El archivo CSV está vacío');
    }

    // Crear job de importación
    const job = await this.prisma.importJob.create({
      data: {
        orgId,
        type: 'users',
        fileName: 'import.csv',
        totalRows: rows.length,
        status: 'PROCESSING',
      },
    });

    const errors: { row: number; error: string }[] = [];
    let processedRows = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      try {
        if (!row.email || !row.firstName || !row.lastName || !row.dni) {
          throw new Error('Campos obligatorios faltantes: email, firstName, lastName, dni');
        }

        // Verificar duplicados
        const existing = await this.prisma.user.findFirst({
          where: {
            orgId,
            OR: [{ email: row.email }, { dni: row.dni }],
          },
        });

        if (existing) {
          throw new Error(`Duplicado: ${existing.email === row.email ? 'email' : 'DNI'} ya existe`);
        }

        await this.prisma.user.create({
          data: {
            orgId,
            supabaseUserId: `import-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            dni: row.dni,
            cuit: row.cuit || null,
            phone: row.phone || null,
            employerName: row.employerName || null,
            employerCuit: row.employerCuit || null,
            salary: row.salary ? parseFloat(row.salary) : null,
            memberSince: row.memberSince ? new Date(row.memberSince) : null,
            role: 'AFFILIATE',
            kycStatus: 'PENDING',
          },
        });

        processedRows++;
      } catch (err: any) {
        errors.push({ row: i + 2, error: err.message });
      }
    }

    // Actualizar job
    await this.prisma.importJob.update({
      where: { id: job.id },
      data: {
        processedRows,
        errorRows: errors.length,
        status: errors.length === rows.length ? 'FAILED' : 'COMPLETED',
        errors: errors.length > 0 ? errors : undefined,
        completedAt: new Date(),
      },
    });

    return {
      jobId: job.id,
      totalRows: rows.length,
      processedRows,
      errorRows: errors.length,
      errors: errors.slice(0, 50), // Máximo 50 errores en la respuesta
    };
  }

  async getImportJobs(orgId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.importJob.findMany({
        where: { orgId, type: 'users' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.importJob.count({ where: { orgId, type: 'users' } }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
