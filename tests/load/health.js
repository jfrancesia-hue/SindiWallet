import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has ok status': (r) => JSON.parse(r.body).status === 'ok',
  });

  const ready = http.get(`${BASE_URL}/health/ready`);
  check(ready, {
    'readiness is 200': (r) => r.status === 200,
    'database connected': (r) => JSON.parse(r.body).database === 'connected',
  });

  sleep(0.5);
}
