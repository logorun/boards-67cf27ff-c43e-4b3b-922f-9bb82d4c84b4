const puppeteer = require('puppeteer');

async function inspectPage() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const url = 'https://www.fruugo.co.uk/search?merchantId=28347&page=1&pageSize=128';
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // 处理Cookie
  try {
    const btn = await page.$('#onetrust-accept-btn-handler');
    if (btn) {
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (e) {}
  
  // 检查页面结构
  const pageInfo = await page.evaluate(() => {
    const info = {
      title: document.title,
      bodyClasses: document.body.className,
      productContainers: []
    };
    
    // 查找所有可能的产品容器
    const possibleSelectors = [
      '[class*="product"]',
      '[class*="Product"]',
      '[class*="item"]',
      '[class*="card"]',
      'article',
      'li[class]',
      'div[class]'
    ];
    
    possibleSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0 && elements.length < 500) {
        info.productContainers.push({
          selector,
          count: elements.length
        });
      }
    });
    
    // 获取第一个看起来像产品的元素的HTML
    const sampleElement = document.querySelector('[class*="product"]') || 
                         document.querySelector('[class*="Product"]') ||
                         document.querySelector('[class*="card"]');
    
    if (sampleElement) {
      info.sampleHTML = sampleElement.outerHTML.substring(0, 1000);
    }
    
    // 查找链接
    const links = Array.from(document.querySelectorAll('a[href*="/products/"]'));
    info.productLinks = links.slice(0, 3).map(a => ({
      href: a.href,
      text: a.textContent.trim().substring(0, 50)
    }));
    
    // 查找所有链接
    const allLinks = Array.from(document.querySelectorAll('a'));
    info.allLinksCount = allLinks.length;
    info.sampleLinks = allLinks.slice(0, 10).map(a => ({
      href: a.href,
      text: a.textContent.trim().substring(0, 50)
    }));
    
    // 查找包含 'product' 类的元素的子元素
    const productElements = document.querySelectorAll('[class*="product"]');
    if (productElements.length > 0) {
      const firstProduct = productElements[0];
      info.firstProductChildren = Array.from(firstProduct.children).map(child => ({
        tag: child.tagName,
        class: child.className,
        text: child.textContent.trim().substring(0, 100)
      }));
    }
    
    return info;
  });
  
  console.log('页面标题:', pageInfo.title);
  console.log('\n可能的容器:');
  pageInfo.productContainers.forEach(c => {
    console.log(`  ${c.selector}: ${c.count} 个`);
  });
  
  console.log('\n产品链接示例:');
  pageInfo.productLinks.forEach(l => {
    console.log(`  ${l.text}: ${l.href}`);
  });
  
  if (pageInfo.sampleHTML) {
    console.log('\n示例HTML:');
    console.log(pageInfo.sampleHTML);
  }
  
  await browser.close();
}

inspectPage();
