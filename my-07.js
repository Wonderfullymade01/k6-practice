import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    readers: {
      executor: 'constant-vus',
      vus: 2,
      duration: '15s',
      exec: 'read',
    },

    commenters: {
      executor: 'constant-arrival-rate',
      rate: 1,
      timeUnit: '1s',
      duration: '10s',
      startTime: '5s',
      preAllocatedVUs: 2,
      maxVUs: 4,
      exec: 'comment',
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<1000'],
    'http_req_failed{scenario:commenters}': ['rate<0.01'],
  },
};

export function read() {
  const res = http.get('https://httpbin.org/get');

  check(res, {
    'read: status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

// What a BUYER does: send an order.
// No sleep here: with an arrival-rate executor, k6 decides when
// each purchase starts.
export function comment() {
  const order = {
    item: 'book',
    quantity: 1,
  };

  const res = http.post(
    'https://httpbin.org/post',
    JSON.stringify(order),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(res, {
    'comment: status is 200': (r) => r.status === 200,
  });
}