import { Module, forwardRef } from '@nestjs/common';
import { BaasFactory } from './baas/baas.factory';
import { MockBaasAdapter } from './baas/mock.adapter';
import { BindBaasAdapter } from './baas/bind.adapter';
import { QrModule } from './qr/qr.module';

@Module({
  imports: [forwardRef(() => QrModule)],
  providers: [BaasFactory, MockBaasAdapter, BindBaasAdapter],
  exports: [BaasFactory, QrModule],
})
export class PaymentsModule {}
