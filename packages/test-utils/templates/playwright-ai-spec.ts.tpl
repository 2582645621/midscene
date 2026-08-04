/**
 * Template: Playwright AI Spec Test
 *
 * Copy this file to your test directory, rename to *.spec.ts, and customize.
 * Requires a fixture.ts in the same directory (see playwright-fixture.ts.tpl).
 *
 * Available fixtures: ai, aiTap, aiInput, aiAssert, aiQuery, aiAction, agentForPage, runYaml
 */
import { test } from './fixture';

const TARGET_URL = 'https://example.com';

test.beforeEach(async ({ page }) => {
  await page.goto(TARGET_URL);
  await page.setViewportSize({ width: 1920, height: 1080 });
});

test.describe('Feature Name', () => {
  test('should complete the main flow', async ({
    ai,
    aiAssert,
    aiTap,
    aiInput,
    aiQuery,
  }) => {
    // Step 1: Interact with the page
    await aiInput('test value', 'in the input field');
    await aiTap('Submit button');

    // Step 2: Verify the result
    await aiAssert('The success message is displayed');

    // Step 3: Query data (optional)
    // const result = await aiQuery('string, the displayed result text');
    // expect(result).toContain('expected');
  });

  test('should handle error cases', async ({ ai, aiAssert }) => {
    // Trigger an error state
    await ai('Submit the form without filling required fields');

    // Verify error display
    await aiAssert('An error message is shown for the required field');
  });
});
