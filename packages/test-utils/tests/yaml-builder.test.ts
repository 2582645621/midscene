import { describe, expect, test } from 'vitest';
import { YamlTestBuilder, serveTest, webTest } from '../src/yaml-builder';

describe('YamlTestBuilder', () => {
  test('builds a basic script object', () => {
    const builder = new YamlTestBuilder();
    const script = builder
      .target({ url: 'https://example.com' })
      .task('test task')
      .aiTap('button')
      .buildObject();

    expect(script.target).toEqual({ url: 'https://example.com' });
    expect(script.tasks).toHaveLength(1);
    expect(script.tasks[0].name).toBe('test task');
    expect(script.tasks[0].flow).toHaveLength(1);
    expect(script.tasks[0].flow[0]).toEqual({ aiTap: 'button' });
  });

  test('supports multiple tasks', () => {
    const script = new YamlTestBuilder()
      .target({ url: 'https://example.com' })
      .task('task 1')
      .aiTap('button 1')
      .task('task 2')
      .aiTap('button 2')
      .buildObject();

    expect(script.tasks).toHaveLength(2);
    expect(script.tasks[0].name).toBe('task 1');
    expect(script.tasks[1].name).toBe('task 2');
  });

  test('supports all flow item types', () => {
    const script = new YamlTestBuilder()
      .target({ url: 'https://example.com' })
      .task('comprehensive test')
      .aiTap('tap target')
      .aiRightClick('right-click target')
      .aiHover('hover target')
      .aiInput('value', 'input field')
      .aiAssert('condition')
      .aiQuery('query prompt', 'result_name')
      .aiWaitFor('wait condition', 5000)
      .aiAction('action description')
      .ai('shorthand action')
      .sleep(1000)
      .javascript('return document.title', 'title')
      .logScreenshot('snapshot')
      .buildObject();

    const flow = script.tasks[0].flow;
    expect(flow).toHaveLength(12);
    expect(flow[0]).toEqual({ aiTap: 'tap target' });
    expect(flow[1]).toEqual({ aiRightClick: 'right-click target' });
    expect(flow[2]).toEqual({ aiHover: 'hover target' });
    expect(flow[3]).toEqual({ aiInput: 'value', locate: 'input field' });
    expect(flow[4]).toEqual({ aiAssert: 'condition' });
    expect(flow[5]).toEqual({ aiQuery: 'query prompt', name: 'result_name' });
    expect(flow[6]).toEqual({ aiWaitFor: 'wait condition', timeout: 5000 });
    expect(flow[7]).toEqual({ aiAction: 'action description' });
    expect(flow[8]).toEqual({ ai: 'shorthand action' });
    expect(flow[9]).toEqual({ sleep: 1000 });
    expect(flow[10]).toEqual({
      javascript: 'return document.title',
      name: 'title',
    });
    expect(flow[11]).toEqual({ logScreenshot: 'snapshot' });
  });

  test('supports deep locate', () => {
    const script = new YamlTestBuilder()
      .target({ url: 'https://example.com' })
      .task('deep locate test')
      .aiTap('button', { deepLocate: true })
      .aiHover('element', { deepLocate: true })
      .buildObject();

    const flow = script.tasks[0].flow;
    expect(flow[0]).toEqual({ aiTap: 'button', deepLocate: true });
    expect(flow[1]).toEqual({
      aiHover: { locate: { prompt: 'element', deepLocate: true } },
    });
  });

  test('builds YAML string output', () => {
    const yaml = new YamlTestBuilder()
      .target({ url: 'https://example.com' })
      .task('basic test')
      .sleep(1000)
      .aiAssert('page is loaded')
      .build();

    expect(yaml).toContain('target:');
    expect(yaml).toContain('url: "https://example.com"');
    expect(yaml).toContain('tasks:');
    expect(yaml).toContain('name: basic test');
    expect(yaml).toContain('sleep: 1000');
    expect(yaml).toContain('aiAssert: page is loaded');
  });

  test('throws when no tasks defined', () => {
    const builder = new YamlTestBuilder().target({
      url: 'https://example.com',
    });
    expect(() => builder.build()).toThrow('At least one task is required');
  });

  test('supports agent config', () => {
    const script = new YamlTestBuilder()
      .target({ url: 'https://example.com' })
      .agent({ aiActContext: 'This is a shopping website' })
      .task('test')
      .aiTap('button')
      .buildObject();

    expect(script.agent).toEqual({
      aiActContext: 'This is a shopping website',
    });
  });

  test('supports raw flow items', () => {
    const script = new YamlTestBuilder()
      .target({ url: 'https://example.com' })
      .task('custom action')
      .raw({ customAction: 'custom param', option1: true })
      .buildObject();

    expect(script.tasks[0].flow[0]).toEqual({
      customAction: 'custom param',
      option1: true,
    });
  });
});

describe('shorthand factories', () => {
  test('webTest creates a URL-based builder', () => {
    const script = webTest('https://example.com')
      .task('test')
      .aiAssert('page loaded')
      .buildObject();

    expect(script.target?.url).toBe('https://example.com');
  });

  test('webTest accepts additional options', () => {
    const script = webTest('https://example.com', {
      viewportWidth: 1920,
      viewportHeight: 1080,
    })
      .task('test')
      .aiAssert('page loaded')
      .buildObject();

    expect(script.target?.url).toBe('https://example.com');
    expect(script.target?.viewportWidth).toBe(1920);
  });

  test('serveTest creates a serve-based builder', () => {
    const script = serveTest('./dist', 'index.html')
      .task('test')
      .aiAssert('content loaded')
      .buildObject();

    expect(script.target?.serve).toBe('./dist');
    expect(script.target?.url).toBe('index.html');
  });
});
