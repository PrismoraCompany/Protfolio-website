import assert from 'node:assert/strict';
import { generateTimeCode, verifyTimeCode } from '../src/worker.js';

// 1. Generate current code
const currentCode = generateTimeCode();
assert.match(currentCode, /^\d{4}$/, 'Code must be exactly 4 digits');

// 2. Verify current code succeeds
const valid = await verifyTimeCode(currentCode);
assert.equal(valid, true, 'Current 4-digit clock code must be verified successfully');

// 3. Verify specific time: 09:59 -> "0959"
const time0959 = new Date('2026-11-22T09:59:00Z').getTime();
const code0959 = generateTimeCode(time0959, 0);
assert.equal(code0959, '0959', '09:59 must produce code 0959');

// 4. Verify specific time: 18:49 -> "1849"
const time1849 = new Date('2026-11-22T18:49:00Z').getTime();
const code1849 = generateTimeCode(time1849, 0);
assert.equal(code1849, '1849', '18:49 must produce code 1849');

// 5. Verify timezone offset support (e.g. IST -330 minutes for 14:40)
const istTime = new Date('2026-11-22T14:40:00+05:30').getTime();
const codeIST = generateTimeCode(istTime, -330);
assert.equal(codeIST, '1440', '14:40 in IST must produce code 1440');

// 6. Verify previous minute (-1 minute) succeeds due to grace period
const prevCode = generateTimeCode(Date.now(), 0, -1);
assert.equal(await verifyTimeCode(prevCode, 0), true, 'Previous 1-minute code should be accepted (grace period)');

// 7. Verify next minute (+1 minute) succeeds due to grace period
const nextCode = generateTimeCode(Date.now(), 0, 1);
assert.equal(await verifyTimeCode(nextCode, 0), true, 'Next 1-minute code should be accepted (grace period)');

// 8. Verify expired window (-3 minutes) fails
const expiredCode = generateTimeCode(Date.now(), 0, -3);
assert.equal(await verifyTimeCode(expiredCode, 0), false, '3-minute old code must be rejected');

// 9. Verify invalid formats fail
assert.equal(await verifyTimeCode('000000'), false, '6-digit code must fail');
assert.equal(await verifyTimeCode('abcd'), false, 'Non-digits must fail');
assert.equal(await verifyTimeCode(''), false, 'Empty code must fail');

console.log('Clock-Based Security Code & Auth tests passed ✔');
