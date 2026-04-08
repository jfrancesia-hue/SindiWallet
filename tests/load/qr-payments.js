import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { BASE_URL, API_PREFIX, authHeaders, checkResponse } from './config.js';

const MERCHANT_ID = __ENV.MERCHANT_ID || 'test-merchant-id';
const AFFILIATE_ID = __ENV.AFFILIATE_ID || 'test-affiliate-id';

export const options = {
  scenarios: {
    qr_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '30s', target: 20 },
        { duration: '20s', target: 20 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  let qrData;

  group('QR Generate', () => {
    const res = http.post(
      `${BASE_URL}${API_PREFIX}/payments/qr/generate`,
      JSON.stringify({ amount: 100.00, description: 'k6 load test QR' }),
      { headers: authHeaders(MERCHANT_ID) },
    );

    const passed = check(res, checkResponse(res, 200));
    if (passed) {
      const body = JSON.parse(res.body);
      qrData = body.data?.qrData;
    }
  });

  sleep(1);

  if (qrData) {
    group('QR Preview', () => {
      const res = http.post(
        `${BASE_URL}${API_PREFIX}/payments/qr/preview`,
        JSON.stringify({ qrData }),
        { headers: authHeaders(AFFILIATE_ID) },
      );
      check(res, checkResponse(res, 200));
    });

    sleep(0.5);

    group('QR Pay', () => {
      const res = http.post(
        `${BASE_URL}${API_PREFIX}/payments/qr/pay`,
        JSON.stringify({
          qrData,
          amount: 100.00,
          idempotencyKey: `qr-load-${Date.now()}-${randomString(8)}`,
          description: 'k6 QR payment',
        }),
        { headers: authHeaders(AFFILIATE_ID) },
      );
      check(res, checkResponse(res));
    });
  }

  sleep(Math.random() * 2 + 1);
}
