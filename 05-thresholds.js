// =====================================================================
// LESSON 5: THRESHOLDS
// Run me with:   k6 run 05-thresholds.js
// =====================================================================
// In Lesson 2 we learned that a failed CHECK does NOT fail the test.
// k6 just reports it and still shows a green tick at the end.
//
// A THRESHOLD is a PASS/FAIL RULE for the whole test.
// If any threshold is broken, k6 marks the WHOLE TEST AS FAILED.
//
// Think of a driving test:
//   Checks     = the examiner's notes on each thing you did
//   Thresholds = the rules for passing, e.g. "fewer than 3 mistakes"
//   You can make a few small mistakes and still pass. Too many = fail.
//
// Thresholds are how you write performance requirements, such as:
//   "95% of requests must finish in under 500ms"
//   "Less than 1% of requests may fail"
// =====================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  vus: 5,
  duration: '10s',

  // -------------------------------------------------------------------
  // THRESHOLDS
  // -------------------------------------------------------------------
  // Format:   metric_name: ['rule']
  //
  // The metric name is one you already know from Lesson 3.
  // The rule is written in quotes, using:
  //   <  means "less than"
  //   >  means "more than"
  // -------------------------------------------------------------------
  thresholds: {

    // RULE 1: Speed
    // "95% of requests must take less than 1000ms (1 second)."
    // p(95) is the percentile you learned in Lesson 3.
    http_req_duration: ['p(95)<1000', 'avg<600'],

    // RULE 2: Errors
    // "Less than 1% of requests may fail."
    // rate is written as a decimal:  0.01 = 1%,  0.1 = 10%,  1 = 100%
    http_req_failed: ['rate<0.01'], 

    // RULE 3: Checks
    // "More than 95% of our checks must pass."
    // 'checks' is the built-in metric that holds all your check results.
    checks: ['rate>0.95'],
  },
};


export default function () {
  const res = http.get('https://httpbin.org/get');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
