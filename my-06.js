import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {

stages: [
    {duration: '5s', target: 3},
    {duration: '10s', target: 3},
    {duration: '5s', target: 8},
    {duration: '5s', target: 8},
    {duration: '5s', target:0},
],

thresholds:{ 
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
},
};

export default function () {
    const res = http.get('https://httpbin.org/get');

    check(res, {
        'status is 200': (r) => r.status ===200,
    });

    sleep(1);
}