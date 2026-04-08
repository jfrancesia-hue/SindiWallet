import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App | null = null;

  onModuleInit() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      console.warn('Firebase credentials not configured — push notifications disabled');
      return;
    }

    this.app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
    });
  }

  get isEnabled(): boolean {
    return this.app !== null;
  }

  async sendToDevice(
    token: string,
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<string | null> {
    if (!this.app) return null;

    try {
      const response = await this.app.messaging().send({
        token,
        notification,
        data,
        android: {
          priority: 'high',
          notification: { channelId: 'sindiwallet_default' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      });
      return response;
    } catch (error: any) {
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return null;
      }
      console.error('Firebase push error:', error.message);
      return null;
    }
  }

  async sendToMultiple(
    tokens: string[],
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
    if (!this.app || tokens.length === 0) {
      return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification,
      data,
      android: {
        priority: 'high',
        notification: { channelId: 'sindiwallet_default' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };

    try {
      const response = await this.app.messaging().sendEachForMulticast(message);
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && tokens[idx]) failedTokens.push(tokens[idx]);
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    } catch (error: any) {
      console.error('Firebase multicast error:', error.message);
      return { successCount: 0, failureCount: tokens.length, failedTokens: tokens };
    }
  }
}
