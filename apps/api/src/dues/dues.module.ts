import { Module } from '@nestjs/common';
import { DuesController } from './dues.controller';
import { DuesService } from './dues.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [DuesController],
  providers: [DuesService],
  exports: [DuesService],
})
export class DuesModule {}
