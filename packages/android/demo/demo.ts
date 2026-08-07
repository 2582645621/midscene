import path from 'node:path';
import { sleep } from '@midscene/core/utils';
import dotenv from 'dotenv';
import { AndroidAgent, AndroidDevice, getConnectedDevices } from '../src';

// 显式加载项目根目录的 .env（相对脚本位置解析，保证任意 cwd 下运行都能读到模型配置）
dotenv.config({
  path: path.join(__dirname, '..', '..', '..', '.env'),
  override: true,
});

async function main() {
  const devices = await getConnectedDevices();
  if (devices.length === 0) {
    throw new Error(
      'No Android devices found. Connect a device and run `adb devices` to verify.',
    );
  }

  const device = new AndroidDevice(devices[0].udid, {
    imeStrategy: 'always-yadb',
  });
  const agent = new AndroidAgent(device, {
    aiActionContext:
      'If any location, permission, user agreement, etc. popup, click agree. If login page pops up, close it.',
    cache: {
      id: 'my-android-test-cache', // 缓存ID，用于区分不同场景的缓存
      strategy: 'read-write', // 读写模式（默认）
    },
  });
  await device.connect();

  // await agent.aiAct('open the browser, type "eBay.com" in the search box and hit Enter',);
  await agent.aiAct('open the browser');
  await agent.aiInput('搜索输入框', { value: 'eBay.com' });
  await sleep(5000);
  await agent.aiAct('type "Headphones" in search box, hit Enter');
  await agent.aiWaitFor('There is at least one headphone product');

  const items = await agent.aiQuery(
    '{itemTitle: string, price: Number}[], find item in list and corresponding price',
  );
  console.log('headphones in stock', items);

  await agent.aiAssert('There is a category filter on the left');
}

main().catch((err) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
