# agent-browser API文档

## 安装

```bash
# 方式1：从npm安装（推荐）
npm install agent-browser
npx agent-browser install  # 安装Chrome
npx agent-browser install --with-deps  # Linux系统安装依赖

# 方式2：全局安装
npm install -g agent-browser
agent-browser install
```

## 核心概念

agent-browser是一个**Rust编写的headless browser CLI工具**，不是Node.js库。它通过命令行交互，支持：

1. **语义化定位器**（Semantic Locators）- 基于accessibility tree
2. **传统CSS选择器**
3. **CDP（Chrome DevTools Protocol）**

## 可用命令

### 核心操作

| 命令 | 说明 | 示例 |
|------|------|------|
| `open <url>` | 打开URL | `agent-browser open example.com` |
| `click <sel>` | 点击元素 | `agent-browser click @e2` |
| `fill <sel> <text>` | 填充输入框 | `agent-browser fill @e3 "test"` |
| `type <sel> <text>` | 输入文本 | `agent-browser type @e3 "test"` |
| `press <key>` | 按键 | `agent-browser press Enter` |
| `snapshot` | 获取accessibility tree | `agent-browser snapshot` |
| `screenshot [path]` | 截图 | `agent-browser screenshot page.png` |
| `close` | 关闭浏览器 | `agent-browser close` |

### 获取信息

| 命令 | 说明 | 示例 |
|------|------|------|
| `get text <sel>` | 获取文本 | `agent-browser get text @e1` |
| `get html <sel>` | 获取HTML | `agent-browser get html body` |
| `get url` | 获取当前URL | `agent-browser get url` |
| `get title` | 获取标题 | `agent-browser get title` |
| `get value <sel>` | 获取输入值 | `agent-browser get value @e3` |

### 等待操作

| 命令 | 说明 | 示例 |
|------|------|------|
| `wait <sel>` | 等待元素 | `agent-browser wait "#submit"` |
| `wait <ms>` | 等待时间 | `agent-browser wait 2000` |
| `wait --text "..."` | 等待文本出现 | `agent-browser wait --text "Welcome"` |
| `wait --url "..."` | 等待URL匹配 | `agent-browser wait --url "**/dash"` |
| `wait --load networkidle` | 等待网络空闲 | `agent-browser wait --load networkidle` |

### 语义化查找

| 命令 | 说明 | 示例 |
|------|------|------|
| `find role <role> <action>` | 按ARIA角色 | `agent-browser find role button click` |
| `find text <text> <action>` | 按文本内容 | `agent-browser find text "Submit" click` |
| `find label <label> <action>` | 按标签 | `agent-browser find label "Email" fill "test"` |
| `find testid <id> <action>` | 按data-testid | `agent-browser find testid "btn" click` |

**Actions:** `click`, `fill`, `type`, `hover`, `focus`, `check`, `uncheck`, `text`

**Options:**
- `--name <name>` - 按accessible name过滤
- `--exact` - 要求精确匹配

### 高级操作

| 命令 | 说明 |
|------|------|
| `eval <js>` | 执行JavaScript |
| `scroll <dir> [px]` | 滚动（up/down/left/right） |
| `hover <sel>` | 悬停 |
| `select <sel> <val>` | 选择下拉选项 |
| `check <sel>` | 勾选复选框 |
| `upload <sel> <files>` | 上传文件 |
| `pdf <path>` | 保存为PDF |

## Node.js封装

本项目提供了Node.js封装（`src/browser.js`），使用异步方法调用CLI：

```javascript
const Browser = require('./src/browser');

async function example() {
  const browser = new Browser({ timeout: 30000 });
  
  // 打开页面
  await browser.open('https://example.com');
  
  // 获取快照
  const snapshot = await browser.snapshot();
  
  // 点击元素
  await browser.click('@e2'); // 使用ref
  await browser.click('#submit'); // 使用CSS选择器
  
  // 填充输入框
  await browser.fill('#email', 'test@example.com');
  
  // 等待
  await browser.wait(2000); // 等待2秒
  await browser.wait('#result'); // 等待元素出现
  
  // 获取信息
  const url = await browser.getUrl();
  const text = await browser.getText('@e1');
  const html = await browser.getHtml('body');
  
  // 截图
  await browser.screenshot('page.png');
  
  // 关闭浏览器
  await browser.close();
}
```

## Fruugo反爬策略处理

基于测试结果，Fruugo的反爬策略：

1. **Cookie弹窗** - 需要先接受Cookies
2. **地区选择** - 可能弹出"留在当前页面"选择
3. **重定向** - 可能被重定向到google.com（测试时观察到）

### 推荐流程

```javascript
async function crawlFruugo(merchantId, page) {
  const browser = new Browser();
  const url = `https://www.fruugo.co.uk/search?merchantId=${merchantId}&page=${page}&pageSize=128`;
  
  try {
    // 1. 打开页面
    await browser.open(url);
    await browser.wait(2000);
    
    // 2. 获取快照分析Cookie弹窗
    const snapshot = await browser.snapshot();
    
    // 3. 点击"Accept Cookies"按钮
    // 需要根据实际快照内容调整
    await browser.find('text', 'Accept', 'click');
    
    // 4. 处理地区选择（如果有）
    // await browser.find('text', 'Stay on current page', 'click');
    
    // 5. 刷新页面
    await browser.press('F5');
    await browser.wait(3000);
    
    // 6. 获取产品列表
    const html = await browser.getHtml('body');
    
    // 7. 解析HTML提取产品信息
    // ...
    
    return html;
  } finally {
    await browser.close();
  }
}
```

## 注意事项

1. **Chrome下载** - 首次使用需运行 `agent-browser install`
2. **Linux依赖** - Linux系统需运行 `agent-browser install --with-deps`
3. **Headless模式** - 默认headless模式，适合服务器环境
4. **超时设置** - 可通过构造函数设置超时时间
5. **Ref定位** - 使用snapshot获取的`@ref`是最稳定的定位方式

## 下一步

1. 实现Cookie持久化（`src/cookies.js`）
2. 创建Fruugo爬虫模块（`src/crawler/`）
3. 实现产品列表解析
4. 实现翻页逻辑
5. 集成代理池
