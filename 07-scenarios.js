// =====================================================================
// LESSON 7: SCENARIOS & EXECUTORS
// Run me with:   k6 run 07-scenarios.js
// =====================================================================
// So far, every user in a test did the SAME thing.
// On a real shop website, different people do different things AT THE
// SAME TIME:
//   - most people just BROWSE (look at pages)
//   - a few people BUY something (send an order)
//
// A SCENARIO is one group of users with its own job and its own
// traffic pattern. You can run several scenarios in one test.
//
// An EXECUTOR is HOW a scenario sends its traffic. There are two
// main ways of thinking:
//
//   1. "Keep N users busy"        -> e.g. 'constant-vus'
//      Like a shop with exactly 3 customers inside at all times.
//      If the shop gets slow, customers take longer, so FEWER
//      purchases happen per minute.
//
//   2. "Start N actions per second" -> e.g. 'constant-arrival-rate'
//      Like a door where 2 new customers walk in EVERY second, no
//      matter how busy the shop already is. If the shop gets slow,
//      people pile up inside. This is how real internet traffic works:
//      new visitors don't wait for old ones to finish.
// =====================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  // -------------------------------------------------------------------
  // SCENARIOS replace "vus/duration" and "stages".
  // Each scenario has a name you choose (here: browsers and buyers).
  // -------------------------------------------------------------------
  scenarios: {

    // SCENARIO 1: people browsing the website
    browsers: {
      executor: 'constant-vus', // keep a fixed number of users busy
      vus: 3,                   // 3 users at all times
      duration: '20s',          // for 20 seconds
      exec: 'browse',           // which function these users run (see below)
    },

    // SCENARIO 2: people buying something
    buyers: {
      executor: 'constant-arrival-rate', // start a fixed number of actions per second
      rate: 2,                  // 2 new purchases...
      timeUnit: '1s',           // ...every 1 second
      duration: '10s',          // for 10 seconds
      preAllocatedVUs: 3,       // k6 gets 3 users ready in advance...
      maxVUs: 6,                // ...and may add up to 6 if they're too slow
      startTime: '5s',          // wait 5 seconds after the test starts
      exec: 'buy',              // these users run the "buy" function
    },
  },

  thresholds: {
    // A rule for ALL requests, like in Lesson 5.
    http_req_duration: ['p(95)<1000'],

    // A rule for ONE scenario only. The part in { } is a filter:
    // "only look at requests from the buyers scenario".
    // Buying is important, so we give it a stricter error rule.
    'http_req_failed{scenario:buyers}': ['rate<0.01'],
  },
};


// ---------------------------------------------------------------------
// With scenarios, we don't need "export default function".
// Instead, each scenario names its own function with "exec".
// The function must be exported, so k6 can find it.
// ---------------------------------------------------------------------

// What a BROWSER does: look at a page, then read it for a second.
export function browse() {
  const res = http.get('https://httpbin.org/get');
  check(res, { 'browse: status is 200': (r) => r.status === 200 });
  sleep(1);
}

// What a BUYER does: send an order.
// No sleep here: with an arrival-rate executor, k6 decides WHEN each
// purchase starts (2 per second), so we don't need think time.
export function buy() {
  const order = { item: 'pizza', quantity: 1 };

  const res = http.post(
    'https://httpbin.org/post',
    JSON.stringify(order),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, { 'buy: status is 200': (r) => r.status === 200 });
}
