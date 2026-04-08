import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { BASE_URL, API_PREFIX, authHeaders, checkResponse } from './config.js';

// These IDs must be pre-seeded in the test DB
const SENDER_ID = __ENV.SENDER_ID || 'test-sender-id';
const RECEIVER_WALLET_ID = __ENV.RECEIVER_WALLET_ID || 'test-receiver-wallet-id';

export const options = {
  scenarios: {
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 10 },
        { duration: '30s', target: 25 },
        { duration: '15s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    'checks': ['rate>0.95'],
  },
};

export default function () {
  const idempotencyKey = `load-test-${Date.now()}-${randomString(8)}`;

  const payload = JSON.stringify({
    walletToId: RECEIVER_WALLET_ID,
    amount: 1.00,
    description: 'k6 load test transfer',
    idempotencyKey,
  });

  const res = http.post(
    `${BASE_URL}${API_PREFIX}/transactions/transfer`,
    payload,
    { headers: authHeaders(SENDER_ID) },
  );

  check(res, checkResponse(res, 200));
  sleep(Math.random() * 2 + 0.5);
}
