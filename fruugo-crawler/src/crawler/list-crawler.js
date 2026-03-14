const puppeteer = require('puppeteer');

class FruugoListCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
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
        
        // 随机延迟2-5秒
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
        
      } catch (error) {
        console.error(`爬取第 ${page} 页失败:`, error.message);
        break;
      }
    }
    
    return products;
  }

  async crawlPage(url) {
    await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 等待页面加载
    await new Promise(r => setTimeout(r, 2000));

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

    // 提取产品信息
    const products = await this.page.evaluate(() => {
      const items = [];
      
      // 尝试多种选择器
      const selectors = [
        '[data-test="product-card"]',
        '.product-card',
        '[class*="ProductCard"]',
        '[class*="product-item"]',
        '.product'
      ];
      
      let productElements = [];
      for (const selector of selectors) {
        productElements = document.querySelectorAll(selector);
        if (productElements.length > 0) break;
      }
      
      productElements.forEach(item => {
        try {
          // 提取URL
          const linkElement = item.querySelector('a[href*="/products/"]') || item.querySelector('a');
          const url = linkElement ? linkElement.href : '';
          
          // 提取商品名
          const titleElement = item.querySelector('[data-test="product-name"], h3, [class*="title"], [class*="name"]');
          const name = titleElement ? titleElement.textContent.trim() : '';
          
          // 提取价格
          const priceElement = item.querySelector('[data-test="product-price"], [class*="price"]');
          const price = priceElement ? priceElement.textContent.trim() : '';
          
          // 提取图片
          const imgElement = item.querySelector('img');
          const image = imgElement ? imgElement.src : '';
          
          if (url && name) {
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
    await crawler.init();
    
    const merchantId = '28347'; // 测试店铺
    const products = await crawler.crawlMerchant(merchantId, 5);
    
    console.log('\n========================================');
    console.log(`总共找到 ${products.length} 个产品`);
    console.log('========================================\n');
    
    // 显示前5个产品
    products.slice(0, 5).forEach((p, i) => {
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

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = FruugoListCrawler;
