/**
 * fetcher.js - 新闻源抓取模块
 * 使用各网站 RSS 源，无需 API Key
 * 国内：网易(163)、凤凰(ifeng)；国外：CNN、BBC、Yahoo
 */

const NewsFetcher = (() => {
  // RSS 源配置
  const RSS_SOURCES = [
    // 国内
    {
      name: "wangyi",
      label: "网易",
      type: "domestic",
      rss: "https://news.163.com/special/00011K6L/rss_newsattitude.xml",
      category: "politics",
    },
    {
      name: "ifeng",
      label: "凤凰",
      type: "domestic",
      rss: "http://news.ifeng.com/rss/index.xml",
      category: "politics",
    },
    // 国外
    {
      name: "cnn",
      label: "CNN",
      type: "international",
      rss: "http://rss.cnn.com/rss/edition.rss",
      category: "politics",
    },
    {
      name: "bbc",
      label: "BBC",
      type: "international",
      rss: "https://feeds.bbci.co.uk/news/rss.xml",
      category: "politics",
    },
    {
      name: "yahoo",
      label: "Yahoo",
      type: "international",
      rss: "https://news.yahoo.com/rss/",
      category: "politics",
    },
  ];

  // 分类关键词映射
  const CATEGORY_KEYWORDS = {
    politics: [
      "政治", "政府", "总统", "总理", "国会", "议会", "选举", "外交", "政策",
      "politics", "government", "president", "election", "parliament", "minister",
      "外交", "法案", "立法", "投票", "政党", "领导人", "白宫", "国务院",
    ],
    military: [
      "军事", "军队", "战争", "冲突", "武器", "导弹", "军演", "国防", "士兵",
      "military", "army", "war", "conflict", "weapon", "missile", "defense",
      "海军", "空军", "陆军", "演习", "袭击", "战场", "部队",
    ],
    finance: [
      "财经", "经济", "股市", "股票", "指数", "金融", "央行", "利率", "通胀",
      "finance", "economy", "stock", "market", "fed", "interest rate", "inflation",
      "货币", "汇率", "GDP", "贸易", "企业", "公司", "财报", "上市",
    ],
  };

  /**
   * 解析 RSS XML 文本，提取文章列表
   */
  function parseRSS(xmlText, sourceName) {
    const articles = [];
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "text/xml");
      const items = xml.querySelectorAll("item, entry");

      items.forEach((item) => {
        const title =
          item.querySelector("title")?.textContent?.trim() || "";
        const description =
          item.querySelector("description, summary, content")?.textContent?.trim() || "";
        const link =
          item.querySelector("link")?.textContent?.trim() ||
          item.querySelector("link")?.getAttribute("href") || "";
        const pubDate =
          item.querySelector("pubDate, published, updated")?.textContent?.trim() || "";

        if (!title) return;

        // 清理 HTML 标签
        const cleanDesc = description
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .trim();

        articles.push({
          title: title,
          summary: truncate(cleanDesc, 30),
          url: link,
          time: formatTime(pubDate),
          source: sourceName,
          rawTitle: title.toLowerCase(),
        });
      });
    } catch (err) {
      console.warn(`[NewsFetcher] 解析 ${sourceName} RSS 失败:`, err.message);
    }
    return articles;
  }

  /**
   * 抓取单个 RSS 源
   */
  async function fetchSource(source) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(source.rss, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsAggregator/1.0)" },
      });
      clearTimeout(timeout);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const xmlText = await resp.text();
      const articles = parseRSS(xmlText, source.name);

      // 标记每条文章的分类倾向
      articles.forEach((a) => {
        a.suggestedCategory = source.category;
        a.sourceType = source.type;
      });

      return articles;
    } catch (err) {
      console.warn(`[NewsFetcher] ${source.name} 抓取失败:`, err.message);
      return [];
    }
  }

  /**
   * 抓取所有新闻源
   */
  async function fetchAll() {
    const allArticles = [];
    const promises = RSS_SOURCES.map(async (source) => {
      const articles = await fetchSource(source);
      allArticles.push(...articles);
    });

    await Promise.allSettled(promises);
    console.log(`[NewsFetcher] 共抓取 ${allArticles.length} 条原始新闻`);
    return allArticles;
  }

  /**
   * 根据标题和关键词判断文章分类
   */
  function categorizeArticle(title, suggestedCategory) {
    const lowerTitle = title.toLowerCase();
    let bestCategory = suggestedCategory || "politics";
    let bestScore = 0;

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0;
      keywords.forEach((kw) => {
        if (lowerTitle.includes(kw.toLowerCase())) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        bestCategory = cat;
      }
    }

    return bestCategory;
  }

  /* ==================== 辅助函数 ==================== */
  function truncate(text, maxWords) {
    if (!text) return "";
    // 按句子截断，保留前 maxWords 个词的中文摘要
    const sentences = text.split(/[。！？\.\!\?]/).filter(Boolean);
    let result = sentences[0] || text;
    if (result.length > maxWords * 2) {
      result = result.substring(0, maxWords * 2) + "...";
    }
    return result || text.substring(0, 60);
  }

  function formatTime(pubDate) {
    if (!pubDate) return "";
    try {
      const d = new Date(pubDate);
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (_) {
      return "";
    }
  }

  function pad(n) {
    return n.toString().padStart(2, "0");
  }

  return { fetchAll, categorizeArticle, RSS_SOURCES };
})();