import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '30s', target: 0 },
    ],
};

const file = open('../testdata/test_image.jpg', 'b');

export default function () {
    const url = 'http://localhost:8080/api/images/upload';

    const formData = {
        image: http.file(file, 'test_image.jpg'),
    };

    const res = http.post(url, formData);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1);
}

