import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomCvu(): string {
  const prefix = '0000003';
  const random = Array.from({ length: 15 }, () =>
    Math.floor(Math.random() * 10),
  ).join('');
  return prefix + random;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ====================== ORGANIZACIÓN ======================
  const org = await prisma.organization.upsert({
    where: { slug: 'ate-catamarca' },
    update: {},
    create: {
      name: 'ATE Catamarca',
      slug: 'ate-catamarca',
      cuit: '30-12345678-9',
      email: 'contacto@atecatamarca.org.ar',
      phone: '+54 383 4123456',
      address: 'San Martín 123, San Fernando del Valle de Catamarca',
      website: 'https://atecatamarca.org.ar',
      primaryColor: '#1F2B6C',
      secondaryColor: '#00A89D',
      accentColor: '#F58220',
      settings: {
        maxLoanMultiplier: 3,
        loanInterestRate: 0.035,
        loanMaxTermMonths: 24,
        scoringMinScore: 60,
        baasProvider: 'mock',
        whitelabelEnabled: true,
      },
    },
  });
  console.log(`  ✅ Organización: ${org.name}`);

  // ====================== SUPERADMIN ======================
  const superadmin = await prisma.user.upsert({
    where: { supabaseUserId: 'seed-superadmin-001' },
    update: {},
    create: {
      orgId: org.id,
      supabaseUserId: 'seed-superadmin-001',
      email: 'admin@sindiwallet.com',
      firstName: 'Admin',
      lastName: 'SindiWallet',
      dni: '12345678',
      role: 'SUPERADMIN',
      kycStatus: 'APPROVED',
      isActive: true,
    },
  });
  console.log(`  ✅ Superadmin: ${superadmin.email}`);

  // ====================== ADMIN SINDICAL ======================
  const admin = await prisma.user.upsert({
    where: { supabaseUserId: 'seed-admin-001' },
    update: {},
    create: {
      orgId: org.id,
      supabaseUserId: 'seed-admin-001',
      email: 'secretario@atecatamarca.org.ar',
      firstName: 'Carlos',
      lastName: 'Gómez',
      dni: '23456789',
      cuit: '20-23456789-5',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      isActive: true,
      memberSince: new Date('2015-03-01'),
      salary: 650000,
    },
  });
  console.log(`  ✅ Admin sindical: ${admin.email}`);

  // Wallet del admin (receptor de cuotas)
  const adminWallet = await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      orgId: org.id,
      userId: admin.id,
      cvu: randomCvu(),
      balance: 2500000,
      currency: 'ARS',
      status: 'ACTIVE',
    },
  });

  // ====================== AFILIADOS ======================
  const affiliatesData = [
    {
      supabaseUserId: 'seed-affiliate-001',
      email: 'maria.lopez@gmail.com',
      firstName: 'María',
      lastName: 'López',
      dni: '34567890',
      cuit: '27-34567890-3',
      salary: 450000,
      employerName: 'Gobierno de Catamarca',
      employerCuit: '30-99999999-0',
      memberSince: new Date('2018-06-15'),
      balance: 247850,
    },
    {
      supabaseUserId: 'seed-affiliate-002',
      email: 'juan.perez@gmail.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '34567891',
      cuit: '20-34567891-7',
      salary: 380000,
      employerName: 'Gobierno de Catamarca',
      employerCuit: '30-99999999-0',
      memberSince: new Date('2020-01-10'),
      balance: 185200,
    },
    {
      supabaseUserId: 'seed-affiliate-003',
      email: 'ana.rodriguez@gmail.com',
      firstName: 'Ana',
      lastName: 'Rodríguez',
      dni: '34567892',
      cuit: '27-34567892-9',
      salary: 520000,
      employerName: 'Municipalidad de Catamarca',
      employerCuit: '30-88888888-0',
      memberSince: new Date('2016-09-01'),
      balance: 312400,
    },
    {
      supabaseUserId: 'seed-affiliate-004',
      email: 'laura.fernandez@gmail.com',
      firstName: 'Laura',
      lastName: 'Fernández',
      dni: '34567893',
      cuit: '27-34567893-7',
      salary: 410000,
      employerName: 'Hospital Central',
      employerCuit: '30-77777777-0',
      memberSince: new Date('2021-03-20'),
      balance: 95600,
    },
    {
      supabaseUserId: 'seed-affiliate-005',
      email: 'roberto.diaz@gmail.com',
      firstName: 'Roberto',
      lastName: 'Díaz',
      dni: '34567894',
      cuit: '20-34567894-1',
      salary: 490000,
      employerName: 'Gobierno de Catamarca',
      employerCuit: '30-99999999-0',
      memberSince: new Date('2019-08-01'),
      balance: 178300,
    },
  ];

  const affiliates: Array<{ id: string; walletId: string; firstName: string; lastName: string }> = [];

  for (const data of affiliatesData) {
    const { balance, ...userData } = data;
    const affiliate = await prisma.user.upsert({
      where: { supabaseUserId: data.supabaseUserId },
      update: {},
      create: {
        orgId: org.id,
        ...userData,
        role: 'AFFILIATE',
        kycStatus: 'APPROVED',
        isActive: true,
      },
    });

    const wallet = await prisma.wallet.upsert({
      where: { userId: affiliate.id },
      update: {},
      create: {
        orgId: org.id,
        userId: affiliate.id,
        cvu: randomCvu(),
        balance,
        currency: 'ARS',
        status: 'ACTIVE',
      },
    });

    affiliates.push({
      id: affiliate.id,
      walletId: wallet.id,
      firstName: affiliate.firstName,
      lastName: affiliate.lastName,
    });

    console.log(`  ✅ Afiliado: ${affiliate.firstName} ${affiliate.lastName} — $${balance}`);
  }

  // ====================== COMERCIOS ======================
  const merchantsData = [
    {
      supabaseUserId: 'seed-merchant-001',
      email: 'farmacia@farmaplus.com',
      firstName: 'Roberto',
      lastName: 'Martínez',
      dni: '45678901',
      businessName: 'Farmacia FarmaPlus',
      cuit: '30-45678901-5',
      category: 'Farmacia',
      address: 'Av. Güemes 456, Catamarca',
      discountPercent: 15,
    },
    {
      supabaseUserId: 'seed-merchant-002',
      email: 'optica@mirada.com',
      firstName: 'Silvia',
      lastName: 'Castro',
      dni: '45678902',
      businessName: 'Óptica Mirada',
      cuit: '27-45678902-3',
      category: 'Salud',
      address: 'Sarmiento 789, Catamarca',
      discountPercent: 10,
    },
    {
      supabaseUserId: 'seed-merchant-003',
      email: 'libreria@papelera.com',
      firstName: 'Héctor',
      lastName: 'Vega',
      dni: '45678903',
      businessName: 'Librería La Papelera',
      cuit: '20-45678903-8',
      category: 'Educación',
      address: 'Rivadavia 321, Catamarca',
      discountPercent: 20,
    },
  ];

  for (const data of merchantsData) {
    const { businessName, cuit, category, address, discountPercent, ...userData } = data;
    const merchantUser = await prisma.user.upsert({
      where: { supabaseUserId: userData.supabaseUserId },
      update: {},
      create: {
        orgId: org.id,
        ...userData,
        role: 'MERCHANT',
        kycStatus: 'APPROVED',
        isActive: true,
      },
    });

    const merchantWallet = await prisma.wallet.upsert({
      where: { userId: merchantUser.id },
      update: {},
      create: {
        orgId: org.id,
        userId: merchantUser.id,
        cvu: randomCvu(),
        balance: Math.floor(Math.random() * 500000) + 100000,
        currency: 'ARS',
        status: 'ACTIVE',
      },
    });

    await prisma.merchant.upsert({
      where: { userId: merchantUser.id },
      update: {},
      create: {
        orgId: org.id,
        userId: merchantUser.id,
        businessName,
        cuit,
        category,
        address,
        discountPercent,
        isActive: true,
        settlementFrequency: 'WEEKLY',
        qrCode: `QR_${merchantUser.id}`,
      },
    });

    console.log(`  ✅ Comercio: ${businessName} (${discountPercent}% dto)`);
  }

  // ====================== CUOTAS SINDICALES ======================
  const due = await prisma.due.upsert({
    where: { id: 'seed-due-001' },
    update: {},
    create: {
      id: 'seed-due-001',
      orgId: org.id,
      name: 'Cuota Sindical Ordinaria',
      description: 'Cuota mensual obligatoria Art. 38 Ley 23.551',
      amount: 5500,
      percentOfSalary: 0.03,
      frequency: 'MONTHLY',
      isActive: true,
      isRetention: true,
    },
  });

  const dueExtra = await prisma.due.upsert({
    where: { id: 'seed-due-002' },
    update: {},
    create: {
      id: 'seed-due-002',
      orgId: org.id,
      name: 'Fondo Solidario',
      description: 'Aporte al fondo solidario del sindicato',
      amount: 2000,
      frequency: 'MONTHLY',
      isActive: true,
      isRetention: false,
    },
  });

  console.log(`  ✅ Cuotas: ${due.name}, ${dueExtra.name}`);

  // Crear pagos de cuotas para los últimos 12 meses
  const now = new Date();
  for (const aff of affiliates) {
    for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - monthsAgo);
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Cuota ordinaria — 90% pagadas
      const paid = Math.random() < 0.9;
      await prisma.duePayment.upsert({
        where: { dueId_userId_period: { dueId: due.id, userId: aff.id, period } },
        update: {},
        create: {
          dueId: due.id,
          userId: aff.id,
          period,
          amount: 5500,
          status: paid ? 'PAID' : (monthsAgo < 2 ? 'PENDING' : 'OVERDUE'),
          paidAt: paid ? new Date(d.getFullYear(), d.getMonth(), 10 + Math.floor(Math.random() * 10)) : undefined,
          source: paid ? 'RETENTION' : 'WALLET',
          retentionRef: paid ? `RET_${period}_${aff.id.slice(-4)}` : undefined,
        },
      });
    }
  }
  console.log(`  ✅ Pagos de cuotas: ${affiliates.length * 12} registros`);

  // ====================== BENEFICIOS ======================
  const benefits = await Promise.all([
    prisma.benefit.create({
      data: {
        orgId: org.id,
        name: 'Subsidio por Nacimiento',
        description: 'Prestación por nacimiento de hijo/a',
        category: 'Familia',
        amount: 80000,
        maxAmount: 80000,
        requiresApproval: true,
        isActive: true,
      },
    }),
    prisma.benefit.create({
      data: {
        orgId: org.id,
        name: 'Ayuda Escolar',
        description: 'Prestación anual para útiles y guardapolvo',
        category: 'Educación',
        amount: 45000,
        maxAmount: 45000,
        requiresApproval: false,
        isActive: true,
      },
    }),
    prisma.benefit.create({
      data: {
        orgId: org.id,
        name: 'Subsidio por Fallecimiento',
        description: 'Prestación por fallecimiento de familiar directo',
        category: 'Emergencia',
        amount: 150000,
        maxAmount: 150000,
        requiresApproval: true,
        isActive: true,
      },
    }),
    prisma.benefit.create({
      data: {
        orgId: org.id,
        name: 'Descuento Turismo',
        description: 'Descuento en hospedaje del hotel sindical',
        category: 'Turismo',
        amount: 35000,
        maxAmount: 70000,
        requiresApproval: true,
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✅ Beneficios: ${benefits.length} tipos`);

  // Solicitudes de beneficios
  await prisma.benefitRequest.create({
    data: {
      orgId: org.id,
      benefitId: benefits[0].id,
      userId: affiliates[0].id,
      amount: 80000,
      status: 'DISBURSED',
      reviewedAt: new Date('2026-02-15'),
      reviewedBy: admin.id,
      notes: 'Nacimiento de hija',
    },
  });
  await prisma.benefitRequest.create({
    data: {
      orgId: org.id,
      benefitId: benefits[3].id,
      userId: affiliates[2].id,
      amount: 35000,
      status: 'PENDING',
      notes: 'Vacaciones familiares semana santa',
    },
  });
  await prisma.benefitRequest.create({
    data: {
      orgId: org.id,
      benefitId: benefits[1].id,
      userId: affiliates[1].id,
      amount: 45000,
      status: 'APPROVED',
      reviewedAt: new Date('2026-03-20'),
      reviewedBy: admin.id,
    },
  });
  console.log(`  ✅ Solicitudes de beneficios: 3`);

  // ====================== TRANSACCIONES ======================
  const txTypes = [
    'TRANSFER_INTERNAL', 'PAYMENT_QR', 'DUE_PAYMENT', 'DEPOSIT',
    'PAYMENT_MERCHANT', 'BENEFIT_CREDIT',
  ] as const;

  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const txDate = new Date(now);
    txDate.setDate(txDate.getDate() - daysAgo);

    const senderIdx = Math.floor(Math.random() * affiliates.length);
    const receiverIdx = (senderIdx + 1 + Math.floor(Math.random() * (affiliates.length - 1))) % affiliates.length;
    const type = txTypes[Math.floor(Math.random() * txTypes.length)];
    const amount = Math.floor(Math.random() * 50000) + 500;

    await prisma.transaction.create({
      data: {
        orgId: org.id,
        idempotencyKey: `seed-tx-${i}-${Date.now()}`,
        type,
        status: 'COMPLETED',
        amount,
        fee: 0,
        currency: 'ARS',
        description: type === 'TRANSFER_INTERNAL' ? `Transferencia a ${affiliates[receiverIdx].firstName}`
          : type === 'PAYMENT_QR' ? 'Pago QR en comercio'
          : type === 'DUE_PAYMENT' ? 'Cuota Sindical Ordinaria'
          : type === 'DEPOSIT' ? 'Depósito desde cuenta bancaria'
          : type === 'PAYMENT_MERCHANT' ? 'Compra en comercio adherido'
          : 'Crédito por beneficio',
        senderId: type !== 'DEPOSIT' && type !== 'BENEFIT_CREDIT' ? affiliates[senderIdx].id : undefined,
        receiverId: type === 'DEPOSIT' || type === 'BENEFIT_CREDIT' ? affiliates[senderIdx].id : affiliates[receiverIdx].id,
        walletFromId: type !== 'DEPOSIT' && type !== 'BENEFIT_CREDIT' ? affiliates[senderIdx].walletId : undefined,
        walletToId: type === 'DEPOSIT' || type === 'BENEFIT_CREDIT' ? affiliates[senderIdx].walletId : affiliates[receiverIdx].walletId,
        processedAt: txDate,
        createdAt: txDate,
      },
    });
  }
  console.log(`  ✅ Transacciones: 30 históricas`);

  // ====================== PRÉSTAMOS ======================
  // Préstamo activo para María
  const loan1 = await prisma.loan.create({
    data: {
      orgId: org.id,
      userId: affiliates[0].id,
      amount: 200000,
      interestRate: 0.60,
      termMonths: 12,
      monthlyPayment: 19549,
      totalAmount: 234588,
      outstandingBalance: 156470,
      status: 'ACTIVE',
      disbursedAt: new Date('2026-01-15'),
      nextPaymentDate: new Date('2026-05-15'),
      scoringResult: { score: 82, grade: 'A', approved: true },
      installments: {
        create: Array.from({ length: 12 }, (_, i) => {
          const dueDate = new Date('2026-02-15');
          dueDate.setMonth(dueDate.getMonth() + i);
          return {
            number: i + 1,
            amount: 19549,
            principal: 16667 - i * 200,
            interest: 2882 + i * 200,
            dueDate,
            status: i < 3 ? 'PAID' as const : 'PENDING' as const,
            paidAt: i < 3 ? new Date(dueDate.getFullYear(), dueDate.getMonth(), 14) : undefined,
          };
        }),
      },
    },
  });
  console.log(`  ✅ Préstamo activo: María López — $200.000`);

  // Préstamo pagado para Ana
  await prisma.loan.create({
    data: {
      orgId: org.id,
      userId: affiliates[2].id,
      amount: 100000,
      interestRate: 0.50,
      termMonths: 6,
      monthlyPayment: 18265,
      totalAmount: 109590,
      outstandingBalance: 0,
      status: 'PAID_OFF',
      disbursedAt: new Date('2025-06-01'),
      scoringResult: { score: 78, grade: 'B', approved: true },
      installments: {
        create: Array.from({ length: 6 }, (_, i) => {
          const dueDate = new Date('2025-07-01');
          dueDate.setMonth(dueDate.getMonth() + i);
          return {
            number: i + 1,
            amount: 18265,
            principal: 16667,
            interest: 1598,
            dueDate,
            status: 'PAID' as const,
            paidAt: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
          };
        }),
      },
    },
  });
  console.log(`  ✅ Préstamo pagado: Ana Rodríguez — $100.000`);

  // ====================== NOTIFICACIONES ======================
  const notifData = [
    { userId: affiliates[0].id, title: 'Cuota pagada', body: 'Tu cuota sindical de marzo fue debitada correctamente. Monto: $5.500', channel: 'IN_APP' as const },
    { userId: affiliates[0].id, title: 'Préstamo: próxima cuota', body: 'Tu cuota #4 de $19.549 vence el 15/05/2026', channel: 'PUSH' as const },
    { userId: affiliates[1].id, title: 'Transferencia recibida', body: 'María López te transfirió $15.000', channel: 'IN_APP' as const },
    { userId: affiliates[2].id, title: 'Beneficio aprobado', body: 'Tu solicitud de Descuento Turismo fue aprobada por $35.000', channel: 'IN_APP' as const },
    { userId: affiliates[0].id, title: 'Nuevo beneficio disponible', body: 'Se habilitó el beneficio "Descuento Turismo". Consultá las condiciones.', channel: 'IN_APP' as const },
    { userId: affiliates[3].id, title: 'Bienvenida a SindiWallet', body: '¡Hola Laura! Tu wallet ya está activa. Empezá a operar.', channel: 'EMAIL' as const },
  ];

  for (const n of notifData) {
    await prisma.notification.create({
      data: {
        orgId: org.id,
        ...n,
        sentAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        isRead: Math.random() < 0.4,
      },
    });
  }
  console.log(`  ✅ Notificaciones: ${notifData.length}`);

  // ====================== AUDIT LOG ======================
  const auditActions = [
    { action: 'POST create', entity: 'User', userId: admin.id },
    { action: 'POST create', entity: 'Due', userId: admin.id },
    { action: 'POST transfer', entity: 'Transaction', userId: affiliates[0].id },
    { action: 'PATCH updateKyc', entity: 'User', userId: admin.id },
    { action: 'POST request', entity: 'Loan', userId: affiliates[0].id },
    { action: 'POST disburse', entity: 'Loan', userId: admin.id },
    { action: 'POST review', entity: 'BenefitRequest', userId: admin.id },
  ];

  for (const a of auditActions) {
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        ...a,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      },
    });
  }
  console.log(`  ✅ Audit logs: ${auditActions.length}`);

  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
