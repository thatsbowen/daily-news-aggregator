/**
 * background.js - Service Worker
 * 定时抓取股票数据与新闻数据，缓存至 chrome.storage.local
 */

// 导入工具模块（MV3 使用 importScripts）
importScripts("utils/stock.js", "utils/fetcher.js", "utils/dedup.js");

const STOCK_REFRESH_INTERVAL = 5;   // 股票刷新间隔（分钟）
const NEWS_REFRESH_INTERVAL = 15;   // 新闻刷新间隔（分钟）

/* ==================== 安装 & 定时器 ==================== */
chrome.runtime.onInstalled.addListener(() => {
  console.log("[NewsAggregator] 插件已安装，开始首次数据抓取...");
  fetchAllData();

  chrome.alarms.create("stockRefresh", { periodInMinutes: STOCK_REFRESH_INTERVAL });
  chrome.alarms.create("newsRefresh", { periodInMinutes: NEWS_REFRESH_INTERVAL });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "stockRefresh") {
    fetchStockData();
  } else if (alarm.name === "newsRefresh") {
    fetchNewsData();
  }
});

/* ==================== 消息处理 ==================== */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "refresh") {
    fetchAllData().then(() => {
      try {
        chrome.runtime.sendMessage({ action: "dataUpdated" }).catch(() => {});
      } catch (_) {}
    });
  }
  return false;
});

/* ==================== 数据抓取 ==================== */
async function fetchAllData() {
  await Promise.all([fetchStockData(), fetchNewsData()]);
  try {
    chrome.runtime.sendMessage({ action: "dataUpdated" }).catch(() => {});
  } catch (_) {}
}

async function fetchStockData() {
  try {
    const stockData = await StockFetcher.fetchAll();
    await chrome.storage.local.set({
      stockData: stockData,
      stockUpdateTime: Date.now(),
    });
    console.log("[NewsAggregator] 股票数据更新成功");
  } catch (err) {
    console.error("[NewsAggregator] 股票数据抓取失败:", err);
  }
}

async function fetchNewsData() {
  try {
    const rawArticles = await NewsFetcher.fetchAll();
    const categorized = NewsDedup.dedupAndCategorize(rawArticles);
    await chrome.storage.local.set({
      newsData: categorized,
      newsUpdateTime: Date.now(),
    });
    console.log(
      `[NewsAggregator] 新闻更新成功: 政治${categorized.politics.length}条, 军事${categorized.military.length}条, 财经${categorized.finance.length}条`
    );
  } catch (err) {
    console.error("[NewsAggregator] 新闻数据抓取失败:", err);
  }
}