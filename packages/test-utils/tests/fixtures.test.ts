import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  getFixturePath,
  readFixture,
  readJsonFixture,
  retryUntilValid,
  sleep,
  waitForCondition,
  writeTestOutput,
} from '../src/fixtures';

const TEST_DIR = join(__dirname, '__test_temp__');

beforeEach(() => {
  if (!existsSync(TEST_DIR)) {
    mkdirSync(TEST_DIR, { recursive: true });
  }
  const fixturesDir = join(TEST_DIR, 'fixtures');
  if (!existsSync(fixturesDir)) {
    mkdirSync(fixturesDir, { recursive: true });
  }
  writeFileSync(join(fixturesDir, 'sample.txt'), 'hello world');
  writeFileSync(join(fixturesDir, 'data.json'), '{"key": "value"}');
});

afterEach(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('getFixturePath', () => {
  test('resolves fixture path correctly', () => {
    const result = getFixturePath(TEST_DIR, 'sample.txt');
    expect(result).toBe(join(TEST_DIR, 'fixtures', 'sample.txt'));
  });
});

describe('readFixture', () => {
  test('reads fixture file content', () => {
    const content = readFixture(TEST_DIR, 'sample.txt');
    expect(content).toBe('hello world');
  });

  test('throws for non-existent fixture', () => {
    expect(() => readFixture(TEST_DIR, 'nonexistent.txt')).toThrow(
      'Fixture file not found',
    );
  });
});

describe('readJsonFixture', () => {
  test('reads and parses JSON fixture', () => {
    const data = readJsonFixture<{ key: string }>(TEST_DIR, 'data.json');
    expect(data).toEqual({ key: 'value' });
  });
});

describe('writeTestOutput', () => {
  test('writes string output', () => {
    const outputDir = join(TEST_DIR, 'output');
    const path = writeTestOutput(outputDir, 'test.txt', 'test content');
    expect(existsSync(path)).toBe(true);
  });

  test('writes object as JSON', () => {
    const outputDir = join(TEST_DIR, 'output');
    const path = writeTestOutput(outputDir, 'test.json', { foo: 'bar' });
    expect(existsSync(path)).toBe(true);
  });

  test('creates nested directories', () => {
    const outputDir = join(TEST_DIR, 'nested', 'deep', 'output');
    const path = writeTestOutput(outputDir, 'test.txt', 'content');
    expect(existsSync(path)).toBe(true);
  });
});

describe('sleep', () => {
  test('pauses for specified duration', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

describe('retryUntilValid', () => {
  test('returns first valid result', async () => {
    let callCount = 0;
    const result = await retryUntilValid(
      async () => ++callCount,
      (val) => val >= 2,
      5,
      10,
    );
    expect(result).toBe(2);
    expect(callCount).toBe(2);
  });

  test('returns last result if never valid', async () => {
    const result = await retryUntilValid(
      async () => 'nope',
      () => false,
      3,
      10,
    );
    expect(result).toBe('nope');
  });
});

describe('waitForCondition', () => {
  test('resolves when condition met', async () => {
    let counter = 0;
    const interval = setInterval(() => counter++, 20);

    await waitForCondition(() => counter >= 3, 1000, 10);
    clearInterval(interval);
    expect(counter).toBeGreaterThanOrEqual(3);
  });

  test('throws on timeout', async () => {
    await expect(waitForCondition(() => false, 50, 10)).rejects.toThrow(
      'Condition not met within 50ms',
    );
  });
});
