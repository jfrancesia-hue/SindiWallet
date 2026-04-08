import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

export interface ChatContext {
  user: string;
  wallet: string;
  recentTransactions: string[];
  pendingDues: string[];
  activeLoans: string[];
}

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async chat(
    userMessage: string,
    context: ChatContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);

    const messages: Anthropic.MessageParam[] = [
      ...history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: userMessage },
    ];

    try {
      const stream = this.client.messages.stream({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      const finalMessage = await stream.finalMessage();

      const textBlock = finalMessage.content.find(
        (b): b is Anthropic.TextBlock => b.type === 'text',
      );

      return textBlock?.text ?? 'No pude generar una respuesta. Intentá de nuevo.';
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        this.logger.warn('Claude API rate limited');
        return 'Estoy procesando muchas consultas en este momento. Intentá en unos segundos.';
      }
      if (error instanceof Anthropic.AuthenticationError) {
        this.logger.error('Claude API key invalid');
        return 'El asistente no está disponible en este momento. Contactá al administrador.';
      }
      if (error instanceof Anthropic.APIError) {
        this.logger.error(`Claude API error ${error.status}: ${error.message}`);
        return 'Hubo un problema con el asistente. Intentá de nuevo más tarde.';
      }
      throw error;
    }
  }

  private buildSystemPrompt(context: ChatContext): string {
    return `Sos el asistente virtual de SindiWallet, la billetera digital del sindicato. Respondé siempre en español rioplatense (vos, tenés, etc.). Sé amable, conciso y útil.

CONTEXTO DEL AFILIADO:
- ${context.user}
- Wallet: ${context.wallet}
- Últimas transacciones: ${context.recentTransactions.length > 0 ? context.recentTransactions.join(' | ') : 'Sin movimientos recientes'}
- Cuotas pendientes: ${context.pendingDues.length > 0 ? context.pendingDues.join(' | ') : 'Al día con todas las cuotas'}
- Préstamos activos: ${context.activeLoans.length > 0 ? context.activeLoans.join(' | ') : 'Sin préstamos activos'}

CAPACIDADES QUE PODÉS INFORMAR:
- Consultar saldo y movimientos
- Estado de cuotas sindicales (pago y retención)
- Información de préstamos (simulación, cuotas pendientes)
- Transferencias internas y por CVU
- Pagos QR con descuento afiliado en comercios adheridos
- Beneficios disponibles (solicitud y estado)
- Notificaciones

REGLAS:
- Nunca inventés datos. Usá solo el contexto proporcionado.
- Si no tenés la información, decile al afiliado que consulte en la sección correspondiente de la app.
- No ejecutés operaciones financieras directamente. Guiá al usuario a la sección correcta.
- Respuestas cortas y directas. Máximo 3 párrafos.`;
  }
}
