import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionEngineService } from './transaction-engine.service';
import { IdempotencyService } from './idempotency.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionEngineService,
    IdempotencyService,
  ],
  exports: [TransactionsService, TransactionEngineService],
})
export class TransactionsModule {}
