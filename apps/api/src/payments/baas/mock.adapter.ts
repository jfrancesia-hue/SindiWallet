import { Injectable, Logger } from '@nestjs/common';
import {
  BaasAdapter,
  CreateAccountResult,
  TransferResult,
  GenerateQrResult,
  RequestDebinResult,
} from './baas.interface';

@Injectable()
export class MockBaasAdapter implements BaasAdapter {
  private readonly logger = new Logger(MockBaasAdapter.name);

  private generateCvu(): string {
    // CVU argentino: 22 dígitos, prefijo de entidad virtual mock
    const prefix = '0000003';
    const random = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    return prefix + random;
  }

  async createAccount(userId: string, orgId: string): Promise<CreateAccountResult> {
    this.logger.debug(`[MOCK] createAccount — userId: ${userId}, orgId: ${orgId}`);
    await this.simulateLatency();

    return {
      accountId: `MOCK_ACCT_${Date.now()}`,
      cvu: this.generateCvu(),
    };
  }

  async transfer(params: {
    fromCvu: string;
    toCvu: string;
    amount: number;
    reference: string;
  }): Promise<TransferResult> {
    this.logger.debug(
      `[MOCK] transfer — from: ${params.fromCvu} to: ${params.toCvu} amount: ${params.amount}`,
    );
    await this.simulateLatency();

    return {
      transactionId: `MOCK_TXN_${Date.now()}`,
      status: 'APPROVED',
    };
  }

  async generateQr(params: {
    cvu: string;
    amount: number;
    description: string;
  }): Promise<GenerateQrResult> {
    this.logger.debug(`[MOCK] generateQr — cvu: ${params.cvu}, amount: ${params.amount}`);
    await this.simulateLatency();

    // Formato BCRA interoperable (simplificado para mock)
    const qrPayload = {
      version: '01',
      initiationMethod: '11', // QR estático con monto
      merchant: {
        cvu: params.cvu,
        name: 'SindiWallet',
      },
      currency: '032', // ARS - ISO 4217 numérico
      amount: params.amount.toFixed(2),
      description: params.description,
      timestamp: new Date().toISOString(),
    };

    const qrData = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

    return {
      qrData,
      qrImage: `data:image/png;base64,MOCK_QR_IMAGE_${Date.now()}`,
    };
  }

  async requestDebin(params: {
    fromCvu: string;
    toCvu: string;
    amount: number;
  }): Promise<RequestDebinResult> {
    this.logger.debug(
      `[MOCK] requestDebin — from: ${params.fromCvu} to: ${params.toCvu} amount: ${params.amount}`,
    );
    await this.simulateLatency();

    return {
      debinId: `MOCK_DEBIN_${Date.now()}`,
      status: 'PENDING',
    };
  }

  private simulateLatency(ms = 50): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
