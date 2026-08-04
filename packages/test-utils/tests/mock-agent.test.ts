import { describe, expect, test } from 'vitest';
import { createMockAgent, createMockAgentSetup } from '../src/mock-agent';

describe('createMockAgent', () => {
  test('creates agent with all standard methods', async () => {
    const { agent } = await createMockAgent();
    expect(agent.aiTap).toBeDefined();
    expect(agent.aiRightClick).toBeDefined();
    expect(agent.aiHover).toBeDefined();
    expect(agent.aiInput).toBeDefined();
    expect(agent.aiScroll).toBeDefined();
    expect(agent.aiKeyboardPress).toBeDefined();
    expect(agent.aiAction).toBeDefined();
    expect(agent.aiAssert).toBeDefined();
    expect(agent.aiQuery).toBeDefined();
    expect(agent.aiWaitFor).toBeDefined();
    expect(agent.evaluateJavaScript).toBeDefined();
    expect(agent.recordToReport).toBeDefined();
    expect(agent.getActionSpace).toBeDefined();
  });

  test('tracks method calls', async () => {
    const { agent, methodCalls } = await createMockAgent();
    await agent.aiTap('button');
    await agent.aiInput('text', 'field');

    expect(methodCalls).toHaveLength(2);
    expect(methodCalls[0]).toEqual({ method: 'aiTap', args: ['button'] });
    expect(methodCalls[1]).toEqual({
      method: 'aiInput',
      args: ['text', 'field'],
    });
  });

  test('aiAssert passes by default', async () => {
    const { agent } = await createMockAgent();
    const result = await agent.aiAssert('something is visible');
    expect(result.pass).toBe(true);
  });

  test('aiAssert fails when configured', async () => {
    const { agent } = await createMockAgent({ assertPass: false });
    const result = await agent.aiAssert('something is visible');
    expect(result.pass).toBe(false);
    expect(result.message).toBeDefined();
  });

  test('allows method overrides', async () => {
    const customResult = { custom: true };
    const { agent } = await createMockAgent({
      aiTap: async () => customResult,
    });
    const result = await agent.aiTap('button');
    expect(result).toEqual(customResult);
  });

  test('returns action space', async () => {
    const { agent, actionSpace } = await createMockAgent();
    const space = await agent.getActionSpace();
    expect(space).toBe(actionSpace);
    expect(space.length).toBeGreaterThan(0);
    expect(space.find((a: any) => a.name === 'Tap')).toBeDefined();
  });
});

describe('createMockAgentSetup', () => {
  test('returns an async setup function', async () => {
    const setup = createMockAgentSetup();
    const result = await setup();
    expect(result.agent).toBeDefined();
    expect(result.freeFn).toBeDefined();
  });

  test('getLastResult provides access to the mock', async () => {
    const setup = createMockAgentSetup();
    expect(setup.getLastResult()).toBeNull();
    await setup();
    const result = setup.getLastResult();
    expect(result).not.toBeNull();
    expect(result?.methodCalls).toBeDefined();
  });

  test('passes overrides through', async () => {
    const setup = createMockAgentSetup({ assertPass: false });
    const { agent } = await setup();
    const result = await agent.aiAssert('test');
    expect(result.pass).toBe(false);
  });
});
