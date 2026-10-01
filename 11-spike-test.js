// =====================================================================
// LESSON 11: SPIKE TEST
// Run me with:   k6 run 11-spike-test.js     (takes about 1 min 10s)
// =====================================================================
// QUESTION IT ANSWERS:
//   "What happens if a HUGE crowd arrives SUDDENLY, and does the system
//    recover afterwards?"
//
// Restaurant: a tour bus pulls up and 50 people walk in at once.
// Does the kitchen survive? After they leave, does service go back
// to normal, or is everything still slow and broken?
//
// Real examples: a ticket sale opening, a TV advert, Black Friday,
// a post going viral.
//
// SHAPE: quiet, then a sudden jump, then quiet again
//   users
//   30 |       ____
//      |      |    |
//    3 |______|    |________
//       quiet spike  recovery
//
// The difference from a stress test is SPEED: the stress test climbs
// slowly, step by step. A spike goes up almost instantly.
// The RECOVERY part at the end is just as important as the spike.
// =====================================================================

import { pizzaUser, thresholds } from './pizza-user.js';

export const options = {
  stages: [
    { duration: '20s', target: 3 },  // quiet, normal-ish traffic
    { duration: '5s', target: 30 },  // SPIKE: 10x the users in 5 seconds
    { duration: '20s', target: 30 }, // stay at the peak
    { duration: '5s', target: 3 },   // crowd leaves just as suddenly
    { duration: '20s', target: 3 },  // RECOVERY: is it fast again?
  ],
  thresholds: thresholds,
};

export default function () {
  pizzaUser();
}
