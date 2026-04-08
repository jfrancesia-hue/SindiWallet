export const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
export const API_PREFIX = '/api/v1';

export function authHeaders(userId) {
  return {
    'Content-Type': 'application/json',
    'x-test-user-id': userId,
  };
}

export function checkResponse(expectedStatus = 200) {
  const checks = {};
  checks[`status is ${expectedStatus}`] = (r) => r.status === expectedStatus;
  if (expectedStatus === 200 || expectedStatus === 201) {
    checks['response is successful'] = (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch {
        return false;
      }
    };
  }
  return checks;
}
