// =====================================================================
// SHARED FILE: WHAT ONE PIZZA-SHOP USER DOES
// Used by Lessons 9-12. You don't run this file directly.
// =====================================================================
// Load, stress, spike and soak tests all use the SAME user behaviour.
// The only thing that changes between them is the traffic SHAPE
// (how many users, and for how long).
//
// So instead of copying this code into 4 files, we write it ONCE here
// and "import" it into each test. It's the same idea as
//     import http from 'k6/http';
// except this time we import from our own file.
// =====================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';

// QuickPizza is Grafana's official practice site for k6.
// It's built to be load tested, so we can use more users than on httpbin.
// Still, keep tests small and short: it's shared by k6 learners worldwide.
const BASE_URL = 'https://quickpizza.grafana.com';


// These thresholds are shared too, so every test type is judged by the
// SAME rules. That makes it fair to compare the results.
export const thresholds = {
  http_req_duration: ['p(95)<50'], // 95% of requests under 1.5 seconds
  http_req_failed: ['rate<0.01'],    // fewer than 1% errors
};


// "export" makes this function available to other files.
export function pizzaUser() {

  // Step 1: open the homepage (like a customer walking in).
  const home = http.get(BASE_URL + '/');
  check(home, { 'homepage: status is 200': (r) => r.status === 200 });

  sleep(1); // look at the page


  // Step 2: ask for a pizza recommendation (the shop's main feature).
  const pizzaRequest = {
    maxCaloriesPerSlice: 1000,
    mustBeVegetarian: false,
    excludedIngredients: [],
    excludedTools: [],
    maxNumberOfToppings: 5,
    minNumberOfToppings: 2,
  };

  const pizza = http.post(BASE_URL + '/api/pizza', JSON.stringify(pizzaRequest), {
    headers: {
      'Content-Type': 'application/json',
      // QuickPizza's practice token (Lesson 8: the key card)
      Authorization: 'Token abcdef0123456789',
    },
  });

  check(pizza, {
    'pizza: status is 200': (r) => r.status === 200,
    // Check the status FIRST. If the request failed completely, there's
    // no body to read, and r.json() would crash. && means "and": if the
    // first part is false, k6 doesn't even try the second part.
    'pizza: got a pizza name': (r) => r.status === 200 && r.json().pizza.name !== undefined,
  });

  sleep(1); // think about the pizza
}
