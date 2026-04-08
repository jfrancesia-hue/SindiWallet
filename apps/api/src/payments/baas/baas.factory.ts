import { Injectable } from '@nestjs/common';
import { BaasAdapter } from './baas.interface';
import { MockBaasAdapter } from './mock.adapter';
import { BindBaasAdapter } from './bind.adapter';

export const BAAS_ADAPTER = 'BAAS_ADAPTER';

@Injectable()
export class BaasFactory {
  constructor(
    private mockAdapter: MockBaasAdapter,
    private bindAdapter: BindBaasAdapter,
  ) {}

  create(provider?: string): BaasAdapter {
    const resolvedProvider =
      provider ?? process.env.BAAS_PROVIDER ?? 'mock';

    switch (resolvedProvider.toLowerCase()) {
      case 'bind':
        return this.bindAdapter;
      case 'mock':
      default:
        return this.mockAdapter;
    }
  }
}
