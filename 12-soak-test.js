// =====================================================================
// LESSON 12: SOAK TEST
// Run me with:   k6 run 12-soak-test.js      (takes about 3 min)
// =====================================================================
// QUESTION IT ANSWERS:
//   "Does the system stay healthy over a LONG time?"
//
// Restaurant: a normal amount of customers, but the restaurant stays
// open for 24 hours straight. Nothing dramatic happens, but slowly:
// bins fill up, staff get tired, the dishwasher starts leaking.
//
// Some problems ONLY show up after hours, never in a short test:
//   - MEMORY LEAKS: the app uses a bit more memory every minute until
//     the server runs out and crashes
//   - disks filling up with logs
//   - database connections that are never given back
//
// SHAPE: normal traffic, held for a very long time
//   users
//    5 |  ________________________________________
//      | /                                        \
//    0 |/                                          \
//       ramp up        hold for HOURS           ramp down
//
// What to watch: does response time slowly CREEP UP over the test?
// Compare the start with the end. If it's getting slower and slower,
// something is leaking.
//
// A REAL soak test runs for hours (4, 8, even 24+). This demo runs for
// 3 minutes, just so you can see how it's built. Don't run a multi-hour
// test against QuickPizza; save that for your own systems.
// =====================================================================

import { pizzaUser, thresholds } from './pizza-user.js';

export const options = {
  stages: [
    { duration: '15s', target: 5 },    // ramp up
    { duration: '2m30s', target: 5 },  // HOLD for a long time (real life: '4h' or more)
    { duration: '15s', target: 0 },    // ramp down
  ],
  thresholds: thresholds,
};

export default function () {
  pizzaUser();
}
