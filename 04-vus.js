// =====================================================================
// LESSON 4: VIRTUAL USERS (VUs)
// Run me with:   k6 run 04-vus.js
// =====================================================================
// So far, only ONE pretend user has been running our code (vus: 1).
// One user doing things one after another puts almost no pressure on
// a server.
//
// A VIRTUAL USER (VU) is one pretend person using the website.
// Each VU runs the default function over and over, on its own,
// at the SAME TIME as all the other VUs.
//
// Think of a shop:
//   1 VU  = 1 customer walking around the shop
//   5 VUs = 5 customers in the shop at the same time
// The more customers at once, the busier the staff (the server) gets.
// =====================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';   // NEW: "sleep" makes a user pause


// ---------------------------------------------------------------------
// OPTIONS
// ---------------------------------------------------------------------
export const options = {
  // How many virtual users run at the same time.
  vus: 5,

  // How long the test runs. '10s' = 10 seconds.
  // (You could also write '1m' for 1 minute, '1m30s' etc.)
  // Each VU keeps repeating the default function until time is up.
  duration: '10s',
};

// NOTE: httpbin.org is a free public practice site. Keep the number of
// VUs small (10 or fewer) so we don't overload someone else's server.
// Only ever load test servers you own or have permission to test.


export default function () {

  // -------------------------------------------------------------------
  // __VU and __ITER are special labels k6 gives you for free:
  //   __VU   = which user is this?        (1, 2, 3, 4 or 5)
  //   __ITER = how many times has THIS user already run the function?
  //            It starts counting at 0.
  // We print them so you can SEE the 5 users working side by side.
  // -------------------------------------------------------------------
  console.log('User ' + __VU + ' is starting round ' + __ITER);

  const res = http.get('https://httpbin.org/get');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // -------------------------------------------------------------------
  // SLEEP = "think time"
  // Real people don't click non-stop. They read the page, then click.
  // sleep(1) makes this user wait 1 second before starting again.
  // Without sleep, each VU would fire requests as fast as possible,
  // which is not how real users behave.
  // -------------------------------------------------------------------
  sleep(1);
}
