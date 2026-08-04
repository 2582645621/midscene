/**
 * Common test fixtures and helper utilities.
 *
 * Consolidates utility functions that are duplicated across
 * packages/core/tests/utils.ts and other test directories.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * Get the absolute path to a fixture file.
 *
 * @param baseDir - The base directory (typically __dirname of the test file)
 * @param relativePath - Relative path from baseDir/fixtures to the file
 */
export function getFixturePath(baseDir: string, relativePath: string): string {
  return join(baseDir, 'fixtures', relativePath);
}

/**
 * Read a fixture file as a string.
 */
export function readFixture(baseDir: string, relativePath: string): string {
  const fullPath = getFixturePath(baseDir, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(
      `Fixture file not found: ${fullPath}. ` +
        `Check that the file exists relative to: ${join(baseDir, 'fixtures')}`,
    );
  }
  return readFileSync(fullPath, 'utf-8');
}

/**
 * Read a fixture file and parse it as JSON.
 */
export function readJsonFixture<T = unknown>(
  baseDir: string,
  relativePath: string,
): T {
  const content = readFixture(baseDir, relativePath);
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse fixture as JSON: ${relativePath}. ${error}`,
    );
  }
}

/**
 * Write a snapshot/output file for test comparison.
 * Creates parent directories if they don't exist.
 */
export function writeTestOutput(
  outputDir: string,
  fileName: string,
  data: object | string,
): string {
  const outputPath = join(outputDir, fileName);
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const content =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  writeFileSync(outputPath, content);
  return outputPath;
}

/**
 * Promise-based sleep utility.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or max attempts reached.
 * Useful for AI-based queries that may have non-deterministic results.
 *
 * @param fn - The function to retry
 * @param validate - Validation function to determine success
 * @param maxAttempts - Maximum number of attempts (default: 3)
 * @param delayMs - Delay between attempts (default: 1000)
 */
export async function retryUntilValid<T>(
  fn: () => Promise<T>,
  validate: (result: T) => boolean,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<T> {
  let lastResult: T | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    lastResult = await fn();
    if (validate(lastResult)) {
      return lastResult;
    }
    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  return lastResult as T;
}

/**
 * Create a temporary directory path for test outputs.
 * The directory is created relative to the project's midscene_run folder.
 */
export function createTestOutputDir(testName: string): string {
  const baseDir = resolve(process.cwd(), 'midscene_run', 'test-output');
  const outputDir = join(baseDir, testName.replace(/[^a-zA-Z0-9_-]/g, '_'));
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

/**
 * Wait for a condition to become true with timeout.
 *
 * @param condition - Function that returns true when the condition is met
 * @param timeoutMs - Maximum time to wait
 * @param pollIntervalMs - How often to check (default: 100ms)
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number,
  pollIntervalMs = 100,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await condition()) return;
    await sleep(pollIntervalMs);
  }
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}
