// =====================================================================
// LESSON 14: CI SMOKE TEST
// Run me with:   k6 run ci-smoke-test.js      (takes about 30s)
// GitHub Actions runs me automatically on every push (see
// .github/workflows/k6.yml).
// =====================================================================
// A SMOKE TEST is a small, quick test: "is anything obviously broken?"
// The name comes from electronics: switch it on, and check nothing
// starts smoking.
//
// In CI/CD, tests run on EVERY code change, many times a day. So they
// must be:
//   - SHORT  (developers don't want to wait 30 minutes for every change)
//   - STRICT (clear thresholds, so the result is a clear pass or fail)
//
// The big load/stress/soak tests are usually run less often: every
// night, or before a big release.
// =====================================================================

import { pizzaUser, thresholds } from './pizza-user.js';

export const options = {
  vus: 2,
  duration: '30s',

  // The same pass/fail rules as Lessons 9-12.
  // If any of these break, k6 exits with code 99 (Lesson 5), and
  // GitHub Actions marks the run as FAILED with a red X.
  thresholds: thresholds,
};

export default function () {
  pizzaUser();
}
