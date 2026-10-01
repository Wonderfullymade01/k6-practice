// =====================================================================
// LESSON 3: METRICS
// Run me with:   k6 run 03-metrics.js
// =====================================================================
// A METRIC is a measurement that k6 records while your test runs.
// Think of a car dashboard: speed, fuel, engine temperature.
// You don't calculate them yourself; the car measures them for you.
//
// k6 does the same. Every request you send is measured automatically,
// and the numbers appear in the "TOTAL RESULTS" summary at the end.
//
// This lesson has two parts:
//   1. BUILT-IN metrics  - the ones k6 records for you for free
//   2. CUSTOM metrics    - your own measurements, with names you choose
// =====================================================================

import http from 'k6/http';
import { check } from 'k6';

// Borrow k6's tools for making our OWN metrics (Part 2).
// There are 4 kinds; we use 3 of them here:
//   Counter - counts things up        (like a tally: 1, 2, 3...)
//   Trend   - collects many numbers   (then shows avg, min, max...)
//   Rate    - a percentage of yes/no  (like "80% were successful")
import { Counter, Trend, Rate } from 'k6/metrics';


// ---------------------------------------------------------------------
// OPTIONS: settings for the whole test
// ---------------------------------------------------------------------
// One request gives one measurement, which isn't very interesting.
// "iterations: 5" tells k6: run the default function 5 times in a row.
// That gives us 5x more measurements, so averages make more sense.
// (We'll learn much more about options in Lessons 4 to 7.)
export const options = {
  iterations: 10,
};


// ---------------------------------------------------------------------
// CREATE OUR CUSTOM METRICS
// ---------------------------------------------------------------------
// We create these OUTSIDE the default function, so they are made once
// and shared by all 5 iterations. The text in quotes is the name that
// will appear in the results.
const pagesVisited = new Counter('my_pages_visited');
const homepageTime = new Trend('my_homepage_time', true); // true = show as time (ms/s)
const loginSuccess = new Rate('my_login_success');


export default function () {

  // -------------------------------------------------------------------
  // PART 1: BUILT-IN METRICS
  // -------------------------------------------------------------------
  // You don't write anything special here. Just by sending requests,
  // k6 fills in these metrics automatically:
  //
  //   http_reqs          - how many requests were sent in total
  //   http_req_duration  - how long each request took
  //   http_req_failed    - % of requests that got an error (400 or higher)
  //   iterations         - how many times the default function ran
  //   data_sent/received - how much data went over the network
  // -------------------------------------------------------------------

  // A normal page. This should succeed.
  const res = http.get('https://httpbin.org/get');

  // A page that always answers 404 "Not Found".
  // k6 will count this in http_req_failed.
  const resMissing = http.get('https://httpbin.org/status/404');

  check(res, {
    'homepage status is 200': (r) => r.status === 200,
  });


  // -------------------------------------------------------------------
  // PART 2: CUSTOM METRICS
  // -------------------------------------------------------------------
  // To record a value in a custom metric, use  .add(value)

  // COUNTER: add 1 for every page we visited in this iteration.
  // We visited 2 pages above, so add 2.
  pagesVisited.add(2);

  // TREND: record how long the homepage took (in milliseconds).
  // After 5 iterations, k6 will show avg, min, max etc. for these 5 numbers.
  homepageTime.add(res.timings.duration);

  // RATE: record a yes/no answer. true = success, false = failure.
  // Pretend this is a login: status 200 means it worked.
  // Every iteration, we add one yes or no, and k6 shows the % of yeses.
  loginSuccess.add(resMissing.status === 200);
}
