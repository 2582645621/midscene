/**
 * Template: Playwright AI Test Fixture
 *
 * Copy this file to your test directory as fixture.ts.
 * This extends Playwright's test with Midscene AI capabilities.
 *
 * Choose a preset or customize the options:
 *   - Standard: balanced timeouts, no cache
 *   - With cache: add cache config for faster re-runs
 *   - Custom: adjust timeouts based on your app's behavior
 */
import type { PlayWrightAiFixtureType } from '@midscene/web/playwright';
import { PlaywrightAiFixture } from '@midscene/web/playwright';
import { test as base } from '@playwright/test';

export const test = base.extend<PlayWrightAiFixtureType>(
  PlaywrightAiFixture({
    // Network idle timeout (ms) - increase for slow APIs
    waitForNetworkIdleTimeout: 10000,

    // Cache configuration (uncomment one):
    // cache: false,                                    // No cache (default)
    // cache: { strategy: 'write-only' },              // Dev: save new cache entries
    // cache: { strategy: 'read-write' },              // CI: use and update cache
    // cache: { id: 'my-test-suite', strategy: 'read-write' }, // Named cache
  }),
);
