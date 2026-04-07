import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear organización demo: ATE Catamarca
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
        baasProvider: 'bind',
        whitelabelEnabled: true,
      },
    },
  });

  console.log(`  ✅ Organización: ${org.name} (${org.id})`);

  // Crear superadmin
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

  // Crear admin sindical
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
    },
  });

  console.log(`  ✅ Admin sindical: ${admin.email}`);

  // Crear afiliados de ejemplo
  const affiliates = [
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
    },
  ];

  for (const data of affiliates) {
    const affiliate = await prisma.user.upsert({
      where: { supabaseUserId: data.supabaseUserId },
      update: {},
      create: {
        orgId: org.id,
        ...data,
        role: 'AFFILIATE',
        kycStatus: 'APPROVED',
        isActive: true,
      },
    });

    // Crear wallet para cada afiliado
    await prisma.wallet.upsert({
      where: { userId: affiliate.id },
      update: {},
      create: {
        orgId: org.id,
        userId: affiliate.id,
        balance: 0,
        currency: 'ARS',
        status: 'ACTIVE',
      },
    });

    console.log(`  ✅ Afiliado: ${affiliate.firstName} ${affiliate.lastName} + wallet`);
  }

  // Crear comercio de ejemplo
  const merchantUser = await prisma.user.upsert({
    where: { supabaseUserId: 'seed-merchant-001' },
    update: {},
    create: {
      orgId: org.id,
      supabaseUserId: 'seed-merchant-001',
      email: 'farmacia@farmaplus.com',
      firstName: 'Roberto',
      lastName: 'Martínez',
      dni: '45678901',
      role: 'MERCHANT',
      kycStatus: 'APPROVED',
      isActive: true,
    },
  });

  await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      orgId: org.id,
      userId: merchantUser.id,
      businessName: 'Farmacia FarmaPlus',
      cuit: '30-45678901-5',
      category: 'farmacia',
      address: 'Av. Güemes 456, Catamarca',
      phone: '+54 383 4234567',
      discountPercent: 15,
      isActive: true,
      settlementFrequency: 'WEEKLY',
    },
  });

  console.log(`  ✅ Comercio: Farmacia FarmaPlus`);

  // Crear cuota sindical
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

  console.log(`  ✅ Cuota sindical: ${due.name}`);

  // Crear beneficios
  const benefits = [
    {
      name: 'Subsidio por Nacimiento',
      description: 'Prestación por nacimiento de hijo/a',
      category: 'familia',
      amount: 80000,
      maxAmount: 80000,
      requiresApproval: true,
    },
    {
      name: 'Ayuda Escolar',
      description: 'Prestación anual para útiles y guardapolvo',
      category: 'educacion',
      amount: 45000,
      maxAmount: 45000,
      requiresApproval: false,
    },
    {
      name: 'Subsidio por Fallecimiento Familiar',
      description: 'Prestación por fallecimiento de familiar directo',
      category: 'emergencia',
      amount: 150000,
      maxAmount: 150000,
      requiresApproval: true,
    },
  ];

  for (const data of benefits) {
    const benefit = await prisma.benefit.create({
      data: {
        orgId: org.id,
        ...data,
        isActive: true,
      },
    });
    console.log(`  ✅ Beneficio: ${benefit.name}`);
  }

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
