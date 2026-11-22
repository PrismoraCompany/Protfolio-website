import assert from 'node:assert/strict';
import { generateTimeCode, verifyTimeCode } from '../src/worker.js';

const secret = 'test-secret-password-123';

// 1. Generate current code
const currentCode = await generateTimeCode(secret, 0);
assert.match(currentCode, /^\d{6}$/, 'Code must be exactly 6 digits');

// 2. Verify current code succeeds
const valid = await verifyTimeCode(currentCode, secret);
assert.equal(valid, true, 'Current 6-digit code must be verified successfully');

// 3. Verify previous window (-1 minute) succeeds due to grace period
const prevCode = await generateTimeCode(secret, -1);
assert.equal(await verifyTimeCode(prevCode, secret), true, 'Previous 1-minute code should be accepted (grace period)');

// 4. Verify next window (+1 minute) succeeds due to grace period
const nextCode = await generateTimeCode(secret, 1);
assert.equal(await verifyTimeCode(nextCode, secret), true, 'Next 1-minute code should be accepted (grace period)');

// 5. Verify expired window (-2 minutes) fails
const expiredCode = await generateTimeCode(secret, -2);
assert.equal(await verifyTimeCode(expiredCode, secret), false, '2-minute old code must be rejected');

// 6. Verify random wrong code fails
assert.equal(await verifyTimeCode('000000', secret), false, 'Invalid code must fail');
assert.equal(await verifyTimeCode('abcdef', secret), false, 'Non-digits must fail');
assert.equal(await verifyTimeCode('', secret), false, 'Empty code must fail');

console.log('Admin Security Code & Auth tests passed ✔');
