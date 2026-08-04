# @midscene/test-utils

Shared test utilities for the Midscene monorepo. Reduces boilerplate, improves maintainability, and makes it easy to add new test cases.

## Modules

### Mock Agent Factory (`@midscene/test-utils/mock-agent`)

Configurable mock agent that replaces verbose manual mocking in YAML player tests.

```ts
import { createMockAgentSetup } from '@midscene/test-utils/mock-agent';
import { ScriptPlayer, parseYamlScript } from '@midscene/core/yaml';

// Basic usage - all methods tracked automatically
const setup = createMockAgentSetup();
const player = new ScriptPlayer(script, setup);
await player.run();

// Access tracked calls
const { methodCalls } = setup.getLastResult()!;
expect(methodCalls[0].method).toBe('aiTap');

// With overrides
const setup = createMockAgentSetup({
  assertPass: false,                    // aiAssert returns failure
  aiTap: async (prompt) => ({ ... }),   // custom behavior
});

// With vitest mocks
import { vi } from 'vitest';
import { createVitestMockAgentSetup } from '@midscene/test-utils/mock-agent';
const setup = createVitestMockAgentSetup(vi, { assertPass: true });
```

### YAML Test Builder (`@midscene/test-utils/yaml-builder`)

Type-safe, fluent API for constructing YAML test scripts programmatically.

```ts
import { webTest, serveTest, YamlTestBuilder } from '@midscene/test-utils/yaml-builder';

// Quick web test
const yaml = webTest('https://example.com')
  .task('login')
    .aiInput('admin', 'username field')
    .aiInput('password', 'password field')
    .aiTap('Login button')
    .aiAssert('Dashboard is visible')
  .task('navigate')
    .aiTap('Settings menu')
  .build();

// Local serve test
const yaml = serveTest('./dist', 'index.html')
  .task('page loads')
    .sleep(2000)
    .aiAssert('Content is visible')
  .build();

// Build as object (for ScriptPlayer)
const script = new YamlTestBuilder()
  .target({ url: 'https://example.com' })
  .task('test')
    .aiTap('button')
  .buildObject();
```

### Playwright Presets (`@midscene/test-utils/playwright-presets`)

Pre-configured fixture factories and file generators.

```ts
import { PRESETS, generateFixtureFile, generateSpecFile } from '@midscene/test-utils/playwright-presets';

// Generate a fixture.ts file
const fixtureContent = generateFixtureFile(PRESETS.standard);
// Options: standard, development, ci, spa, static, multiTab

// Generate a spec skeleton
const specContent = generateSpecFile({
  name: 'checkout-flow',
  url: 'https://shop.example.com',
  tasks: ['should add to cart', 'should complete checkout'],
});
```

### Fixture Helpers (`@midscene/test-utils/fixtures`)

Common test utilities consolidated from across the monorepo.

```ts
import {
  readFixture,
  readJsonFixture,
  retryUntilValid,
  sleep,
  waitForCondition,
} from '@midscene/test-utils/fixtures';

// Read test fixtures
const html = readFixture(__dirname, 'page.html');
const data = readJsonFixture<MyType>(__dirname, 'expected.json');

// Retry with validation (for AI query non-determinism)
const tasks = await retryUntilValid(
  () => aiQuery('string[], list of todo items'),
  (result) => result.length >= 3,
  3,    // max attempts
  1000, // delay between attempts
);

// Wait for async condition
await waitForCondition(() => element.isVisible(), 5000);
```

## Templates

Copy-ready scaffolding files in `templates/`:

| Template | Use Case |
|----------|----------|
| `yaml-web-e2e.yaml` | Web E2E test via YAML |
| `yaml-android-e2e.yaml` | Android E2E test via YAML |
| `yaml-report-e2e.yaml` | Report app E2E test |
| `playwright-ai-spec.ts.tpl` | Playwright AI spec file |
| `playwright-fixture.ts.tpl` | Playwright AI fixture |
| `unit-test-basic.ts.tpl` | Basic vitest unit test |
| `unit-test-yaml-player.ts.tpl` | YAML player unit test with mock agent |

## Adding to Your Package

In your package's `package.json`:

```json
{
  "devDependencies": {
    "@midscene/test-utils": "workspace:*"
  }
}
```

## Comparison: Before & After

### Before (YAML player test)

```ts
// ~70 lines of manual mock setup
const getMockAgent = async () => {
  const methodCalls = [];
  return {
    agent: {
      aiTap: vi.fn(async (...args) => { methodCalls.push({...}); return {}; }),
      aiRightClick: vi.fn(async (...args) => { methodCalls.push({...}); return {}; }),
      aiHover: vi.fn(...),
      aiInput: vi.fn(...),
      aiScroll: vi.fn(...),
      // ... many more
      reportFile: null,
      dump,
      getActionSpace: async () => actionSpace,
    },
    freeFn: [],
    methodCalls,
  };
};
```

### After

```ts
import { createMockAgentSetup } from '@midscene/test-utils/mock-agent';

const setup = createMockAgentSetup();
const player = new ScriptPlayer(script, setup);
await player.run();
const { methodCalls } = setup.getLastResult()!;
```
