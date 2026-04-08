import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { BASE_URL, API_PREFIX, authHeaders, checkResponse } from './config.js';

const AFFILIATE_ID = __ENV.AFFILIATE_ID || 'test-affiliate-id';

export const options = {
  scenarios: {
    loan_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '30s', target: 15 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  group('Simulate Loan', () => {
    const res = http.post(
      `${BASE_URL}${API_PREFIX}/loans/simulate`,
      JSON.stringify({ amount: 50000, termMonths: 12 }),
      { headers: authHeaders(AFFILIATE_ID) },
    );
    check(res, checkResponse(200));
  });

  sleep(1);

  group('Request Loan', () => {
    const res = http.post(
      `${BASE_URL}${API_PREFIX}/loans/request`,
      JSON.stringify({
        amount: 10000,
        termMonths: 6,
        idempotencyKey: `loan-load-${Date.now()}-${randomString(8)}`,
      }),
      { headers: authHeaders(AFFILIATE_ID) },
    );
    // May return 201 or 400 if scoring fails
    check(res, { 'loan request responded': (r) => r.status < 500 });
  });

  sleep(Math.random() * 3 + 1);
}
