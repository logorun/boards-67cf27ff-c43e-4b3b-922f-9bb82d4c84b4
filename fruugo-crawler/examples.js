/**
 * agent-browser使用示例
 */

const Browser = require('./src/browser');

async function example1() {
  console.log('示例1：基本页面访问');
  console.log('===================\n');
  
  const browser = new Browser();
  
  try {
    // 打开页面
    await browser.open('https://example.com');
    console.log('✓ 页面已打开');
    
    // 获取快照
    const snapshot = await browser.snapshot();
    console.log('✓ 快照已获取');
    console.log('快照片段:', snapshot.substring(0, 200) + '...\n');
    
    // 获取URL
    const url = await browser.getUrl();
    console.log('当前URL:', url);
    
    // 获取HTML
    const html = await browser.getHtml('body');
    console.log('HTML长度:', html.length, '字符\n');
    
  } finally {
    await browser.close();
  }
}

async function example2() {
  console.log('示例2：使用语义化查找');
  console.log('======================\n');
  
  const browser = new Browser();
  
  try {
    await browser.open('https://example.com');
    
    // 使用find命令查找元素
    // 注意：需要根据实际页面结构调整
    
    // 按文本查找
    // await browser.find('text', 'More information', 'click');
    
    // 按ARIA角色查找
    // await browser.find('role', 'link', 'click', '--name', 'More information');
    
    console.log('✓ 语义化查找示例（需要实际页面测试）\n');
    
  } finally {
    await browser.close();
  }
}

async function example3() {
  console.log('示例3：等待和交互');
  console.log('==================\n');
  
  const browser = new Browser();
  
  try {
    await browser.open('https://example.com');
    
    // 等待时间
    await browser.wait(2000);
    console.log('✓ 等待2秒完成');
    
    // 等待元素
    // await browser.wait('#some-element');
    
    // 等待文本出现
    // await browser.wait('--text', 'Welcome');
    
    // 等待网络空闲
    // await browser.wait('--load', 'networkidle');
    
    console.log('✓ 等待示例完成\n');
    
  } finally {
    await browser.close();
  }
}

async function example4() {
  console.log('示例4：截图和PDF');
  console.log('=================\n');
  
  const browser = new Browser();
  
  try {
    await browser.open('https://example.com');
    
    // 截图
    await browser.screenshot('example-screenshot.png');
    console.log('✓ 截图已保存: example-screenshot.png');
    
    // PDF（如果需要）
    // const result = await browser.execAsync('pdf', ['example.pdf']);
    // console.log('✓ PDF已保存: example.pdf');
    
    console.log('');
    
  } finally {
    await browser.close();
  }
}

// 运行示例
async function main() {
  try {
    await example1();
    await example4();
    
    console.log('所有示例运行完成！');
  } catch (error) {
    console.error('示例运行失败:', error.message);
  }
}

// 取消注释以运行
// main();

module.exports = {
  example1,
  example2,
  example3,
  example4
};
