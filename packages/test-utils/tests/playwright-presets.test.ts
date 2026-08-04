import { describe, expect, test } from 'vitest';
import {
  PRESETS,
  generateFixtureFile,
  generateSpecFile,
} from '../src/playwright-presets';

describe('PRESETS', () => {
  test('all presets have required fields', () => {
    for (const [key, preset] of Object.entries(PRESETS)) {
      expect(preset.name).toBe(key);
      expect(preset.description).toBeTruthy();
    }
  });

  test('standard preset has balanced configuration', () => {
    expect(PRESETS.standard.waitForNetworkIdleTimeout).toBe(10000);
    expect(PRESETS.standard.forceSameTabNavigation).toBe(true);
  });

  test('ci preset has longer timeouts and cache', () => {
    expect(PRESETS.ci.waitForNetworkIdleTimeout).toBeGreaterThan(
      PRESETS.standard.waitForNetworkIdleTimeout!,
    );
    expect(PRESETS.ci.cache).toEqual({ strategy: 'read-write' });
  });
});

describe('generateFixtureFile', () => {
  test('generates valid fixture file content', () => {
    const content = generateFixtureFile(PRESETS.standard);
    expect(content).toContain('import type { PlayWrightAiFixtureType }');
    expect(content).toContain('import { PlaywrightAiFixture }');
    expect(content).toContain('import { test as base }');
    expect(content).toContain('base.extend<PlayWrightAiFixtureType>');
    expect(content).toContain('waitForNetworkIdleTimeout: 10000');
  });

  test('supports custom import path', () => {
    const content = generateFixtureFile(PRESETS.standard, {
      customImportPath: '@/playwright/ai-fixture',
    });
    expect(content).toContain("from '@/playwright/ai-fixture'");
  });

  test('includes cache config when present', () => {
    const content = generateFixtureFile(PRESETS.ci);
    expect(content).toContain('cache:');
    expect(content).toContain('read-write');
  });
});

describe('generateSpecFile', () => {
  test('generates valid spec file content', () => {
    const content = generateSpecFile({
      name: 'login-flow',
      url: 'https://example.com/login',
      tasks: ['should login successfully', 'should handle errors'],
    });

    expect(content).toContain("import { test } from './fixture'");
    expect(content).toContain("page.goto('https://example.com/login')");
    expect(content).toContain("test.describe('login-flow'");
    expect(content).toContain("test('should login successfully'");
    expect(content).toContain("test('should handle errors'");
    expect(content).toContain('ai, aiAssert, aiTap, aiInput, aiQuery');
  });

  test('includes viewport when specified', () => {
    const content = generateSpecFile({
      name: 'responsive',
      url: 'https://example.com',
      tasks: ['test'],
      viewport: { width: 1920, height: 1080 },
    });

    expect(content).toContain('setViewportSize({ width: 1920, height: 1080 })');
  });

  test('uses custom fixture path', () => {
    const content = generateSpecFile({
      name: 'test',
      url: 'https://example.com',
      tasks: ['test'],
      fixturePath: '../shared/fixture',
    });

    expect(content).toContain("from '../shared/fixture'");
  });
});
