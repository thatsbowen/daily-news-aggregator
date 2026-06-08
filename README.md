---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: f927da7644cca8378603e444f25fbc2f_9743c838630211f1800a5254002afed2
    ReservedCode1: wWKnF3bIEHHMq5CEN526p5diOqoNwq1W40Xle8pa+UZo6nX6PXYXgytc0MH4vyG3RHxzmPAXI1+Yd9eqO3JZw1UoPhTl9ZHe4jiUc3DbZFT52QT15KUdVR9ZRWciGwcWqL4sI/DurhWRDsfW0YsFbwUqY0UH5Kikh8XR1tJ4W5Az4E96+/HoN8GpnSM=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: f927da7644cca8378603e444f25fbc2f_9743c838630211f1800a5254002afed2
    ReservedCode2: wWKnF3bIEHHMq5CEN526p5diOqoNwq1W40Xle8pa+UZo6nX6PXYXgytc0MH4vyG3RHxzmPAXI1+Yd9eqO3JZw1UoPhTl9ZHe4jiUc3DbZFT52QT15KUdVR9ZRWciGwcWqL4sI/DurhWRDsfW0YsFbwUqY0UH5Kikh8XR1tJ4W5Az4E96+/HoN8GpnSM=
---

# 每日新闻聚合 Daily News Aggregator

面向360浏览器的新闻聚合插件，展示当日国内外政治、军事、财经去重归纳新闻及A股四大指数行情。

## 功能特性

- **A股指数**：上证指数、深证成指、创业板指、沪深300 实时行情（红涨绿跌）
- **新闻聚合**：政治、军事、财经三板块，Tab 切换
- **去重归纳**：基于标题相似度的智能去重，相似新闻合并展示
- **多源覆盖**：国内（网易、凤凰） + 国际（CNN、BBC、Yahoo）
- **暗色模式**：自动适配系统暗色/亮色主题
- **定时刷新**：股票5分钟、新闻15分钟自动更新

## 项目结构

```
daily-news-aggregator/
├── manifest.json        # 扩展配置（Manifest V3）
├── popup.html           # 弹窗主界面
├── popup.css            # 样式文件（含暗色模式）
├── popup.js             # 前端交互 & 数据渲染
├── background.js        # Service Worker 定时抓取与缓存
├── utils/
│   ├── stock.js         # 股票数据获取（东方财富接口）
│   ├── fetcher.js       # 新闻源 RSS 抓取
│   └── dedup.js         # 标题相似度去重 + 分类
├── icons/
│   ├── icon16.svg       # 16x16 图标
│   ├── icon48.svg       # 48x48 图标
│   └── icon128.svg      # 128x128 图标
└── README.md
```

## 安装方法

### 方式一：开发者模式加载（推荐调试）

1. 打开360浏览器，在地址栏输入 `chrome://extensions/` 进入扩展管理页
2. 打开右上角「开发者模式」开关
3. 点击「加载已解压的扩展程序」
4. 选择本项目 `daily-news-aggregator` 文件夹
5. 插件图标出现在浏览器工具栏，点击即可使用

### 方式二：打包安装

1. 在 `chrome://extensions/` 页面点击「打包扩展程序」
2. 选择 `daily-news-aggregator` 文件夹，生成 `.crx` 文件
3. 将 `.crx` 文件拖入浏览器窗口完成安装

## 发布到360创作者中心

### 准备工作

1. 将项目打包为 `.zip` 压缩包（包含所有文件，不要包含外层文件夹）
2. 准备 128×128 PNG 格式图标（可将 `icons/icon128.svg` 转换为 PNG）
3. 准备至少 3 张插件截图（弹出窗口、各Tab页截图）

### 提交步骤

1. 访问 [360扩展中心](https://ext.chrome.360.cn/) 注册开发者账号
2. 进入「创作者中心」→「提交扩展」
3. 填写扩展信息：
   - 名称：每日新闻聚合
   - 描述：展示当日国内外政治、军事、财经去重归纳新闻及A股四大指数行情
   - 分类：新闻资讯
4. 上传 `.zip` 压缩包
5. 上传图标和截图
6. 提交审核，通常 1-3 个工作日出结果
7. 审核通过后自动上架，用户可在360扩展中心搜索安装

### 注意事项

- 360浏览器基于 Chromium 内核，完全兼容 Chrome Manifest V3 规范
- 确保 `manifest.json` 中的 `host_permissions` 包含所有外部 API 域名
- 首次审核可能要求提供隐私政策说明（本插件不收集任何用户数据）

## 数据来源

| 数据类型 | 来源 | 接口类型 |
|---------|------|---------|
| 上证指数 | 东方财富 | 公开 JSON API |
| 深证成指 | 东方财富 | 公开 JSON API |
| 创业板指 | 东方财富 | 公开 JSON API |
| 沪深300 | 东方财富 | 公开 JSON API |
| 国内新闻 | 网易、凤凰 | RSS |
| 国际新闻 | CNN、BBC、Yahoo | RSS |

## 技术栈

- **规范**：Chrome Extension Manifest V3
- **语言**：纯 HTML / CSS / JavaScript（无框架依赖）
- **数据存储**：chrome.storage.local
- **定时任务**：chrome.alarms
- **网络请求**：fetch API（Service Worker）
- **去重算法**：基于 2-gram Jaccard 相似度聚类

## 开源协议

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*（内容由AI生成，仅供参考）*
