/**
 * Browser automation module using agent-browser CLI
 * 
 * agent-browser是一个Rust编写的headless browser CLI工具
 * 通过子进程调用CLI命令进行浏览器自动化
 */

const { spawn } = require('child_process');

class Browser {
  constructor(options = {}) {
    this.headless = options.headless !== false; // 默认headless模式
    this.timeout = options.timeout || 30000;
    this.browserProcess = null;
  }

  /**
   * 执行agent-browser命令（使用spawn处理交互式输出）
   */
  execAsync(command, args = []) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Command timeout after ${this.timeout}ms`));
      }, this.timeout);

      const child = spawn('agent-browser', [command, ...args], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve({ success: true, output: stdout.trim() });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * 打开URL
   */
  async open(url) {
    const result = await this.execAsync('open', [url]);
    return result;
  }

  /**
   * 获取页面快照（accessibility tree）
   */
  async snapshot() {
    const result = await this.execAsync('snapshot');
    return result.output;
  }

  /**
   * 点击元素
   * @param {string} selector - 可以是CSS选择器或@ref
   */
  async click(selector) {
    const result = await this.execAsync('click', [selector]);
    return result;
  }

  /**
   * 填充输入框
   */
  async fill(selector, text) {
    const result = await this.execAsync('fill', [selector, text]);
    return result;
  }

  /**
   * 等待元素或时间
   */
  async wait(target, options = {}) {
    const args = [target];
    if (options.state) args.push('--state', options.state);
    if (options.text) args.push('--text', `"${options.text}"`);
    if (options.url) args.push('--url', options.url);
    
    const result = await this.execAsync('wait', args);
    return result;
  }

  /**
   * 截图
   */
  async screenshot(path) {
    const result = await this.execAsync('screenshot', [path]);
    return result;
  }

  /**
   * 获取文本
   */
  async getText(selector) {
    const result = await this.execAsync('get', ['text', selector]);
    return result.output;
  }

  /**
   * 获取HTML
   */
  async getHtml(selector) {
    const result = await this.execAsync('get', ['html', selector]);
    return result.output;
  }

  /**
   * 获取当前URL
   */
  async getUrl() {
    const result = await this.execAsync('get', ['url']);
    return result.output;
  }

  /**
   * 执行JavaScript
   */
  async eval(code) {
    const result = await this.execAsync('eval', [`"${code}"`]);
    return result.output;
  }

  /**
   * 关闭浏览器
   */
  async close() {
    try {
      const result = await this.execAsync('close');
      return result;
    } catch (error) {
      // 浏览器可能已经关闭
      return { success: true };
    }
  }

  /**
   * 查找并执行操作
   */
  async find(type, value, action, actionValue) {
    const args = [type, value, action];
    if (actionValue) args.push(actionValue);
    
    const result = await this.execAsync('find', args);
    return result;
  }
}

module.exports = Browser;
