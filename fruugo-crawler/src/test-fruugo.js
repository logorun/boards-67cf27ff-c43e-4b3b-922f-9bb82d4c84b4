const puppeteer = require('puppeteer');

async function testFruugo() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  
  const page = await browser.newPage();
  
  // 设置User-Agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    console.log('访问Fruugo页面...');
    const url = 'https://www.fruugo.co.uk/search?merchantId=28347&page=1&pageSize=128';
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 等待页面加载
    await new Promise(r => setTimeout(r, 2000));

    // 检查是否有Cookie弹窗
    try {
      const acceptCookies = await page.$('button[class*="accept"], button[id*="accept"], #onetrust-accept-btn-handler');
      if (acceptCookies) {
        console.log('点击接受Cookies...');
        await acceptCookies.click();
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {
      console.log('未找到Cookie弹窗');
    }
    
    // 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 截图
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log('截图已保存: screenshot.png');
    
    // 获取页面内容
    const content = await page.content();
    console.log('页面内容长度:', content.length);
    
    // 检查是否有产品
    const products = await page.$$eval('[class*="product"]', items => items.length);
    console.log('找到产品数量:', products);
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await browser.close();
  }
}

testFruugo();
