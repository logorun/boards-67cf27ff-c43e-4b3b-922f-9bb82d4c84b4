# Fruugo Crawler

基于agent-browser的Fruugo产品爬虫

## 项目结构

```
fruugo-crawler/
├── src/
│   ├── browser.js       # agent-browser封装
│   ├── cookies.js       # Cookie管理（预留）
│   └── crawler/         # 爬虫模块目录
├── test-browser.js      # 基本功能测试
├── test-fruugo.js       # Fruugo反爬测试
├── API.md              # agent-browser API文档
└── package.json
```

## 安装

```bash
# 1. 安装依赖
npm install

# 2. 安装Chrome和系统依赖
npx agent-browser install --with-deps
```

## 测试

```bash
# 基本功能测试
node test-browser.js

# Fruugo反爬测试
node test-fruugo.js
```

## 使用

```javascript
const Browser = require('./src/browser');

async function main() {
  const browser = new Browser();
  
  await browser.open('https://example.com');
  const snapshot = await browser.snapshot();
  const html = await browser.getHtml('body');
  
  console.log(snapshot);
  
  await browser.close();
}

main();
```

## Fruugo爬取策略

### 反爬机制
1. Cookie弹窗 - 需要点击"Accept Cookies"
2. 地区选择 - 可能弹出"留在当前页面"
3. 重定向检测

### 分页格式
```
https://www.fruugo.co.uk/search?merchantId={id}&page={n}&pageSize=128
```

### 处理流程
1. 打开店铺页面
2. 获取快照，分析Cookie弹窗结构
3. 点击"Accept Cookies"
4. 处理地区选择（如果有）
5. 刷新页面获取完整内容
6. 解析产品列表
7. 翻页获取所有产品

## API文档

详见 [API.md](./API.md)

## 下一步计划

- [ ] 实现Cookie持久化
- [ ] 实现产品列表解析
- [ ] 实现翻页逻辑
- [ ] 集成代理池
- [ ] 创建Dashboard

## 技术栈

- **agent-browser** - Vercel开源的headless browser自动化工具（Rust编写）
- **Node.js** - 封装和脚本运行

## 参考

- agent-browser: https://github.com/vercel-labs/agent-browser
- npm: https://www.npmjs.com/package/agent-browser
