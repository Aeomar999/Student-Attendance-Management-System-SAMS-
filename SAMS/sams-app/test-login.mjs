const csrfReq = await fetch('http://localhost:3000/api/auth/csrf');
const csrfRes = await csrfReq.json();
const csrfToken = csrfRes.csrfToken;

console.log("Got CSRF Token:", csrfToken);
// Send NextAuth Credentials Login POST
const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': csrfReq.headers.get('set-cookie') || ''
    },
    body: new URLSearchParams({
        csrfToken,
        email: 'admin@sams.edu',
        password: 'Password123!',
        redirect: 'false',
        callbackUrl: 'http://localhost:3000/dashboard'
    }),
    redirect: 'manual'
});

console.log("Status:", res.status);
const text = await res.text();
try {
    const json = JSON.parse(text);
    console.log("Response:", JSON.stringify(json, null, 2));
} catch {
    console.log("Response Text:", text.substring(0, 100));
}
