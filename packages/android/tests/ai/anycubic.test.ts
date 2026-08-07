import { sleep } from '@midscene/core/utils';
import { afterAll, beforeAll, describe, it, vi } from 'vitest';
import { AndroidAgent, AndroidDevice, getConnectedDevices } from '../../src';

vi.setConfig({
  testTimeout: 240 * 1000,
  hookTimeout: 60 * 1000,
});

const ANYCUBIC_LAUNCHER = 'ac.cloud.com/.StartActivity';

describe('Anycubic app', () => {
  let agent: AndroidAgent;

  beforeAll(async () => {
    const devices = await getConnectedDevices();
    const page = new AndroidDevice(devices[0].udid);
    agent = new AndroidAgent(page, {
      aiActionContext:
        'If any location, permission, user agreement, etc. popup, click agree. If login page pops up, close it.',
    });
    await page.connect();
    // 唤醒并保持屏幕常亮，避免息屏导致截图全黑、AI 误判为黑屏
    await agent.runAdbShell(
      'input keyevent KEYCODE_WAKEUP; wm dismiss-keyguard; svc power stayon true',
    );
  });

  afterAll(async () => {
    await agent?.runAdbShell('svc power stayon false');
  });

  it(
    'anycubic navigation flow',
    async () => {
      await agent.launch(ANYCUBIC_LAUNCHER);
      await agent.aiAct('wait for the app home page to load');

      // 点击“控制”，随后用 Android 返回键回到首页
      await agent.aiTap('控制');
      await sleep(2000);
      await agent.aiTap('喷嘴');
      
      await agent.runAdbShell('input keyevent KEYCODE_BACK');
      await sleep(2000);

      // 点击“模型库”
      await agent.aiTap('模型库');
      await sleep(2000);

      // 点击“我的”，进入个人中心
      await agent.aiTap('我的');
      await sleep(2000);

      // 点击“我的订单”
      await agent.aiTap('我的订单');
      await agent.aiAct('wait for the my orders page to load');
      await agent.aiAssert('the screen shows the "My Orders" page');
    },
    720 * 1000,
  );
});
