import test from 'node:test';
import assert from 'node:assert';
import { PIIScrubber } from './PIIScrubber.js';

test('PII Scrubber - Email', () => {
  const input = "Contact me at student@example.com";
  const output = PIIScrubber.scrub(input);
  assert.strictEqual(output, "Contact me at [EMAIL]");
});

test('PII Scrubber - Benin Phone', () => {
  const input = "Mon numéro est +229 97 00 00 00";
  const output = PIIScrubber.scrub(input);
  assert.strictEqual(output, "Mon numéro est [BENIN_PHONE]");
});

test('PII Scrubber - Custom Rules', () => {
  const input = "Je suis à Cotonou";
  const rules = [{ pattern: "Cotonou", replacement: "[CITY]" }];
  const output = PIIScrubber.scrub(input, rules);
  assert.strictEqual(output, "Je suis à [CITY]");
});
