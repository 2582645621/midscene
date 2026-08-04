import path from 'node:path';
import dotenv from 'dotenv';
// 显式加载项目根目录的 .env（相对脚本位置解析，保证任意 cwd 下运行都能读到模型配置）
dotenv.config({
  path: path.join(__dirname, '..', '..', '..', '.env'),
  override: true,
});
import {
  AndroidAgent,
  AndroidDevice,
  getConnectedDevices,
} from '@midscene/android';

const ANYCUBIC_LAUNCHER = 'ac.cloud.com/.StartActivity';

Promise.resolve(
  (async () => {
    const devices = await getConnectedDevices();
    const device = new AndroidDevice(devices[0].udid);
    const agent = new AndroidAgent(device, {
      aiActionContext:
        'If any location, permission, user agreement, etc. popup, click agree. If login page pops up, close it.',
    });
    await device.connect();
    // 唤醒并保持屏幕常亮，避免息屏导致截图全黑、AI 误判为黑屏
    await agent.runAdbShell(
      'input keyevent KEYCODE_WAKEUP; wm dismiss-keyguard; svc power stayon true',
    );

    await agent.launch(ANYCUBIC_LAUNCHER);
    await agent.aiAct('wait for the app home page to load');
    await agent.aiAct('go to the printer/control');
    await agent.aiAct('connect the printer if it is not connected');

    const printers = await agent.aiQuery(
      '{printerName: string, status: string}[], list the printers shown on screen',
    );
    console.log('printers:', printers);

    await agent.aiAssert('the screen shows a printer name and its status');

    // 恢复屏幕常亮设置
    await agent.runAdbShell('svc power stayon false');
    process.exit(0);
  })(),
).catch((e) => {
  console.error('Anycubic demo failed:', e);
  process.exit(1);
});
