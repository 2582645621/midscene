/**
 * Mock Agent Factory for YAML player tests and integration tests.
 *
 * Usage:
 *   import { createMockAgent, createMockAgentSetup } from '@midscene/test-utils/mock-agent';
 *
 *   // Quick usage with defaults:
 *   const { agent, freeFn, methodCalls } = await createMockAgent();
 *
 *   // With custom overrides:
 *   const { agent, freeFn, methodCalls } = await createMockAgent({
 *     aiTap: async (prompt) => { ... },
 *     reportFile: '/path/to/report',
 *   });
 *
 *   // As a setup function for ScriptPlayer:
 *   const player = new ScriptPlayer(script, createMockAgentSetup());
 */

import type { DeviceAction, ReportActionDump } from '@midscene/core';

type MethodCall = { method: string; args: any[] };

export interface MockAgentOverrides {
  /** Override specific agent methods */
  aiTap?: (...args: any[]) => Promise<any>;
  aiRightClick?: (...args: any[]) => Promise<any>;
  aiHover?: (...args: any[]) => Promise<any>;
  aiInput?: (...args: any[]) => Promise<any>;
  aiScroll?: (...args: any[]) => Promise<any>;
  aiKeyboardPress?: (...args: any[]) => Promise<any>;
  aiAction?: (...args: any[]) => Promise<any>;
  aiAct?: (...args: any[]) => Promise<any>;
  aiAssert?: (...args: any[]) => Promise<any>;
  aiQuery?: (...args: any[]) => Promise<any>;
  aiWaitFor?: (...args: any[]) => Promise<any>;
  evaluateJavaScript?: (...args: any[]) => Promise<any>;
  recordToReport?: (...args: any[]) => Promise<any>;
  /** Custom report file path */
  reportFile?: string | null;
  /** Custom dump data */
  dump?: ReportActionDump;
  /** Custom action space */
  actionSpace?: DeviceAction[];
  /** Whether aiAssert should pass by default */
  assertPass?: boolean;
}

export interface MockAgentResult {
  agent: any;
  freeFn: Array<{ fn: () => Promise<void>; description?: string }>;
  methodCalls: MethodCall[];
  actionSpace: DeviceAction[];
}

/**
 * Default action space used by the mock agent
 */
export function createDefaultActionSpace(
  mockFn: () => (...args: any[]) => any,
): DeviceAction[] {
  return [
    { name: 'Tap', interfaceAlias: 'aiTap', call: mockFn() },
    { name: 'RightClick', interfaceAlias: 'aiRightClick', call: mockFn() },
    { name: 'Hover', interfaceAlias: 'aiHover', call: mockFn() },
    { name: 'Input', interfaceAlias: 'aiInput', call: mockFn() },
    { name: 'Scroll', interfaceAlias: 'aiScroll', call: mockFn() },
    {
      name: 'KeyboardPress',
      interfaceAlias: 'aiKeyboardPress',
      call: mockFn(),
    },
  ];
}

/**
 * Default dump structure for tests
 */
export function createDefaultDump(): ReportActionDump {
  return {
    executions: [],
    logTime: Date.now(),
    model: 'mock-model',
    modelDescription: 'Mock model for testing',
  } as unknown as ReportActionDump;
}

/**
 * Creates a mock agent with configurable behavior.
 * All method calls are tracked in the returned `methodCalls` array.
 *
 * @param overrides - Optional overrides for agent methods and properties
 * @param mockFn - Mock function factory (defaults to a no-op function factory)
 */
export async function createMockAgent(
  overrides: MockAgentOverrides = {},
  mockFn?: () => (...args: any[]) => any,
): Promise<MockAgentResult> {
  const methodCalls: MethodCall[] = [];

  // Default mock function factory (simple tracking fn if no framework provided)
  const createMock =
    mockFn ??
    (() => {
      const fn = (...args: any[]) => {
        (fn as any).__calls = (fn as any).__calls || [];
        (fn as any).__calls.push(args);
        return Promise.resolve({});
      };
      (fn as any).__calls = [];
      return fn;
    });

  const actionSpace =
    overrides.actionSpace ?? createDefaultActionSpace(createMock);
  const dump = overrides.dump ?? createDefaultDump();
  const assertPass = overrides.assertPass ?? true;

  const trackCall =
    (method: string, impl?: (...args: any[]) => Promise<any>) =>
    async (...args: any[]) => {
      methodCalls.push({ method, args });
      if (impl) return impl(...args);
      return {};
    };

  const agent = {
    aiTap: overrides.aiTap ?? trackCall('aiTap'),
    aiRightClick: overrides.aiRightClick ?? trackCall('aiRightClick'),
    aiHover: overrides.aiHover ?? trackCall('aiHover'),
    aiInput: overrides.aiInput ?? trackCall('aiInput'),
    aiScroll: overrides.aiScroll ?? trackCall('aiScroll'),
    aiKeyboardPress: overrides.aiKeyboardPress ?? trackCall('aiKeyboardPress'),
    aiAction: overrides.aiAction ?? trackCall('aiAction'),
    aiAct: overrides.aiAct ?? trackCall('aiAct'),
    aiAssert:
      overrides.aiAssert ??
      trackCall('aiAssert', async () => ({
        pass: assertPass,
        thought: 'mock assertion',
        message: assertPass ? undefined : 'mock assertion failed',
      })),
    aiQuery:
      overrides.aiQuery ??
      trackCall('aiQuery', async () => 'mock query result'),
    aiWaitFor: overrides.aiWaitFor ?? trackCall('aiWaitFor'),
    evaluateJavaScript:
      overrides.evaluateJavaScript ??
      trackCall('evaluateJavaScript', async () => undefined),
    recordToReport: overrides.recordToReport ?? trackCall('recordToReport'),
    reportFile: overrides.reportFile ?? null,
    onTaskStartTip: undefined,
    _unstableLogContent: createMock(),
    dump,
    callActionInActionSpace: createMock(),
    getActionSpace: async () => actionSpace,
    destroy: async () => {},
  };

  return {
    agent,
    freeFn: [],
    methodCalls,
    actionSpace,
  };
}

/**
 * Creates a setup function compatible with ScriptPlayer constructor.
 * This is the primary way to use the mock agent with YAML player tests.
 *
 * Usage:
 *   const player = new ScriptPlayer(script, createMockAgentSetup());
 *   const player = new ScriptPlayer(script, createMockAgentSetup({ assertPass: false }));
 */
export function createMockAgentSetup(
  overrides: MockAgentOverrides = {},
  mockFn?: () => (...args: any[]) => any,
) {
  let lastResult: MockAgentResult | null = null;

  const setup = async () => {
    lastResult = await createMockAgent(overrides, mockFn);
    return { agent: lastResult.agent, freeFn: lastResult.freeFn };
  };

  // Expose access to the last created mock for assertions
  setup.getLastResult = () => lastResult;

  return setup;
}

/**
 * Creates a mock agent setup that uses vitest's vi.fn() for mocking.
 * Import `vi` from vitest in your test file and pass it here.
 *
 * Usage:
 *   import { vi } from 'vitest';
 *   import { createVitestMockAgentSetup } from '@midscene/test-utils/mock-agent';
 *
 *   const setup = createVitestMockAgentSetup(vi);
 *   const player = new ScriptPlayer(script, setup);
 */
export function createVitestMockAgentSetup(
  vi: { fn: () => any },
  overrides: MockAgentOverrides = {},
) {
  return createMockAgentSetup(overrides, () => vi.fn());
}
