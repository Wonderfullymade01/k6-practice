// =====================================================================
// LESSON 13: TEST DATA AND REALISTIC USER JOURNEYS
// Run me with:   k6 run 13-test-data-journeys.js
// =====================================================================
// Until now, every virtual user did EXACTLY the same thing, with
// EXACTLY the same data. Real customers aren't like that:
//   - they have different names, accounts and preferences  -> TEST DATA
//   - they take different paths through the website        -> USER JOURNEYS
//   - some read for 1 second, some for 5                   -> RANDOM THINK TIME
//
// Why does it matter? If 100 users all ask for the SAME thing, the
// server can answer from its memory (a "cache") without doing real
// work. The test looks fast, but real traffic would be slower.
// Varied data makes the server do real work, like it does in real life.
// =====================================================================

import http from 'k6/http';
import { check, group, sleep } from 'k6';

// NEW: SharedArray is a special list for test data.
import { SharedArray } from 'k6/data';

const BASE_URL = 'https://quickpizza.grafana.com';


// ---------------------------------------------------------------------
// PART 1: TEST DATA FROM A FILE
// ---------------------------------------------------------------------
// Our customers live in customers.json (open it and have a look).
// Keeping data in its own file means you can change or add customers
// without touching the test code.
//
// SharedArray loads the file ONCE and shares it with every VU.
// Without it, each VU would load its own copy. With 1000 VUs and a big
// file, that would eat up the memory of the computer running k6.
//
//   'customers'             - a name for the list (any name you like)
//   open('./customers.json') - read the file as text
//   JSON.parse(...)          - turn the text into a list k6 can use
// ---------------------------------------------------------------------
const customers = new SharedArray('customers', function () {
  return JSON.parse(open('./customers.json'));
});


export const options = {
  stages: [
    { duration: '10s', target: 6 },
    { duration: '30s', target: 6 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    // A threshold for ONE step of the journey. 'group' filters by the
    // group name, the same way {scenario:...} did in Lesson 7.
    // (The ::  at the start is how k6 writes group names. Just copy it.)
    'http_req_duration{group:::02 Get a pizza recommendation}': ['p(95)<1500'],
  },
};


// ---------------------------------------------------------------------
// A small helper: a random whole number between min and max.
// Math.random() gives a random decimal between 0 and 1, e.g. 0.73.
// The maths turns that into a whole number in our range.
// You don't need to understand the maths, just how to use it:
//     randomBetween(1, 3)  ->  1, 2 or 3
// ---------------------------------------------------------------------
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


export default function () {

  // -------------------------------------------------------------------
  // PICK A CUSTOMER FOR THIS VU
  // __VU is 1, 2, 3... (Lesson 4). customers.length is how many
  // customers are in the file (6).
  // % means "remainder after dividing". It wraps around the list, so:
  //   VU 1 -> customers[1], VU 5 -> customers[5], VU 6 -> customers[0],
  //   VU 7 -> customers[1] again ... and we never go past the end.
  // Each VU gets its OWN customer, and keeps the same one every round.
  // -------------------------------------------------------------------
  const customer = customers[__VU % customers.length];


  // -------------------------------------------------------------------
  // PART 2: A USER JOURNEY, SPLIT INTO GROUPS
  // group('name', function) puts a label on a STEP of the journey.
  // In the results, k6 shows checks for each group separately, so you
  // can see WHICH STEP is slow or broken, not just "something failed".
  // Number the groups so they show up in order.
  // -------------------------------------------------------------------

  group('01 Visit homepage', function () {
    const res = http.get(BASE_URL + '/');
    check(res, { 'homepage loaded': (r) => r.status === 200 });
  });

  // RANDOM THINK TIME: real people don't all wait exactly 1 second.
  sleep(randomBetween(1, 3));


  group('02 Get a pizza recommendation', function () {
    // Build the request from THIS customer's own preferences.
    const request = {
      maxCaloriesPerSlice: customer.maxCalories,
      mustBeVegetarian: customer.vegetarian,
      excludedIngredients: customer.excluded,
      excludedTools: [],
      maxNumberOfToppings: customer.maxToppings,
      minNumberOfToppings: 2,
    };

    const res = http.post(BASE_URL + '/api/pizza', JSON.stringify(request), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token abcdef0123456789',
      },
    });

    check(res, {
      'got a pizza': (r) => r.status === 200,

      // A DATA-DRIVEN CHECK: the right answer depends on the customer.
      // A vegetarian must get a vegetarian pizza. Anyone else is fine
      // with anything.  || means "or",  ! means "not".
      //   "the customer is NOT vegetarian, OR the pizza IS vegetarian"
      'vegetarians get a veggie pizza': (r) =>
        r.status === 200 && (!customer.vegetarian || r.json().vegetarian === true),
    });

    // Print what each customer got, so you can see the data at work.
    // (Only on the first round, so the screen doesn't fill up.)
    if (__ITER === 0 && res.status === 200) {
      console.log(customer.name + ' (vegetarian: ' + customer.vegetarian + ') got: ' + res.json().pizza.name);
    }
  });

  sleep(randomBetween(1, 3));


  // -------------------------------------------------------------------
  // PART 3: NOT EVERYONE DOES EVERYTHING
  // In a real shop, only some customers look at reviews.
  // Math.random() < 0.3 is true about 30% of the time.
  // So roughly 3 in every 10 rounds will include this step.
  // -------------------------------------------------------------------
  if (Math.random() < 0.5) {
    group('03 Read pizza ratings', function () {
      const res = http.get(BASE_URL + '/api/ratings', {
        headers: { Authorization: 'Token abcdef0123456789' },
      });
      check(res, { 'ratings loaded': (r) => r.status === 200 });
    });

    sleep(randomBetween(1, 3));
  }
}
