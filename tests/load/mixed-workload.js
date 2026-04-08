import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomString, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { BASE_URL, API_PREFIX, authHeaders, checkResponse } from './config.js';

const USERS = (__ENV.USER_IDS || 'user1,user2,user3').split(',');
const RECEIVER_WALLET = __ENV.RECEIVER_WALLET_ID || 'test-receiver-wallet-id';

export const options = {
  scenarios: {
    mixed: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.05'],
    'checks': ['rate>0.90'],
  },
};

export default function () {
  const userId = randomItem(USERS);
  const headers = authHeaders(userId);
  const action = Math.random();

  if (action < 0.30) {
    // 30% — Check wallet balance
    group('Get Wallet', () => {
      const res = http.get(`${BASE_URL}${API_PREFIX}/wallets/me`, { headers });
      check(res, checkResponse(res));
    });
  } else if (action < 0.50) {
    // 20% — List transactions
    group('List Transactions', () => {
      const res = http.get(`${BASE_URL}${API_PREFIX}/transactions?page=1&limit=10`, { headers });
      check(res, checkResponse(res));
    });
  } else if (action < 0.65) {
    // 15% — Transfer
    group('Transfer', () => {
      const res = http.post(
        `${BASE_URL}${API_PREFIX}/transactions/transfer`,
        JSON.stringify({
          walletToId: RECEIVER_WALLET,
          amount: 1.00,
          idempotencyKey: `mixed-${Date.now()}-${randomString(8)}`,
        }),
        { headers },
      );
      check(res, { 'transfer responded': (r) => r.status < 500 });
    });
  } else if (action < 0.75) {
    // 10% — Loan simulation
    group('Simulate Loan', () => {
      const res = http.post(
        `${BASE_URL}${API_PREFIX}/loans/simulate`,
        JSON.stringify({ amount: 50000, termMonths: 12 }),
        { headers },
      );
      check(res, checkResponse(res));
    });
  } else if (action < 0.85) {
    // 10% — Notifications
    group('Get Notifications', () => {
      const res = http.get(`${BASE_URL}${API_PREFIX}/notifications/my?limit=10`, { headers });
      check(res, checkResponse(res));
    });
  } else if (action < 0.95) {
    // 10% — Dues history
    group('Dues History', () => {
      const res = http.get(`${BASE_URL}${API_PREFIX}/dues/my/history`, { headers });
      check(res, checkResponse(res));
    });
  } else {
    // 5% — Health check
    group('Health', () => {
      const res = http.get(`${BASE_URL}/health`);
      check(res, { 'health ok': (r) => r.status === 200 });
    });
  }

  sleep(Math.random() * 2 + 0.5);
}
