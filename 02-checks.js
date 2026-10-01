// =====================================================================
// LESSON 2: CHECKS
// Run me with:   k6 run 02-checks.js
// =====================================================================
// In Lesson 1 we SENT requests and PRINTED what came back.
// But printing only shows us the answer. It doesn't tell us whether
// the answer was CORRECT.
//
// A CHECK is a yes/no question you ask about a response:
//   "Did the server say OK (status 200)?"      -> yes or no
//   "Does the reply contain my name?"          -> yes or no
//
// k6 counts how many checks passed and failed and shows the totals
// at the end of the run.
//
// IMPORTANT: a failed check does NOT stop the test. k6 notes the failure
// and carries on, like a teacher marking a wrong answer and moving to
// the next question.
// =====================================================================

import http from 'k6/http';

// Now we also borrow the "check" tool from k6.
// The { } around it means "from the k6 toolbox, take only the check tool".
import { check } from 'k6';

export default function () {

  // -------------------------------------------------------------------
  // PART A: Your first check
  // -------------------------------------------------------------------
  const res = http.get('https://httpbin.org/get');

  // check( thing to inspect, { list of questions } )
  //
  // Each question has two parts:
  //   'a label'  : the text k6 shows you in the results
  //   (r) => ...  : the actual test. "r" stands for the response.
  //
  // Read  (r) => r.status === 200  out loud as:
  //   "take the response r, and answer: is its status exactly 200?"
  // === means "is exactly equal to". It gives back true (pass) or false (fail).
  check(res, {
    'A) status is 200': (r) => r.status === 200,
  });


  // -------------------------------------------------------------------
  // PART B: Several checks on one response
  // You can ask as many questions as you like, separated by commas.
  // -------------------------------------------------------------------
  const resParams = http.get('https://httpbin.org/get?name=Fiyin');

  check(resParams, {
    // Is the status 200 (OK)?
    'B) status is 200': (r) => r.status === 200,

    // Did the reply come back fast? timings.duration is in milliseconds.
    // 1000 milliseconds = 1 second. < means "less than".
    'B) response took less than 1 second': (r) => r.timings.duration < 1000,

    // Does the reply text contain the word "Fiyin"?
    // r.body is the reply as plain text. .includes() asks "is this inside it?"
    'B) body contains my name': (r) => r.body.includes('Fiyin'),

    // Read a specific value out of the JSON reply, like in Lesson 1.
    'B) server saw name=Fiyin': (r) => r.json().args.name === 'Fiyin',
  });


  // -------------------------------------------------------------------
  // PART C: Checking a POST request
  // -------------------------------------------------------------------
  const newUser = { username: 'fiyin', job: 'devops engineer' };

  const resPost = http.post(
    'https://httpbin.org/post',
    JSON.stringify(newUser),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(resPost, {
    'C) POST status is 200': (r) => r.status === 200,
    'C) server received my username': (r) => r.json().json.username === 'fiyin',
  });


  // -------------------------------------------------------------------
  // PART D: A check that FAILS on purpose
  // This page always answers with status 404 ("Not Found").
  // We check for 200, so this check will fail. Watch how k6 reports it:
  // it does NOT crash, it just counts the failure.
  // -------------------------------------------------------------------
  const resMissing = http.get('https://httpbin.org/status/404');

  check(resMissing, {
    'D) status is 200 (this will FAIL on purpose)': (r) => r.status === 404,
  });
}
