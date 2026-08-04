/**
 * Template: YAML Player Unit Test
 *
 * Copy this file to your tests/unit-test/ directory and customize.
 * Uses the mock agent factory to test YAML script behavior without real AI calls.
 *
 * Usage:
 *   import { createMockAgentSetup } from '@midscene/test-utils/mock-agent';
 */
import type { MidsceneYamlScriptWebEnv } from '@midscene/core';
import { ScriptPlayer, parseYamlScript } from '@midscene/core/yaml';
import { createMockAgentSetup } from '@midscene/test-utils/mock-agent';
import { describe, expect, test, vi } from 'vitest';

describe('YAML Player - Feature Name', () => {
  test('should execute the happy-path flow', async () => {
    const yamlString = `
target:
  url: "https://example.com"
tasks:
  - name: main_flow
    flow:
      - aiTap: "target element"
      - sleep: 500
      - aiAssert: "expected state is visible"
`;

    const script = parseYamlScript(yamlString);
    const setup = createMockAgentSetup();
    const player = new ScriptPlayer<MidsceneYamlScriptWebEnv>(script, setup);

    await player.run();

    // Verify execution completed
    expect(player.status).toBe('done');
    expect(player.errorInSetup).toBeUndefined();
    expect(player.taskStatusList[0].status).toBe('done');
    expect(player.taskStatusList[0].error).toBeUndefined();

    // Verify method calls
    const { methodCalls } = setup.getLastResult()!;
    expect(methodCalls.some((c) => c.method === 'aiAssert')).toBe(true);
  });

  test('should handle assertion failures', async () => {
    const yamlString = `
target:
  url: "https://example.com"
tasks:
  - name: failing_assertion
    flow:
      - aiAssert: "something that should fail"
`;

    const script = parseYamlScript(yamlString);
    const setup = createMockAgentSetup({ assertPass: false });
    const player = new ScriptPlayer<MidsceneYamlScriptWebEnv>(script, setup);

    await player.run();

    expect(player.status).toBe('done');
    expect(player.taskStatusList[0].status).toBe('error');
    expect(player.taskStatusList[0].error).toBeDefined();
  });

  test('should execute custom action', async () => {
    const customResult = { clicked: true };
    const yamlString = `
target:
  url: "https://example.com"
tasks:
  - name: custom_action
    flow:
      - aiTap: "specific button"
`;

    const script = parseYamlScript(yamlString);
    const setup = createMockAgentSetup({
      aiTap: async (...args) => customResult,
    });
    const player = new ScriptPlayer<MidsceneYamlScriptWebEnv>(script, setup);

    await player.run();

    expect(player.status).toBe('done');
  });
});
