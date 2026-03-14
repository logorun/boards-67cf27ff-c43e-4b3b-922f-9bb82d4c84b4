/**
 * Fruugo反爬策略测试
 * 
 * 测试流程：
 * 1. 打开Fruugo店铺页面
 * 2. 接受Cookies
 * 3. 选择留在当前页面
 * 4. 刷新并获取产品列表
 */

const Browser = require('./src/browser');

async function testFruugo() {
  console.log('=== Fruugo反爬策略测试 ===\n');
  
  const browser = new Browser({ timeout: 60000 });
  
  // 测试URL（使用一个示例merchantId）
  const testUrl = 'https://www.fruugo.co.uk/search?merchantId=12345&page=1&pageSize=128';
  
  try {
    // 步骤1：打开页面
    console.log('步骤1: 打开Fruugo页面...');
    console.log('  URL:', testUrl);
    await browser.open(testUrl);
    console.log('✓ 页面打开成功\n');
    
    // 等待页面加载
    await browser.wait(2000);
    
    // 步骤2：获取快照查看页面结构
    console.log('步骤2: 获取页面快照...');
    const snapshot = await browser.snapshot();
    console.log('✓ 快照获取成功');
    console.log('  快照长度:', snapshot.length, '字符\n');
    
    // 分析快照内容
    if (snapshot.includes('cookie') || snapshot.includes('Cookie')) {
      console.log('  ⚠ 检测到Cookie弹窗');
    }
    
    // 截图保存当前状态
    console.log('步骤3: 保存截图...');
    await browser.screenshot('fruugo-initial.png');
    console.log('✓ 截图保存到 fruugo-initial.png\n');
    
    // 获取当前URL（检查是否被重定向）
    console.log('步骤4: 检查URL...');
    const currentUrl = await browser.getUrl();
    console.log('  当前URL:', currentUrl, '\n');
    
    // 获取HTML分析页面内容
    console.log('步骤5: 获取页面HTML...');
    const html = await browser.getHtml('body');
    console.log('✓ HTML获取成功');
    console.log('  HTML长度:', html.length, '字符\n');
    
    // 检查是否有产品列表
    if (html.includes('product') || html.includes('item')) {
      console.log('  ✓ 检测到产品内容');
    } else {
      console.log('  ⚠ 未检测到产品内容，可能需要处理Cookie弹窗');
    }
    
    console.log('\n=== 测试完成 ===');
    console.log('\n后续步骤：');
    console.log('1. 分析快照和HTML，找到Cookie弹窗的按钮');
    console.log('2. 使用 browser.click() 点击"接受Cookies"');
    console.log('3. 点击"留在当前页面"（如果有地区选择）');
    console.log('4. 刷新页面获取完整内容');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n关闭浏览器...');
    await browser.close();
    console.log('✓ 浏览器已关闭');
  }
}

// 运行测试
testFruugo().catch(console.error);
