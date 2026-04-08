import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus, Prisma } from '@sindiwallet/db';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        orgId,
        type: dto.type,
        format: dto.format ?? 'PDF',
        parameters: (dto.parameters as Prisma.JsonObject) ?? {},
        status: ReportStatus.PENDING,
      },
    });

    // En producción aquí se encolaría un job async.
    // Por ahora simulamos generación inmediata.
    this.generateAsync(report.id).catch(() => {});

    return report;
  }

  private async generateAsync(reportId: string) {
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.GENERATING },
    });

    // Simular procesamiento
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.COMPLETED,
        fileUrl: `/reports/${reportId}.pdf`,
        generatedAt: new Date(),
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.report.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findOne(orgId: string, id: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, orgId },
    });
    if (!report) throw new NotFoundException('Reporte no encontrado');
    return report;
  }
}
