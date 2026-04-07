import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Crea un usuario en Supabase Auth (server-side con service role key)
   */
  async createUser(email: string, password: string) {
    const { data, error } = await this.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;
    return data.user;
  }

  /**
   * Login con email y password, retorna session con tokens
   */
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Refresca un access token usando el refresh token
   */
  async refreshSession(refreshToken: string) {
    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Obtiene usuario desde un JWT
   */
  async getUser(token: string) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }

  /**
   * Envía email de reset de password
   */
  async resetPasswordForEmail(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.WEB_ADMIN_URL}/auth/reset-password`,
    });

    if (error) throw error;
  }

  /**
   * Actualiza password con token
   */
  async updateUserPassword(userId: string, password: string) {
    const { error } = await this.client.auth.admin.updateUserById(userId, {
      password,
    });

    if (error) throw error;
  }

  /**
   * Elimina un usuario de Supabase Auth
   */
  async deleteUser(userId: string) {
    const { error } = await this.client.auth.admin.deleteUser(userId);
    if (error) throw error;
  }

  /**
   * Enrolla MFA (TOTP) para un usuario
   */
  async enrollMfa(accessToken: string) {
    const userClient = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
    );

    const { data, error } = await userClient.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'SindiWallet App',
    });

    if (error) throw error;
    return data;
  }

  /**
   * Verifica un código MFA TOTP
   */
  async verifyMfa(accessToken: string, factorId: string, code: string) {
    const userClient = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
    );

    const challenge = await userClient.auth.mfa.challenge({ factorId });
    if (challenge.error) throw challenge.error;

    const { data, error } = await userClient.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });

    if (error) throw error;
    return data;
  }
}
