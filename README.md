<p align="center">
  <img src="icons/icon512.svg" alt="Daily News Aggregator" width="128" height="128">
</p>

<h1 align="center">每日新闻聚合 · Daily News Aggregator</h1>

<p align="center">
  <strong>一站式国内外政治 · 军事 · 财经新闻聚合 + A股实时指数仪表盘</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square&logo=googlechrome" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Browser-360%20Browser%20%7C%20Chrome%20%7C%20Edge-green?style=flat-square&logo=googlechrome" alt="Browser Support">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Version-1.0.0-red?style=flat-square" alt="Version">
</p>

---

## 📖 目录

- [中文介绍](#-项目简介)
- [English Introduction](#-overview)
- [功能特性](#-功能特性)
- [技术架构](#-技术架构)
- [安装指南](#-安装指南)
- [发布到 360 创作者中心](#-发布到-360-创作者中心)
- [数据来源](#-数据来源)
- [技术栈](#-技术栈)
- [开源协议](#-开源协议)

---

## 🇨🇳 项目简介

**每日新闻聚合** 是一款面向 360 浏览器的轻量级扩展插件，帮你在一屏之内掌握当日最值得关注的**政治、军事、财经**要闻，同时实时查看 A 股四大指数行情。

### 为什么做这个？

信息过载时代，打开多个网站刷新闻效率低下。我们将 5 大权威新闻源（网易、凤凰网、CNN、BBC、Yahoo News）的当日要闻汇聚一处，通过**智能去重与归纳算法**，让同一条新闻只出现一次，最多保留 30 字精炼摘要。上方的股票仪表盘让你随时瞄一眼大盘走势。

### 界面一览

```
┌──────────────────────────────────────────┐
│  上证指数       深圳成指     创业板指     沪深300  │  ← 1/4 股票区
│  3,250.68      10,820.33   2,156.78    3,890.12 │    实时涨跌幅
│  +0.85% ↑      -0.32% ↓    +1.20% ↑   +0.56% ↑ │
├──────────────────────────────────────────┤
│  [ 政治 ]  [ 军事 ]  [ 财经 ]              │  ← 3/4 新闻区
│                                            │     Tab 切换
│  📰 中美高层战略对话在华盛顿举行...          │
│     双方就贸易、台海等问题深入交换意见...     │    标题 + 30字摘要
│     [网易] [CNN]                           │     来源标签
│                                            │
│  📰 欧盟宣布新一轮对俄制裁措施...            │
│     制裁涉及能源领域及多家金融机构...        │
│     [凤凰] [BBC]                           │
└──────────────────────────────────────────┘
```

---

## 🌍 Overview

**Daily News Aggregator** is a lightweight 360 Browser extension that consolidates the day's most important **politics, military/defense, and finance** news from both domestic and international sources, paired with a real-time A-share market dashboard — all in a single glance.

### Why This?

In today's information overload, jumping between multiple news sites is inefficient. We aggregate headlines from 5 authoritative sources (NetEase, Phoenix, CNN, BBC, Yahoo News), apply **intelligent deduplication and summarization**, ensuring you see each story only once with a concise 30-character summary. The stock ticker dashboard above keeps you updated on China's four major indices at a glance.

---

## ✨ 功能特性

| 特性 | 描述 |
|------|------|
| 📊 **四大指数实时** | 上证指数、深证成指、创业板指、沪深300，含点位/涨跌幅/涨跌额 |
| 🗂️ **三大新闻板块** | 政治、军事、财经三个 Tab 独立切换 |
| 🌐 **5 大新闻源** | 网易、凤凰网（国内） + CNN、BBC、Yahoo（国际） |
| 🔍 **智能去重** | 基于 2-gram Jaccard 相似度算法，同质新闻自动合并 |
| 📝 **精炼摘要** | 每条新闻自动生成 ≤30 字中文摘要 |
| 🏷️ **来源标注** | 彩色标签区分国内/国际来源，一目了然 |
| ⏱️ **自动刷新** | 股票 5 分钟、新闻 15 分钟后台定时更新 |
| 🌙 **暗色模式** | 跟随系统主题自动切换 |
| 📦 **零依赖** | 纯原生 HTML/CSS/JS，不依赖任何第三方框架 |

### Features

| Feature | Description |
|---------|-------------|
| 📊 **4 Real-Time Indices** | Shanghai Composite, Shenzhen Component, ChiNext, CSI 300 |
| 🗂️ **3 News Categories** | Politics, Military & Defense, Finance with tab switching |
| 🌐 **5 News Sources** | NetEase & Phoenix (domestic) + CNN, BBC, Yahoo (global) |
| 🔍 **Smart Dedup** | 2-gram Jaccard similarity clustering eliminates duplicate stories |
| 📝 **Concise Summaries** | Auto-generated ≤30-character Chinese summary per article |
| 🏷️ **Source Labels** | Color-coded tags distinguish domestic vs. international sources |
| ⏱️ **Auto Refresh** | Stocks every 5 min, news every 15 min via background worker |
| 🌙 **Dark Mode** | Follows system theme preference automatically |
| 📦 **Zero Dependencies** | Pure vanilla HTML/CSS/JS, no frameworks |

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────┐
│              popup.html                 │
│  ┌───────┐  ┌───────────────────────┐  │
│  │ Stock │  │    News Tabs          │  │
│  │ Cards │  │ ┌─────┬─────┬─────┐  │  │
│  │  (4)  │  │ │政治 │军事 │财经 │  │  │
│  │       │  │ ├─────┴─────┴─────┤  │  │
│  │       │  │ │   News List     │  │  │
│  └───────┘  │ └─────────────────┘  │  │
│             └───────────────────────┘  │
├─────────────────────────────────────────┤
│           chrome.storage.local          │
├─────────────────────────────────────────┤
│         background.js (SW)              │
│  ┌──────────┐  ┌──────────────────┐    │
│  │ stock.js │  │   fetcher.js     │    │
│  │ 东方财富  │  │  RSS + DOMParser│    │
│  └──────────┘  └────────┬─────────┘    │
│                         │               │
│                    dedup.js             │
│                 去重 + 归纳              │
└─────────────────────────────────────────┘
```

### Data Flow / 数据流

```
[Alarms 定时器]
      │
      ├── (每5分钟) ──→ stock.js ──→ 东方财富 API ──→ 四大指数数据
      │
      └── (每15分钟) ─→ fetcher.js
                           │
                           ├── 网易 RSS / HTML
                           ├── 凤凰 RSS / HTML
                           ├── CNN RSS
                           ├── BBC RSS
                           └── Yahoo RSS
                                │
                           dedup.js (去重 + 分类 + 摘要)
                                │
                     chrome.storage.local
                                │
                         popup.js (读取渲染)
```

---

## 📥 安装指南

### 方式一：开发者模式加载（推荐）

1. 克隆或下载本项目到本地
   ```bash
   git clone https://github.com/thatsbowen/daily-news-aggregator.git
   ```
2. 打开 360 浏览器，地址栏输入 `chrome://extensions/`
3. 打开右上角「**开发者模式**」开关
4. 点击「**加载已解压的扩展程序**」
5. 选择项目文件夹 `daily-news-aggregator`
6. 点击浏览器工具栏的插件图标即可使用

### 方式二：Chrome / Edge 安装

360 浏览器基于 Chromium，与 Chrome 扩展完全兼容，上述步骤同样适用于 Chrome 和 Edge。

### Installation

#### Method 1: Developer Mode (Recommended)

1. Clone or download this repository
   ```bash
   git clone https://github.com/thatsbowen/daily-news-aggregator.git
   ```
2. Open 360 Browser and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `daily-news-aggregator` folder
6. Click the extension icon in the toolbar

#### Method 2: Chrome / Edge

360 Browser is Chromium-based and fully compatible with Chrome extensions. The steps above work identically for Chrome and Edge.

---

## 🚀 发布到 360 创作者中心

1. 将 `daily-news-aggregator` 文件夹打包为 `.zip`
   ```bash
   zip -r daily-news-aggregator.zip daily-news-aggregator/
   ```
2. 访问 [360 创作者中心](https://ext.se.360.cn/)
3. 注册/登录开发者账号
4. 点击「**提交新应用**」
5. 上传 `.zip` 包，填写：
   - 应用名称：每日新闻聚合
   - 应用描述：一站式国内外政治、军事、财经新闻聚合 + A股实时指数仪表盘
   - 分类：新闻资讯
   - 截图：上传 3-5 张插件界面截图
6. 提交审核，通常 1-3 个工作日

### Publish to 360 Creator Center

1. Package the `daily-news-aggregator` folder into a `.zip`
   ```bash
   zip -r daily-news-aggregator.zip daily-news-aggregator/
   ```
2. Visit [360 Creator Center](https://ext.se.360.cn/)
3. Register / log in as a developer
4. Click **Submit New Extension**
5. Upload the `.zip` and fill in the metadata
6. Submit for review (typically 1-3 business days)

---

## 📡 数据来源

| 类别 | 来源 | 说明 |
|------|------|------|
| 股票 | [东方财富](https://www.eastmoney.com/) | 公开 JSON 接口，免费使用 |
| 国内新闻 | [网易新闻](https://news.163.com/)、[凤凰网](https://www.ifeng.com/) | RSS / HTML 解析 |
| 国际新闻 | [CNN](https://www.cnn.com/)、[BBC](https://www.bbc.com/)、[Yahoo News](https://news.yahoo.com/) | RSS Feed 解析 |

### Data Sources

| Category | Source | Notes |
|----------|--------|-------|
| Stock | [East Money](https://www.eastmoney.com/) | Public JSON API, free to use |
| Domestic News | [NetEase](https://news.163.com/), [Phoenix](https://www.ifeng.com/) | RSS / HTML parsing |
| Global News | [CNN](https://www.cnn.com/), [BBC](https://www.bbc.com/), [Yahoo News](https://news.yahoo.com/) | RSS Feed parsing |

---

## 🛠️ 技术栈

- **Manifest V3** — Chrome 扩展最新规范
- **Service Worker** — 后台定时数据抓取
- **chrome.storage.local** — 本地缓存
- **chrome.alarms** — 定时调度
- **DOMParser** — RSS/HTML 解析
- **纯原生 JS/CSS/HTML** — 零框架依赖

### Tech Stack

- **Manifest V3** — Latest Chrome extension specification
- **Service Worker** — Background scheduled data fetching
- **chrome.storage.local** — Local caching
- **chrome.alarms** — Periodic scheduling
- **DOMParser** — RSS/HTML parsing
- **Vanilla JS/CSS/HTML** — Zero framework dependencies

---

## 📁 项目结构 / Project Structure

```
daily-news-aggregator/
├── manifest.json          # 扩展配置 / Extension config
├── popup.html             # 弹窗界面 / Popup UI
├── popup.css              # 样式 / Styles
├── popup.js               # 前端逻辑 / Frontend logic
├── background.js          # 后台 Service Worker
├── utils/
│   ├── stock.js           # 股票数据 / Stock data
│   ├── fetcher.js         # 新闻抓取 / News fetching
│   └── dedup.js           # 去重算法 / Dedup algorithm
├── icons/
│   ├── icon16.svg
│   ├── icon48.svg
│   ├── icon128.svg
│   └── icon512.svg        # 项目图标 / Project icon
└── README.md
```

---

## 📄 开源协议

本项目基于 **MIT License** 开源，你可以自由使用、修改和分发。

### License

This project is open-sourced under the **MIT License**. You are free to use, modify, and distribute.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/thatsbowen">thatsbowen</a>
</p>
