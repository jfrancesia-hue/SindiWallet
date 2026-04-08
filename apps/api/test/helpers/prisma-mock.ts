import { PrismaService } from '../../src/prisma/prisma.service';

export type MockPrismaService = {
  [K in keyof PrismaService]: jest.Mock;
} & {
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
  wallet: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
    aggregate: jest.Mock;
  };
  user: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  transaction: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    count: jest.Mock;
    aggregate: jest.Mock;
  };
  duePayment: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    upsert: jest.Mock;
    count: jest.Mock;
  };
  due: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
  };
  loan: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  loanInstallment: {
    update: jest.Mock;
    count: jest.Mock;
  };
  benefit: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
  };
  benefitRequest: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  merchant: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  notification: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    createMany: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    count: jest.Mock;
  };
  chatSession: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  chatMessage: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
};

export function createMockPrisma(): MockPrismaService {
  const createModelMock = () => ({
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  });

  return {
    $transaction: jest.fn((fn) => (typeof fn === 'function' ? fn({}) : Promise.resolve(fn))),
    $queryRaw: jest.fn(),
    wallet: createModelMock(),
    user: createModelMock(),
    transaction: createModelMock(),
    duePayment: createModelMock(),
    due: createModelMock(),
    loan: createModelMock(),
    loanInstallment: createModelMock(),
    benefit: createModelMock(),
    benefitRequest: createModelMock(),
    merchant: createModelMock(),
    notification: createModelMock(),
    chatSession: createModelMock(),
    chatMessage: createModelMock(),
  } as unknown as MockPrismaService;
}
