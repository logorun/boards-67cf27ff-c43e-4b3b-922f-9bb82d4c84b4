const puppeteer = require('puppeteer');

// 代理池配置
const PROXY_HOST = '23.148.244.2';
const PROXY_PORT_START = 10000;
const PROXY_PORT_END = 10252;

class FruugoListCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.currentProxyIndex = 0;
  }

  getNextProxy() {
    const port = PROXY_PORT_START + this.currentProxyIndex;
    this.currentProxyIndex = (this.currentProxyIndex + 1) % (PROXY_PORT_END - PROXY_PORT_START + 1);
    return `socks5://${PROXY_HOST}:${port}`;
  }

  async init(useProxy = false) {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ];

    if (useProxy) {
      const proxy = this.getNextProxy();
      args.push(`--proxy-server=${proxy}`);
      console.log(`使用代理: ${proxy}`);
    }

    this.browser = await puppeteer.launch({
      headless: 'new',
      args
    });
    
    this.page = await this.browser.newPage();
    
    // 更真实的浏览器设置
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 添加额外的headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-GB,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async crawlMerchant(merchantId, maxPages = 10) {
    const products = [];
    
    for (let page = 1; page <= maxPages; page++) {
      console.log(`正在爬取第 ${page} 页...`);
      
      const url = `https://www.fruugo.co.uk/search?merchantId=${merchantId}&page=${page}&pageSize=128`;
      
      try {
        const pageProducts = await this.crawlPage(url);
        
        if (pageProducts.length === 0) {
          console.log(`第 ${page} 页没有产品，停止爬取`);
          break;
        }
        
        products.push(...pageProducts);
        console.log(`第 ${page} 页找到 ${pageProducts.length} 个产品`);
        
        // 随机延迟3-8秒
        await new Promise(r => setTimeout(r, 3000 + Math.random() * 5000));
        
      } catch (error) {
        console.error(`爬取第 ${page} 页失败:`, error.message);
        break;
      }
    }
    
    return products;
  }

  async crawlPage(url) {
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    // 等待页面加载
    await new Promise(r => setTimeout(r, 3000));

    // 处理Cookie弹窗
    try {
      const acceptButton = await this.page.$('#onetrust-accept-btn-handler, button[class*="accept"]');
      if (acceptButton) {
        await acceptButton.click();
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {
      // 忽略
    }

    // 检查是否有错误页面
    const title = await this.page.title();
    if (title.includes("isn't working") || title.includes("Error")) {
      throw new Error('Fruugo返回错误页面');
    }

    // 等待产品加载
    try {
      await this.page.waitForSelector('[class*="product"]', { timeout: 10000 });
    } catch (e) {
      console.log('未找到产品元素');
    }

    // 提取产品信息
    const products = await this.page.evaluate(() => {
      const items = [];
      
      // 查找产品元素
      const productElements = document.querySelectorAll('[class*="product"]');
      
      productElements.forEach(item => {
        try {
          // 提取URL
          const linkElement = item.querySelector('a');
          const url = linkElement ? linkElement.href : '';
          
          // 提取商品名
          const titleElement = item.querySelector('h3, h2, [class*="title"], [class*="name"]');
          const name = titleElement ? titleElement.textContent.trim() : '';
          
          // 提取价格
          const priceElement = item.querySelector('[class*="price"]');
          const price = priceElement ? priceElement.textContent.trim() : '';
          
          // 提取图片
          const imgElement = item.querySelector('img');
          const image = imgElement ? (imgElement.src || imgElement.dataset.src) : '';
          
          if (url && url.includes('/products/')) {
            items.push({
              url,
              name,
              price,
              image
            });
          }
        } catch (e) {
          // 忽略单个产品的解析错误
        }
      });
      
      return items;
    });

    return products;
  }
}

// 主函数
async function main() {
  const crawler = new FruugoListCrawler();
  
  try {
    // 不使用代理（因为当前IP在白名单中）
    await crawler.init(false);
    
    const merchantId = '28347';
    const products = await crawler.crawlMerchant(merchantId, 2);
    
    console.log('\n========================================');
    console.log(`总共找到 ${products.length} 个产品`);
    console.log('========================================\n');
    
    // 显示前3个产品
    products.slice(0, 3).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   价格: ${p.price}`);
      console.log(`   URL: ${p.url}`);
      console.log('');
    });
    
    // 保存到JSON文件
    const fs = require('fs');
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log(`产品列表已保存到 products.json`);
    
  } catch (error) {
    console.error('爬取失败:', error);
  } finally {
    await crawler.close();
  }
}

main();
