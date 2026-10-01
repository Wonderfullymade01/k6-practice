// =====================================================================
// LESSON 9: LOAD TEST
// Run me with:   k6 run 09-load-test.js      (takes about 1 min 45s)
// =====================================================================
// QUESTION IT ANSWERS:
//   "Does the system work well on a NORMAL busy day?"
//
// Restaurant: a normal Friday lunch. Busy, but the amount of customers
// we EXPECT. Everything should run smoothly.
//
// SHAPE:
//   users
//   10 |      ______________
//      |     /              \
//    0 |____/                \____
//       ramp up   hold      ramp down
//
// You use the number of users you EXPECT in real life.
// If this test fails, the system isn't ready for normal traffic.
// =====================================================================

// Import the shared user and rules from our own file.
// "./" means "in this same folder".
import { pizzaUser, thresholds } from './pizza-user.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // ramp up to normal traffic
    { duration: '1m', target: 10 },  // hold at normal traffic
    { duration: '15s', target: 0 },  // ramp down
  ],
  thresholds: thresholds,
};

export default function () {
  pizzaUser();
}
