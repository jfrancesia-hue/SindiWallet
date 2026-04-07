export type LoanStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'PAID_OFF'
  | 'DEFAULTED'
  | 'CANCELLED';

export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED';

export interface Loan {
  id: string;
  orgId: string;
  userId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  outstandingBalance: number;
  status: LoanStatus;
  scoringResult: ScoringResult | null;
  disbursedAt: string | null;
  nextPaymentDate: string | null;
  createdAt: string;
}

export interface LoanInstallment {
  id: string;
  loanId: string;
  number: number;
  amount: number;
  principal: number;
  interest: number;
  dueDate: string;
  paidAt: string | null;
  status: InstallmentStatus;
}

export interface ScoringResult {
  score: number;
  maxScore: number;
  approved: boolean;
  factors: {
    seniority: number;
    duesCompliance: number;
    salaryRatio: number;
    loanHistory: number;
  };
  maxLoanAmount: number;
}

export interface LoanSimulation {
  amount: number;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  installments: {
    number: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}
