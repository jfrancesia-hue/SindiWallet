import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClaudeService, ChatContext } from './claude.service';
import { SendMessageDto } from './dto/send-message.dto';
import { DuePaymentStatus, WalletStatus } from '@sindiwallet/db';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly useClaudeApi: boolean;

  constructor(
    private prisma: PrismaService,
    private claude: ClaudeService,
  ) {
    this.useClaudeApi = !!process.env.ANTHROPIC_API_KEY;
    if (this.useClaudeApi) {
      this.logger.log('Claude API habilitada para chatbot');
    } else {
      this.logger.warn('ANTHROPIC_API_KEY no configurada — usando fallback rule-based');
    }
  }

  async sendMessage(orgId: string, userId: string, dto: SendMessageDto) {
    // 1. Obtener o crear sesión
    let sessionId = dto.sessionId;
    if (!sessionId) {
      const session = await this.prisma.chatSession.create({
        data: {
          userId,
          title: dto.message.slice(0, 60),
        },
      });
      sessionId = session.id;
    }

    // 2. Guardar mensaje del usuario
    await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: dto.message,
      },
    });

    // 3. Generar contexto del afiliado para la IA
    const context = await this.buildUserContext(orgId, userId);

    // 4. Generar respuesta con Claude API o fallback
    let response: string;
    if (this.useClaudeApi) {
      const history = await this.prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 20,
        select: { role: true, content: true },
      });
      // Excluir el mensaje recién guardado (último)
      const prevHistory = history.slice(0, -1).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      response = await this.claude.chat(dto.message, context as ChatContext, prevHistory);
    } else {
      response = await this.generateResponse(dto.message, context);
    }

    // 5. Guardar respuesta
    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: response,
        metadata: { context: 'sindiwallet-assistant' },
      },
    });

    return {
      sessionId,
      message: assistantMessage,
    };
  }

  private async buildUserContext(orgId: string, userId: string) {
    const [user, wallet, recentTx, dueStatus, activeLoans] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: userId, orgId },
        select: {
          firstName: true,
          lastName: true,
          role: true,
          memberSince: true,
        },
      }),
      this.prisma.wallet.findFirst({
        where: { userId, orgId },
        select: { balance: true, cvu: true, status: true },
      }),
      this.prisma.transaction.findMany({
        where: { orgId, OR: [{ senderId: userId }, { receiverId: userId }] },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { type: true, amount: true, description: true, createdAt: true },
      }),
      this.prisma.duePayment.findMany({
        where: { userId, due: { orgId }, status: DuePaymentStatus.PENDING },
        include: { due: { select: { name: true, amount: true } } },
        take: 5,
      }),
      this.prisma.loan.findMany({
        where: { userId, orgId, status: 'ACTIVE' },
        select: {
          amount: true,
          outstandingBalance: true,
          monthlyPayment: true,
          nextPaymentDate: true,
        },
      }),
    ]);

    return {
      user: user
        ? `${user.firstName} ${user.lastName}, rol: ${user.role}, afiliado desde: ${user.memberSince?.toISOString().split('T')[0] ?? 'N/A'}`
        : 'Usuario no encontrado',
      wallet: wallet
        ? `Saldo: $${wallet.balance} ARS, CVU: ${wallet.cvu ?? 'sin asignar'}, Estado: ${wallet.status}`
        : 'Sin wallet',
      recentTransactions: recentTx.map(
        (tx) => `${tx.type}: $${tx.amount} - ${tx.description ?? 'sin desc'} (${tx.createdAt.toISOString().split('T')[0]})`,
      ),
      pendingDues: dueStatus.map(
        (d) => `${d.due.name}: $${d.due.amount} (período ${d.period})`,
      ),
      activeLoans: activeLoans.map(
        (l) => `Préstamo $${l.amount}, pendiente $${l.outstandingBalance}, cuota $${l.monthlyPayment}`,
      ),
    };
  }

  private async generateResponse(
    message: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    // En producción: llamar a Claude API con el contexto
    // Por ahora, respuesta inteligente basada en reglas
    const msg = message.toLowerCase();

    if (msg.includes('saldo') || msg.includes('balance')) {
      return `Tu información de wallet: ${context.wallet}. ¿Necesitás hacer alguna operación?`;
    }

    if (msg.includes('cuota') || msg.includes('aporte')) {
      const dues = context.pendingDues as string[];
      if (dues.length === 0) {
        return '¡Estás al día con todas tus cuotas! No tenés pagos pendientes.';
      }
      return `Tenés ${dues.length} cuota(s) pendiente(s):\n${dues.join('\n')}\n\n¿Querés pagar alguna desde tu wallet?`;
    }

    if (msg.includes('préstamo') || msg.includes('prestamo') || msg.includes('crédito')) {
      const loans = context.activeLoans as string[];
      if (loans.length === 0) {
        return 'No tenés préstamos activos. Podés simular uno desde la sección de Préstamos para ver tu monto pre-aprobado.';
      }
      return `Tus préstamos activos:\n${loans.join('\n')}\n\n¿Querés pagar la próxima cuota?`;
    }

    if (msg.includes('transferir') || msg.includes('enviar plata')) {
      return 'Para hacer una transferencia, podés:\n1. Transferencia interna a otro afiliado\n2. Transferencia por CVU a cualquier cuenta\n\n¿A quién querés transferir?';
    }

    if (msg.includes('beneficio')) {
      return 'Podés consultar los beneficios disponibles en la sección de Beneficios. Hay categorías como Educación, Salud, Turismo y más. ¿Querés que te ayude a solicitar alguno?';
    }

    if (msg.includes('ayuda') || msg.includes('help') || msg.includes('qué podés')) {
      return `¡Hola! Soy el asistente virtual de SindiWallet. Puedo ayudarte con:\n\n• Consultar tu saldo y movimientos\n• Estado de cuotas sindicales\n• Información de préstamos\n• Cómo hacer transferencias\n• Beneficios disponibles\n• Estado general de tu cuenta\n\n¿En qué te puedo ayudar?`;
    }

    return `Gracias por tu mensaje. ${context.user}. ¿Puedo ayudarte con algo específico de tu cuenta? Preguntame sobre saldo, cuotas, préstamos o beneficios.`;
  }

  async getSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  async getSessionMessages(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async closeSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }
}
