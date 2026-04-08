import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { ScoringService } from './scoring.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [LoansController],
  providers: [LoansService, ScoringService],
  exports: [LoansService],
})
export class LoansModule {}
