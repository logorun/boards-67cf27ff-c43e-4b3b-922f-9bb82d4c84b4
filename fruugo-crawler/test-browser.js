/**
 * agent-browser基本功能测试
 */

const Browser = require('./src/browser');

async function testBasicFunctionality() {
  console.log('=== agent-browser功能测试 ===\n');
  
  const browser = new Browser({ timeout: 30000 });
  
  try {
    // 测试1：打开页面
    console.log('测试1: 打开example.com...');
    await browser.open('https://example.com');
    console.log('✓ 页面打开成功\n');
    
    // 测试2：获取快照
    console.log('测试2: 获取页面快照...');
    const snapshot = await browser.snapshot();
    console.log('✓ 快照获取成功');
    console.log('  快照长度:', snapshot.length, '字符\n');
    
    // 测试3：获取标题
    console.log('测试3: 获取页面URL...');
    const url = await browser.getUrl();
    console.log('✓ 当前URL:', url, '\n');
    
    // 测试4：截图
    console.log('测试4: 截图...');
    await browser.screenshot('test-screenshot.png');
    console.log('✓ 截图保存到 test-screenshot.png\n');
    
    // 测试5：获取HTML
    console.log('测试5: 获取页面HTML...');
    const html = await browser.getHtml('body');
    console.log('✓ HTML获取成功');
    console.log('  HTML长度:', html.length, '字符\n');
    
    console.log('=== 所有测试通过 ===');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    // 关闭浏览器
    console.log('\n关闭浏览器...');
    await browser.close();
    console.log('✓ 浏览器已关闭');
  }
}

// 运行测试
testBasicFunctionality().catch(console.error);
