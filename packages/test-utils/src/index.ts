/**
 * @midscene/test-utils
 *
 * Shared test utilities for the Midscene monorepo.
 * Provides mock factories, fixture helpers, YAML builders, and Playwright presets.
 *
 * Entry points:
 *   - '@midscene/test-utils'              — all exports
 *   - '@midscene/test-utils/mock-agent'   — mock agent factory
 *   - '@midscene/test-utils/yaml-builder' — YAML test builder
 *   - '@midscene/test-utils/playwright-presets' — fixture presets
 *   - '@midscene/test-utils/fixtures'     — common test helpers
 */

export {
  createMockAgent,
  createMockAgentSetup,
  createVitestMockAgentSetup,
  createDefaultActionSpace,
  createDefaultDump,
  type MockAgentOverrides,
  type MockAgentResult,
} from './mock-agent';

export {
  YamlTestBuilder,
  TaskBuilder,
  webTest,
  serveTest,
  type YamlTargetConfig,
  type YamlAgentConfig,
  type YamlScript,
  type YamlTask,
  type FlowItem,
} from './yaml-builder';

export {
  PRESETS,
  generateFixtureFile,
  generateSpecFile,
  type FixturePreset,
} from './playwright-presets';

export {
  getFixturePath,
  readFixture,
  readJsonFixture,
  writeTestOutput,
  sleep,
  retryUntilValid,
  createTestOutputDir,
  waitForCondition,
} from './fixtures';
