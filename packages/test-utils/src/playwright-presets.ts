/**
 * Playwright AI Fixture Presets — pre-configured fixture factories
 * for common test scenarios.
 *
 * Usage:
 *   import { createTestFixture, PRESETS } from '@midscene/test-utils/playwright-presets';
 *
 *   // Use a preset:
 *   export const test = createTestFixture(PRESETS.standard);
 *
 *   // Or customize:
 *   export const test = createTestFixture({
 *     ...PRESETS.standard,
 *     cache: { strategy: 'read-write' },
 *   });
 */

/**
 * Common fixture configuration options.
 * These map to PlaywrightAiFixtureOptions from @midscene/web.
 */
export interface FixturePreset {
  /** Display name for the preset (documentation only) */
  name: string;
  /** Description of when to use this preset */
  description: string;
  /** Network idle timeout in ms */
  waitForNetworkIdleTimeout?: number;
  /** Navigation timeout in ms */
  waitForNavigationTimeout?: number;
  /** Whether to force same-tab navigation */
  forceSameTabNavigation?: boolean;
  /** Cache configuration */
  cache?: false | true | { strategy?: string; id?: string };
}

/**
 * Pre-defined presets for common test scenarios.
 */
export const PRESETS = {
  /** Standard web app testing - balanced timeouts, no cache */
  standard: {
    name: 'standard',
    description: 'Standard web app testing with balanced timeouts and no cache',
    waitForNetworkIdleTimeout: 10000,
    forceSameTabNavigation: true,
  } satisfies FixturePreset,

  /** Fast iteration during development - write-only cache */
  development: {
    name: 'development',
    description: 'Development mode with write-only cache for faster iteration',
    waitForNetworkIdleTimeout: 10000,
    forceSameTabNavigation: true,
    cache: { strategy: 'write-only' },
  } satisfies FixturePreset,

  /** CI environment - read-write cache, longer timeouts */
  ci: {
    name: 'ci',
    description: 'CI mode with read-write cache and relaxed timeouts',
    waitForNetworkIdleTimeout: 15000,
    waitForNavigationTimeout: 30000,
    forceSameTabNavigation: true,
    cache: { strategy: 'read-write' },
  } satisfies FixturePreset,

  /** SPA testing - longer network idle, handles client-side routing */
  spa: {
    name: 'spa',
    description: 'Single-page app testing with extended network idle timeout',
    waitForNetworkIdleTimeout: 15000,
    forceSameTabNavigation: false,
  } satisfies FixturePreset,

  /** Static site testing - short timeouts, no dynamic content expected */
  static: {
    name: 'static',
    description: 'Static site testing with shorter timeouts',
    waitForNetworkIdleTimeout: 5000,
    forceSameTabNavigation: true,
  } satisfies FixturePreset,

  /** Multi-tab testing - allows new tab navigation */
  multiTab: {
    name: 'multiTab',
    description: 'Testing flows that open new tabs or windows',
    waitForNetworkIdleTimeout: 10000,
    forceSameTabNavigation: false,
  } satisfies FixturePreset,
} as const;

/**
 * Generates a fixture.ts file content string using the given preset.
 * This is useful for scaffolding new test directories.
 *
 * Usage:
 *   const content = generateFixtureFile(PRESETS.standard);
 *   fs.writeFileSync('tests/ai/my-feature/fixture.ts', content);
 */
export function generateFixtureFile(
  preset: FixturePreset,
  options?: { customImportPath?: string },
): string {
  const importPath = options?.customImportPath ?? '@midscene/web/playwright';

  const optionEntries: string[] = [];

  if (preset.waitForNetworkIdleTimeout !== undefined) {
    optionEntries.push(
      `    waitForNetworkIdleTimeout: ${preset.waitForNetworkIdleTimeout},`,
    );
  }
  if (preset.waitForNavigationTimeout !== undefined) {
    optionEntries.push(
      `    waitForNavigationTimeout: ${preset.waitForNavigationTimeout},`,
    );
  }
  if (preset.forceSameTabNavigation !== undefined) {
    optionEntries.push(
      `    forceSameTabNavigation: ${preset.forceSameTabNavigation},`,
    );
  }
  if (preset.cache !== undefined) {
    if (typeof preset.cache === 'object') {
      const cacheEntries = Object.entries(preset.cache)
        .map(([k, v]) => `${k}: '${v}'`)
        .join(', ');
      optionEntries.push(`    cache: { ${cacheEntries} },`);
    } else {
      optionEntries.push(`    cache: ${preset.cache},`);
    }
  }

  const optionsStr =
    optionEntries.length > 0 ? `{\n${optionEntries.join('\n')}\n  }` : '{}';

  return `import type { PlayWrightAiFixtureType } from '${importPath}';
import { PlaywrightAiFixture } from '${importPath}';
import { test as base } from '@playwright/test';

export const test = base.extend<PlayWrightAiFixtureType>(
  PlaywrightAiFixture(${optionsStr}),
);
`;
}

/**
 * Generates a spec file skeleton for a Playwright AI test.
 *
 * Usage:
 *   const content = generateSpecFile({
 *     name: 'login-flow',
 *     url: 'https://example.com/login',
 *     tasks: ['should login successfully', 'should show error for invalid credentials'],
 *   });
 */
export function generateSpecFile(config: {
  name: string;
  url: string;
  tasks: string[];
  fixturePath?: string;
  viewport?: { width: number; height: number };
}): string {
  const fixturePath = config.fixturePath ?? './fixture';
  const lines: string[] = [];

  lines.push(`import { test } from '${fixturePath}';`);
  lines.push('');
  lines.push('test.beforeEach(async ({ page }) => {');
  lines.push(`  await page.goto('${config.url}');`);
  if (config.viewport) {
    lines.push(
      `  await page.setViewportSize({ width: ${config.viewport.width}, height: ${config.viewport.height} });`,
    );
  }
  lines.push('});');
  lines.push('');
  lines.push(`test.describe('${config.name}', () => {`);

  for (const task of config.tasks) {
    lines.push(
      `  test('${task}', async ({ ai, aiAssert, aiTap, aiInput, aiQuery }) => {`,
    );
    lines.push('    // TODO: Implement test logic');
    lines.push('  });');
    lines.push('');
  }

  lines.push('});');
  lines.push('');

  return lines.join('\n');
}
