/**
 * YAML Test Case Builder — type-safe, fluent API for constructing
 * YAML test scripts programmatically.
 *
 * Usage:
 *   import { YamlTestBuilder } from '@midscene/test-utils/yaml-builder';
 *
 *   const yaml = new YamlTestBuilder()
 *     .target({ url: 'https://example.com' })
 *     .task('login flow')
 *       .aiInput('user@test.com', 'email input')
 *       .aiInput('password123', 'password input')
 *       .aiTap('Login button')
 *       .aiAssert('Dashboard is visible')
 *     .task('search')
 *       .aiInput('search term', 'search box')
 *       .aiTap('Search button')
 *     .build();
 */

export interface YamlTargetConfig {
  url?: string;
  serve?: string;
  waitForNetworkIdle?: {
    timeout?: number;
    continueOnNetworkIdleError?: boolean;
  };
  viewportWidth?: number;
  viewportHeight?: number;
  output?: string;
  [key: string]: unknown;
}

export interface YamlAgentConfig {
  aiActContext?: string;
  [key: string]: unknown;
}

export type FlowItem =
  | { aiTap: string; deepLocate?: boolean; [key: string]: unknown }
  | { aiRightClick: string; deepLocate?: boolean; [key: string]: unknown }
  | {
      aiHover: string | { locate: { prompt: string; deepLocate?: boolean } };
      [key: string]: unknown;
    }
  | { aiInput: string; locate?: string; [key: string]: unknown }
  | { aiAssert: string; errorMessage?: string; [key: string]: unknown }
  | { aiQuery: string; name?: string; [key: string]: unknown }
  | { aiWaitFor: string; timeout?: number; [key: string]: unknown }
  | { aiAction: string; [key: string]: unknown }
  | { ai: string; [key: string]: unknown }
  | { sleep: number }
  | { javascript: string; name?: string }
  | { logScreenshot: string; content?: string }
  | { recordToReport: string; content?: string }
  | Record<string, unknown>;

export interface YamlTask {
  name: string;
  flow: FlowItem[];
}

export interface YamlScript {
  target?: YamlTargetConfig;
  web?: YamlTargetConfig;
  android?: Record<string, unknown>;
  ios?: Record<string, unknown>;
  agent?: YamlAgentConfig;
  tasks: YamlTask[];
}

/**
 * Task builder for fluent flow item composition.
 */
export class TaskBuilder {
  private flow: FlowItem[] = [];
  private parentBuilder: YamlTestBuilder;
  public readonly name: string;

  constructor(name: string, parent: YamlTestBuilder) {
    this.name = name;
    this.parentBuilder = parent;
  }

  /** Tap an element described by prompt */
  aiTap(prompt: string, options?: { deepLocate?: boolean }): TaskBuilder {
    this.flow.push({ aiTap: prompt, ...options });
    return this;
  }

  /** Right-click an element */
  aiRightClick(
    prompt: string,
    options?: { deepLocate?: boolean },
  ): TaskBuilder {
    this.flow.push({ aiRightClick: prompt, ...options });
    return this;
  }

  /** Hover over an element */
  aiHover(prompt: string, options?: { deepLocate?: boolean }): TaskBuilder {
    if (options?.deepLocate) {
      this.flow.push({ aiHover: { locate: { prompt, deepLocate: true } } });
    } else {
      this.flow.push({ aiHover: prompt });
    }
    return this;
  }

  /** Input text into a field */
  aiInput(value: string, locate?: string): TaskBuilder {
    const item: any = { aiInput: value };
    if (locate) item.locate = locate;
    this.flow.push(item);
    return this;
  }

  /** Assert a visual condition */
  aiAssert(prompt: string, errorMessage?: string): TaskBuilder {
    const item: any = { aiAssert: prompt };
    if (errorMessage) item.errorMessage = errorMessage;
    this.flow.push(item);
    return this;
  }

  /** Query data from the page */
  aiQuery(prompt: string, name?: string): TaskBuilder {
    const item: any = { aiQuery: prompt };
    if (name) item.name = name;
    this.flow.push(item);
    return this;
  }

  /** Wait for a condition to be true */
  aiWaitFor(prompt: string, timeout?: number): TaskBuilder {
    const item: any = { aiWaitFor: prompt };
    if (timeout) item.timeout = timeout;
    this.flow.push(item);
    return this;
  }

  /** Execute a general AI action */
  aiAction(prompt: string): TaskBuilder {
    this.flow.push({ aiAction: prompt });
    return this;
  }

  /** Execute using the `ai` shorthand */
  ai(prompt: string): TaskBuilder {
    this.flow.push({ ai: prompt });
    return this;
  }

  /** Sleep for a duration */
  sleep(ms: number): TaskBuilder {
    this.flow.push({ sleep: ms });
    return this;
  }

  /** Execute JavaScript */
  javascript(code: string, name?: string): TaskBuilder {
    const item: any = { javascript: code };
    if (name) item.name = name;
    this.flow.push(item);
    return this;
  }

  /** Log a screenshot to the report */
  logScreenshot(title: string, content?: string): TaskBuilder {
    const item: any = { logScreenshot: title };
    if (content) item.content = content;
    this.flow.push(item);
    return this;
  }

  /** Add a raw flow item (for custom/advanced actions) */
  raw(item: FlowItem): TaskBuilder {
    this.flow.push(item);
    return this;
  }

  /** Start a new task on the parent builder */
  task(name: string): TaskBuilder {
    return this.parentBuilder.task(name);
  }

