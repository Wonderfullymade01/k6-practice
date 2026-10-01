// =====================================================================
// LESSON 6: STAGES
// Run me with:   k6 run 06-stages.js
// =====================================================================
// In Lesson 4, all 5 users arrived at the SAME moment and stayed until
// the end. Real traffic doesn't work like that.
//
// Think of a restaurant on a normal day:
//   - Opening:  customers arrive a few at a time   (traffic goes UP)
//   - Lunch:    the restaurant stays busy          (traffic STAYS)
//   - Closing:  customers slowly leave             (traffic goes DOWN)
//
// STAGES let you describe this shape. Each stage says:
//   "over THIS much time, move to THIS many users".
// k6 then adds or removes users smoothly to get there.
//
// Ramping up slowly also helps you find the POINT where things
// start to go wrong, instead of hitting the server all at once.
// =====================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  // -------------------------------------------------------------------
  // STAGES replace "vus" and "duration" from Lesson 4.
  // Don't use both at once. Stages already say how many users, and for
  // how long.
  //
  // Each stage is { duration: 'how long', target: how many users }
  // The stages run in order, from top to bottom.
  // The test always STARTS at 0 users.
  // -------------------------------------------------------------------
  stages: [
    // Stage 1: RAMP UP
    // Over 10 seconds, go smoothly from 0 users to 5 users.
    { duration: '10s', target: 5 },

    // Stage 2: HOLD (sometimes called "steady state")
    // For 10 seconds, stay at 5 users. Target is the same as before,
    // so the number of users doesn't change.
    { duration: '10s', target: 5 },

    // Stage 3: RAMP DOWN
    // Over 5 seconds, go smoothly from 5 users back down to 0.
    { duration: '5s', target: 0 },
  ],
  // Total test time = 10s + 10s + 5s = 25 seconds.

  // Thresholds from Lesson 5 still work exactly the same way.
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};


export default function () {
  const res = http.get('https://httpbin.org/get');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
