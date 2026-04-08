export const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
export const API_PREFIX = '/api/v1';

export function authHeaders(userId) {
  return {
    'Content-Type': 'application/json',
    'x-test-user-id': userId,
  };
}

export function checkResponse(res, expectedStatus = 200) {
  const checks = {};
  checks[`status is ${expectedStatus}`] = res.status === expectedStatus;
  if (expectedStatus === 200 || expectedStatus === 201) {
    try {
      const body = JSON.parse(res.body);
      checks['response is successful'] = body.success === true;
    } catch {
      checks['response is valid JSON'] = false;
    }
  }
  return checks;
}
