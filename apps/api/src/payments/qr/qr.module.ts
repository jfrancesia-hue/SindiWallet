import { Module, forwardRef } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { TransactionsModule } from '../../transactions/transactions.module';
import { PaymentsModule } from '../payments.module';

@Module({
  imports: [TransactionsModule, forwardRef(() => PaymentsModule)],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
