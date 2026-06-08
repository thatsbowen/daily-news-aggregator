/**
 * popup.js - 弹出窗口主逻辑
 * 负责 Tab 切换、数据展示、UI 状态管理
 */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadData();
});

/* ==================== Tab 切换 ==================== */
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      panels.forEach((p) => p.classList.remove("active"));
      const panel = document.getElementById(`panel-${targetTab}`);
      if (panel) panel.classList.add("active");
    });
  });
}

/* ==================== 数据加载 ==================== */
function loadData() {
  chrome.storage.local.get(
    ["stockData", "newsData", "stockUpdateTime", "newsUpdateTime"],
    (result) => {
      if (result.stockData) {
        renderStockCards(result.stockData);
        updateTime("stock-update-time", result.stockUpdateTime);
      } else {
        showStockError();
      }

      if (result.newsData) {
        renderNews(result.newsData);
        updateTime("news-update-time", result.newsUpdateTime);
        updateCacheStatus(result.newsUpdateTime);
      } else {
        showAllNewsLoading();
      }

      // 如果数据为空或过期，触发后台刷新
      const now = Date.now();
      const stockAge = result.stockUpdateTime ? now - result.stockUpdateTime : Infinity;
      const newsAge = result.newsUpdateTime ? now - result.newsUpdateTime : Infinity;
      if (stockAge > 5 * 60 * 1000 || newsAge > 15 * 60 * 1000) {
        chrome.runtime.sendMessage({ action: "refresh" });
      }
    }
  );

  // 监听后台数据更新
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "dataUpdated") {
      loadData();
    }
  });
}

/* ==================== 股票渲染 ==================== */
function renderStockCards(stocks) {
  const cards = document.querySelectorAll(".stock-card");
  const indexMap = { sh: 0, sz: 1, cy: 2, hs: 3 };
  const stockKeys = ["sh", "sz", "cy", "hs"];

  cards.forEach((card) => {
    const key = card.dataset.index;
    const data = stocks[key];
    if (!data) {
      card.classList.add("loading");
      card.querySelector(".stock-price").textContent = "--";
      card.querySelector(".stock-change").textContent = "暂无数据";
      card.querySelector(".stock-change").className = "stock-change";
      return;
    }

    card.classList.remove("loading");
    card.querySelector(".stock-price").textContent = data.price.toFixed(2);

    const changeEl = card.querySelector(".stock-change");
    const sign = data.change >= 0 ? "+" : "";
    changeEl.textContent = `${sign}${data.change.toFixed(2)}  ${sign}${data.changePercent.toFixed(2)}%`;
    changeEl.className = "stock-change " + (data.change >= 0 ? "up" : "down");
  });
}

function showStockError() {
  const cards = document.querySelectorAll(".stock-card");
  cards.forEach((card) => {
    card.classList.add("loading");
    card.querySelector(".stock-price").textContent = "--";
    card.querySelector(".stock-change").textContent = "获取失败";
    card.querySelector(".stock-change").className = "stock-change";
  });
}

/* ==================== 新闻渲染 ==================== */
function renderNews(newsData) {
  const categories = ["politics", "military", "finance"];
  const labelMap = { politics: "政治", military: "军事", finance: "财经" };

  categories.forEach((cat) => {
    const panel = document.getElementById(`panel-${cat}`);
    const articles = newsData[cat] || [];

    if (articles.length === 0) {
      panel.innerHTML = `<div class="news-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
        <p>暂无${labelMap[cat]}新闻</p>
      </div>`;
      return;
    }

    const list = document.createElement("ul");
    list.className = "news-list";

    articles.forEach((article) => {
      const li = document.createElement("li");
      li.className = "news-item";
      li.title = article.url ? "点击打开原文" : "";
      li.addEventListener("click", () => {
        if (article.url) {
          chrome.tabs.create({ url: article.url, active: false });
        }
      });

      const sourceTags = renderSourceTags(article.sources);

      li.innerHTML = `
        <div class="news-item-left">
          <div class="news-item-title">${escapeHtml(article.title)}</div>
          <div class="news-item-summary">${escapeHtml(article.summary)}</div>
          <div class="news-item-meta">${sourceTags}</div>
        </div>
        <div class="news-item-right">
          <span class="news-item-time">${article.time || ""}</span>
        </div>
      `;
      list.appendChild(li);
    });

    panel.innerHTML = "";
    panel.appendChild(list);
  });
}

function renderSourceTags(sources) {
  if (!sources || sources.length === 0) return "";

  const tagClassMap = {
    wangyi: "source-tag domestic wangyi",
    ifeng: "source-tag domestic ifeng",
    cnn: "source-tag international cnn",
    bbc: "source-tag international bbc",
    yahoo: "source-tag international yahoo",
  };

  return sources
    .map((s) => {
      const cls = tagClassMap[s] || "source-tag";
      return `<span class="${cls}">${s.toUpperCase()}</span>`;
    })
    .join(" ");
}

function showAllNewsLoading() {
  const panels = document.querySelectorAll(".tab-panel");
  panels.forEach((p) => {
    p.innerHTML = '<div class="news-loading">正在加载新闻...</div>';
  });
}

/* ==================== 辅助函数 ==================== */
function updateTime(elementId, timestamp) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (timestamp) {
    const d = new Date(timestamp);
    el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())} 更新`;
  } else {
    el.textContent = "";
  }
}

function updateCacheStatus(updateTime) {
  const el = document.getElementById("cache-status");
  if (!el) return;
  if (updateTime) {
    const age = Math.floor((Date.now() - updateTime) / 60000);
    el.textContent = age < 1 ? "数据来源：刚刚更新" : `数据来源：${age}分钟前更新`;
  } else {
    el.textContent = "数据来源：等待更新";
  }
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}