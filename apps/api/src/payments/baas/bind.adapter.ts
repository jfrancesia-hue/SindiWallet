import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import {
  BaasAdapter,
  CreateAccountResult,
  TransferResult,
  GenerateQrResult,
  RequestDebinResult,
} from './baas.interface';

/**
 * Adaptador real para Bind Financial API.
 * Requiere las variables de entorno:
 *   BAAS_API_URL    — URL base de la API de Bind
 *   BAAS_API_KEY    — API key de autenticación
 *   BAAS_API_SECRET — Secret para firma de requests
 */
@Injectable()
export class BindBaasAdapter implements BaasAdapter {
  private readonly logger = new Logger(BindBaasAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.baseUrl = process.env.BAAS_API_URL ?? '';
    this.apiKey = process.env.BAAS_API_KEY ?? '';
    this.apiSecret = process.env.BAAS_API_SECRET ?? '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
      'X-Api-Secret': this.apiSecret,
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`[BIND] ${method} ${url}`);

    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`[BIND] Error ${response.status}: ${errorText}`);
      throw new InternalServerErrorException(
        `Error en BaaS Bind: ${response.status} — ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async createAccount(userId: string, orgId: string): Promise<CreateAccountResult> {
    return this.request<CreateAccountResult>('POST', '/v1/accounts', {
      userId,
      orgId,
      accountType: 'VIRTUAL',
      currency: 'ARS',
    });
  }

  async transfer(params: {
    fromCvu: string;
    toCvu: string;
    amount: number;
    reference: string;
  }): Promise<TransferResult> {
    return this.request<TransferResult>('POST', '/v1/transfers', {
      originCvu: params.fromCvu,
      destinationCvu: params.toCvu,
      amount: params.amount,
      currency: 'ARS',
      reference: params.reference,
    });
  }

  async generateQr(params: {
    cvu: string;
    amount: number;
    description: string;
  }): Promise<GenerateQrResult> {
    return this.request<GenerateQrResult>('POST', '/v1/qr/generate', {
      cvu: params.cvu,
      amount: params.amount,
      description: params.description,
      currency: 'ARS',
    });
  }

  async requestDebin(params: {
    fromCvu: string;
    toCvu: string;
    amount: number;
  }): Promise<RequestDebinResult> {
    return this.request<RequestDebinResult>('POST', '/v1/debin/request', {
      originCvu: params.fromCvu,
      destinationCvu: params.toCvu,
      amount: params.amount,
      currency: 'ARS',
    });
  }
}
