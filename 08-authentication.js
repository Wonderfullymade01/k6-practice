// =====================================================================
// LESSON 8: AUTHENTICATION
// Run me with:   k6 run 08-authentication.js
// =====================================================================
// Most real APIs don't answer just anybody. You must prove WHO you are
// first. This is called AUTHENTICATION.
//
// Think of a hotel:
//   1. At reception you show your ID              -> LOGIN (username + password)
//   2. They give you a KEY CARD                   -> a TOKEN
//   3. You tap the key card on every door         -> send the token with every request
//   You don't show your ID at every door. The card is enough.
//
// If you have no key card (or a wrong one), the door stays shut:
//   status 401 = "Unauthorized" (I don't know who you are)
//
// This lesson shows 3 common ways APIs check who you are.
// =====================================================================

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 3,
  duration: '10s',
  thresholds: {
    checks: ['rate>0.95'],
  },
};


// ---------------------------------------------------------------------
// SECRETS: never write real passwords directly in your test files.
// Files get shared and uploaded to GitHub, and then anyone can see them.
//
// __ENV lets you pass values in from OUTSIDE the file when you run it:
//     k6 run -e QP_PASSWORD=12345678 08-authentication.js
//
// The  ||  means "or": if no password was passed in, use '12345678'.
// That's only OK here because it's a public practice account.
// ---------------------------------------------------------------------
const USERNAME = __ENV.QP_USERNAME || 'default';
const PASSWORD = __ENV.QP_PASSWORD || '12345678';

const BASE_URL = 'https://quickpizza.grafana.com';


// ---------------------------------------------------------------------
// setup() = runs ONCE, before any users start.
// Perfect for logging in: we get ONE key card and share it with every
// user, instead of all users logging in over and over.
// Whatever setup() returns is handed to the default function as "data".
// ---------------------------------------------------------------------
export function setup() {
  const loginRes = http.post(
    BASE_URL + '/api/users/token/login',
    JSON.stringify({ username: USERNAME, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login: status is 200': (r) => r.status === 200,
    'login: got a token': (r) => r.json().token !== undefined,
  });

  // Pull the token out of the reply, e.g. { "token": "abcdef..." }
  const token = loginRes.json().token;

  // Return it inside an object, so the default function can use it.
  return { token: token };
}


export default function (data) {

  // -------------------------------------------------------------------
  // PART A: BASIC AUTH
  // The oldest and simplest way: username and password in every request.
  // In k6 you can put them in the URL like this:
  //     https://USERNAME:PASSWORD@website.com/...
  // (httpbin's practice page expects username "user", password "passwd")
  // -------------------------------------------------------------------
  const basicRes = http.get('https://user:passwd@httpbin.org/basic-auth/user/passwd');

  check(basicRes, {
    'A) basic auth: status is 200': (r) => r.status === 200,
  });


  // -------------------------------------------------------------------
  // PART B: BEARER TOKEN
  // The most common way in modern APIs. You send a token in a HEADER
  // called "Authorization". Remember headers from Lesson 1: notes on the
  // outside of the envelope.
  // The format is:   Authorization: Bearer <your token>
  // -------------------------------------------------------------------
  const bearerRes = http.get('https://httpbin.org/bearer', {
    headers: { Authorization: 'Bearer my-practice-token' },
  });

  check(bearerRes, {
    'B) bearer token: status is 200': (r) => r.status === 200,
  });


  // -------------------------------------------------------------------
  // PART C: A REAL LOGIN FLOW (login -> get token -> use token)
  // setup() already logged in and gave us the token in "data.token".
  // QuickPizza expects the header in this format:
  //     Authorization: Token <your token>
  // (Some APIs say "Bearer", some say "Token". Their docs tell you which.)
  // -------------------------------------------------------------------
  const ratingsRes = http.get(BASE_URL + '/api/ratings', {
    headers: { Authorization: 'Token ' + data.token },
  });

  check(ratingsRes, {
    'C) with token: status is 200': (r) => r.status === 200,
  });


  // -------------------------------------------------------------------
  // PART D: WHAT HAPPENS WITHOUT A TOKEN?
  // Same page, no key card. We EXPECT to be refused with 401.
  // Testing that the door stays locked is just as important as testing
  // that it opens.
  // -------------------------------------------------------------------
  const noTokenRes = http.get(BASE_URL + '/api/ratings');

  check(noTokenRes, {
    'D) without token: status is 401': (r) => r.status === 401,
  });

  sleep(1);
}