  /** Build the complete YAML script */
  build(): string {
    return this.parentBuilder.build();
  }

  /** Build as a parsed script object */
  buildObject(): YamlScript {
    return this.parentBuilder.buildObject();
  }

  /** @internal Get the built flow items */
  getFlow(): FlowItem[] {
    return this.flow;
  }
}

/**
 * Main builder class for constructing YAML test scripts.
 */
export class YamlTestBuilder {
  private targetConfig?: YamlTargetConfig;
  private webConfig?: YamlTargetConfig;
  private androidConfig?: Record<string, unknown>;
  private iosConfig?: Record<string, unknown>;
  private agentConfig?: YamlAgentConfig;
  private tasks: TaskBuilder[] = [];

  /** Set the target configuration (generic) */
  target(config: YamlTargetConfig): YamlTestBuilder {
    this.targetConfig = config;
    return this;
  }

  /** Set the web target configuration */
  web(config: YamlTargetConfig): YamlTestBuilder {
    this.webConfig = config;
    return this;
  }

  /** Set the android target configuration */
  android(config: Record<string, unknown>): YamlTestBuilder {
    this.androidConfig = config;
    return this;
  }

  /** Set the iOS target configuration */
  ios(config: Record<string, unknown>): YamlTestBuilder {
    this.iosConfig = config;
    return this;
  }

  /** Set agent-level configuration */
  agent(config: YamlAgentConfig): YamlTestBuilder {
    this.agentConfig = config;
    return this;
  }

  /** Add a new task and return its builder for fluent chaining */
  task(name: string): TaskBuilder {
    const taskBuilder = new TaskBuilder(name, this);
    this.tasks.push(taskBuilder);
    return taskBuilder;
  }

  /** Build the script as a JS object */
  buildObject(): YamlScript {
    if (this.tasks.length === 0) {
      throw new Error('At least one task is required to build a YAML script');
    }

    const script: YamlScript = {
      tasks: this.tasks.map((t) => ({
        name: t.name,
        flow: t.getFlow(),
      })),
    };

    if (this.targetConfig) script.target = this.targetConfig;
    if (this.webConfig) script.web = this.webConfig;
    if (this.androidConfig) script.android = this.androidConfig;
    if (this.iosConfig) script.ios = this.iosConfig;
    if (this.agentConfig) script.agent = this.agentConfig;

    return script;
  }

  /** Build the script as a YAML string */
  build(): string {
    const script = this.buildObject();
    return objectToYaml(script);
  }
}

/**
 * Simple object-to-YAML serializer (no external dependency).
 * Handles the subset of structures used by Midscene YAML scripts.
 */
function objectToYaml(obj: any, indent = 0): string {
  const prefix = '  '.repeat(indent);

  if (obj === null || obj === undefined) {
    return 'null';
  }

  if (typeof obj === 'string') {
    // Quote strings that contain special characters
    if (
      obj.includes(':') ||
      obj.includes('#') ||
      obj.includes('\n') ||
      obj.includes('"') ||
      obj.includes("'") ||
      obj.startsWith(' ') ||
      obj.endsWith(' ') ||
      obj.startsWith('{') ||
      obj.startsWith('[') ||
      /^\d/.test(obj)
    ) {
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const lines: string[] = [];
    for (const item of obj) {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const entries = Object.entries(item);
        if (entries.length > 0) {
          const [firstKey, firstVal] = entries[0];
          const firstLine = `${prefix}- ${firstKey}: ${objectToYaml(firstVal, 0)}`;
          lines.push(firstLine);
          for (let i = 1; i < entries.length; i++) {
            const [key, val] = entries[i];
            if (typeof val === 'object' && val !== null) {
              lines.push(`${prefix}  ${key}:`);
              lines.push(objectToYaml(val, indent + 2));
            } else {
              lines.push(`${prefix}  ${key}: ${objectToYaml(val, 0)}`);
            }
          }
        }
      } else {
        lines.push(`${prefix}- ${objectToYaml(item, 0)}`);
      }
    }
    return lines.join('\n');
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';
    const lines: string[] = [];
    for (const [key, val] of entries) {
      if (typeof val === 'object' && val !== null) {
        lines.push(`${prefix}${key}:`);
        if (Array.isArray(val)) {
          lines.push(objectToYaml(val, indent + 1));
        } else {
          lines.push(objectToYaml(val, indent + 1));
        }
      } else {
        lines.push(`${prefix}${key}: ${objectToYaml(val, 0)}`);
      }
    }
    return lines.join('\n');
  }

  return String(obj);
}

/**
 * Shorthand factory for creating a simple web YAML test builder.
 *
 * Usage:
 *   const yaml = webTest('https://example.com')
 *     .task('login')
 *       .aiInput('admin', 'username field')
 *       .aiTap('Login')
 *     .build();
 */
export function webTest(
  url: string,
  options?: Omit<YamlTargetConfig, 'url'>,
): YamlTestBuilder {
  return new YamlTestBuilder().target({ url, ...options });
}

/**
 * Shorthand factory for creating a serve-based (local file) YAML test.
 *
 * Usage:
 *   const yaml = serveTest('./dist', 'index.html')
 *     .task('page loads')
 *       .aiAssert('Page content is visible')
 *     .build();
 */
export function serveTest(
  servePath: string,
  url: string,
  options?: Omit<YamlTargetConfig, 'serve' | 'url'>,
): YamlTestBuilder {
  return new YamlTestBuilder().target({ serve: servePath, url, ...options });
}
