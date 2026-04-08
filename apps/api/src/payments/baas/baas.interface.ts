export interface CreateAccountResult {
  accountId: string;
  cvu: string;
}

export interface TransferResult {
  transactionId: string;
  status: string;
}

export interface GenerateQrResult {
  qrData: string;
  qrImage: string;
}

export interface RequestDebinResult {
  debinId: string;
  status: string;
}

export interface BaasAdapter {
  createAccount(userId: string, orgId: string): Promise<CreateAccountResult>;

  transfer(params: {
    fromCvu: string;
    toCvu: string;
    amount: number;
    reference: string;
  }): Promise<TransferResult>;

  generateQr(params: {
    cvu: string;
    amount: number;
    description: string;
  }): Promise<GenerateQrResult>;

  requestDebin(params: {
    fromCvu: string;
    toCvu: string;
    amount: number;
  }): Promise<RequestDebinResult>;
}
