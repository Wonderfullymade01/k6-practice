// =====================================================================
// LESSON 10: STRESS TEST
// Run me with:   k6 run 10-stress-test.js    (takes about 2 min)
// =====================================================================
// QUESTION IT ANSWERS:
//   "How much MORE than normal can the system take, and where does
//    it start to struggle?"
//
// Restaurant: keep adding more and more customers, step by step, and
// watch for the moment the kitchen can't keep up (slow food, wrong orders).
//
// SHAPE: climbing steps, each one higher than normal
//   users
//   30 |              ____
//   20 |         ____/    \
//   10 |    ____/          \
//    0 |___/                \___
//
// Normal traffic is 10 users (our load test). Here we go to 2x and 3x.
// Watch response times at each step. When they jump, you've found
// roughly where the system's limit is.
//
// (A real stress test goes MUCH higher, until something breaks. We stay
// small because QuickPizza is a shared practice site.)
// =====================================================================

import { pizzaUser, thresholds } from './pizza-user.js';

export const options = {
  stages: [
    { duration: '20s', target: 10 }, // normal
    { duration: '20s', target: 10 },
    { duration: '20s', target: 20 }, // 2x normal
    { duration: '20s', target: 20 },
    { duration: '20s', target: 30 }, // 3x normal
    { duration: '20s', target: 30 },
    { duration: '15s', target: 0 },  // ramp down: does it recover?
  ],
  thresholds: thresholds,
};

export default function () {
  pizzaUser();
}
