// =====================================================================
// LESSON 1: HTTP REQUESTS
// Run me with:   k6 run 01-http-requests.js
// =====================================================================
// Lines starting with // are COMMENTS. k6 ignores them. They are notes
// for humans. Read them from top to bottom.
// =====================================================================

// "import" = borrow a tool someone else built.
// Here we borrow k6's "http" tool, which knows how to talk to websites.
import http from 'k6/http';

// k6 runs everything inside this "default function" once per iteration.
// Think of it as "the list of steps one user performs".
export default function () {

  // -------------------------------------------------------------------
  // PART A: A simple GET request
  // GET = "please GIVE me something" (like opening a web page)
  // -------------------------------------------------------------------
  // "const" = create a labelled box to hold a value. The box is named
  // "res" (short for response), and it holds what the server sent back.
  const res = http.get('https://httpbin.org/get');

  // console.log prints text to your terminal so you can see what happened.
  console.log('A) GET status code: ' + res.status);


  // -------------------------------------------------------------------
  // PART B: GET with query parameters
  // Parameters are extra info in the URL after a "?" and joined by "&".
  // Example: searching Google for "cats" -> google.com/search?q=cats
  // -------------------------------------------------------------------
  const resParams = http.get('https://httpbin.org/get?name=Fiyin&level=beginner');

  // httpbin.org is a practice site that "echoes" back what you sent.
  // res.json() turns the server's reply into something we can read from.
  // .args is where httpbin puts the parameters it received.
  console.log('B) Server received parameters: ' + JSON.stringify(resParams.json().args));


  // -------------------------------------------------------------------
  // PART C: GET with headers
  // Headers are extra information that travels WITH the request but is
  // not part of the URL. Like writing notes on the outside of an envelope.
  // Common uses: saying who you are, what format you want, login tokens.
  // -------------------------------------------------------------------
  // Curly braces { } create an "object" = a group of  name: value  pairs.
  const params = {
    headers: {
      'User-Agent': 'my-k6-learning-test',
      'Accept': 'application/json',
    },
  };

  const resHeaders = http.get('https://httpbin.org/headers', params);
  console.log('C) Server saw my User-Agent as: ' + resHeaders.json().headers['User-Agent']);


  // -------------------------------------------------------------------
  // PART D: A POST request
  // POST = "please TAKE this data" (like submitting a form or signing up)
  // -------------------------------------------------------------------
  // The data we want to send (the "body").
  const newUser = {
    username: 'fiyin',
    job: 'devops engineer',
  };

  // JSON.stringify turns our object into plain text so it can be sent.
  // The header tells the server "the text I'm sending is JSON".
  const resPost = http.post(
    'https://httpbin.org/post',
    JSON.stringify(newUser),
    { headers: { 'Content-Type': 'application/json' } }
  );

  console.log('D) POST status code: ' + resPost.status);
  console.log('D) Server received body: ' + JSON.stringify(resPost.json().json));
}
