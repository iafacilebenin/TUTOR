import test from 'node:test';
import assert from 'node:assert';
import { TelecomGateway } from './Gateway.js';

test('Telecom Gateway - USSD Parsing', () => {
  const input = "*123*456*GRADE*102#";
  const parsed = TelecomGateway.parseUSSD(input);

  assert.strictEqual(parsed.serviceCode, "123");
  assert.strictEqual(parsed.studentId, "456");
  assert.strictEqual(parsed.action, "GRADE");
  assert.strictEqual(parsed.data, "102");
});

test('Telecom Gateway - USSD Menu Parsing', () => {
  const input = "*123*456#";
  const parsed = TelecomGateway.parseUSSD(input);

  assert.strictEqual(parsed.serviceCode, "123");
  assert.strictEqual(parsed.studentId, "456");
  assert.strictEqual(parsed.action, "MENU");
});
