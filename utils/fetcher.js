/**
 * fetcher.js - 新闻源抓取模块
 * 策略：RSS 直接抓取 + RSSHub 兜底 + 内置示例数据
 * 国内：网易(163)、凤凰(ifeng)；国外：CNN、BBC、Yahoo
 */

const NewsFetcher = (() => {
  // 各新闻源的 RSS 地址（主源 + 备用源）
  const RSS_SOURCES = [
    // 国内
    {
      name: "wangyi",
      label: "网易",
      type: "domestic",
      urls: [
        "https://rsshub.app/163/news/rank/whole/click/day",
        "https://api.allorigins.win/raw?url=https://news.163.com/special/00011K6L/rss_newsattitude.xml",
      ],
    },
    {
      name: "ifeng",
      label: "凤凰",
      type: "domestic",
      urls: [
        "https://rsshub.app/ifeng/news",
      ],
    },
    // 国外
    {
      name: "cnn",
      label: "CNN",
      type: "international",
      urls: [
        "https://rsshub.app/cnn/topics",
        "https://api.allorigins.win/raw?url=http://rss.cnn.com/rss/edition.rss",
      ],
    },
    {
      name: "bbc",
      label: "BBC",
      type: "international",
      urls: [
        "https://feeds.bbci.co.uk/news/rss.xml",
        "https://rsshub.app/bbc/world-news",
      ],
    },
    {
      name: "yahoo",
      label: "Yahoo",
      type: "international",
      urls: [
        "https://rsshub.app/yahoo/news",
      ],
    },
  ];

  // 分类关键词映射（扩展版）
  const CATEGORY_KEYWORDS = {
    politics: [
      "政治", "政府", "总统", "总理", "国会", "议会", "选举", "外交", "政策",
      "politics", "government", "president", "election", "parliament", "minister",
      "外交", "法案", "立法", "投票", "政党", "领导人", "白宫", "国务院",
      "politic", "democracy", "congress", "senate", "republican", "democrat",
      "会谈", "峰会", "制裁", "联合国", "北约", "欧盟", "访华", "中美",
      "习近平", "拜登", "普京", "马克龙", "特鲁多", "莫迪",
    ],
    military: [
      "军事", "军队", "战争", "冲突", "武器", "导弹", "军演", "国防", "士兵",
      "military", "army", "war", "conflict", "weapon", "missile", "defense",
      "海军", "空军", "陆军", "演习", "袭击", "战场", "部队", "航母",
      "战斗机", "无人机", "核武器", "坦克", "军舰", "部署", "战区",
    ],
    finance: [
      "财经", "经济", "股市", "股票", "指数", "金融", "央行", "利率", "通胀",
      "finance", "economy", "stock", "market", "fed", "interest rate", "inflation",
      "货币", "汇率", "GDP", "贸易", "企业", "公司", "财报", "上市",
      "投资", "基金", "债券", "期货", "黄金", "油价", "科技股",
      "美联储", "加息", "降息", "人民币", "美元", "纳斯达克", "标普",
    ],
  };

  /* ==================== 兜底示例数据 ==================== */
  function getFallbackArticles() {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const time = `${pad(today.getMonth() + 1)}-${pad(today.getDate())} ${pad(today.getHours())}:${pad(today.getMinutes())}`;

    return [
      // 政治
      { title: "中美高层战略对话在华盛顿举行", summary: "双方就贸易、台海等议题深入交换意见，同意保持沟通渠道畅通", source: "wangyi", sourceType: "domestic", suggestedCategory: "politics", time },
      { title: "欧盟宣布新一轮对俄制裁措施", summary: "制裁涉及能源领域及多家金融机构，旨在进一步限制俄罗斯经济能力", source: "ifeng", sourceType: "domestic", suggestedCategory: "politics", time },
      { title: "联合国大会通过气候变化决议", summary: "决议呼吁各国加速减排行动，发展中国家要求发达国家提供更多资金支持", source: "cnn", sourceType: "international", suggestedCategory: "politics", time },
      { title: "法国总统马克龙宣布内阁改组", summary: "多名部长职位发生变动，新内阁将聚焦经济复苏与移民政策改革", source: "bbc", sourceType: "international", suggestedCategory: "politics", time },
      { title: "日本首相访问东南亚三国", summary: "讨论经济合作与地区安全议题，签署多项基础设施投资协议", source: "yahoo", sourceType: "international", suggestedCategory: "politics", time },
      { title: "中国外交部回应南海问题最新声明", summary: "强调中国对南海诸岛拥有无可争辩的主权，主张通过对话解决争端", source: "wangyi", sourceType: "domestic", suggestedCategory: "politics", time },
      // 军事
      { title: "东部战区组织多军种联合实战化演练", summary: "演练涉及海空协同、远程精确打击等课目，检验联合作战能力", source: "wangyi", sourceType: "domestic", suggestedCategory: "military", time },
      { title: "北约将在东欧举行大规模军事演习", summary: "演习规模为近年来最大，多国部队参与，重点演练快速反应与协同作战", source: "cnn", sourceType: "international", suggestedCategory: "military", time },
      { title: "新型隐身战斗机完成首飞测试", summary: "该机型具备超音速巡航能力，将在未来十年逐步列装部队", source: "ifeng", sourceType: "domestic", suggestedCategory: "military", time },
      { title: "也门局势持续升级多方呼吁停火", summary: "联合国特使紧急斡旋，人道主义危机加剧引发国际社会高度关注", source: "bbc", sourceType: "international", suggestedCategory: "military", time },
      { title: "国防部就近期军事热点答记者问", summary: "回应外界关切，重申中国坚持防御性国防政策不动摇", source: "wangyi", sourceType: "domestic", suggestedCategory: "military", time },
      // 财经
      { title: "央行宣布降准释放长期流动性", summary: "此次降准预计释放资金约1.2万亿元，支持实体经济发展", source: "wangyi", sourceType: "domestic", suggestedCategory: "finance", time },
      { title: "美联储维持利率不变符合市场预期", summary: "鲍威尔表示通胀仍高于目标，降息时点需要更多数据支撑", source: "cnn", sourceType: "international", suggestedCategory: "finance", time },
      { title: "国际油价突破80美元创年内新高", summary: "OPEC+减产政策及地缘政治因素共同推动油价持续上行", source: "ifeng", sourceType: "domestic", suggestedCategory: "finance", time },
      { title: "全球股市普遍上涨科技股领涨", summary: "投资者对AI产业前景乐观，纳斯达克指数创历史新高", source: "yahoo", sourceType: "international", suggestedCategory: "finance", time },
      { title: "人民币汇率中间价调升逾百点", summary: "在岸、离岸人民币对美元汇率双双走高，市场情绪明显改善", source: "wangyi", sourceType: "domestic", suggestedCategory: "finance", time },
      { title: "新能源车企公布最新交付数据", summary: "多家车企交付量同比大幅增长，行业竞争格局持续变化", source: "bbc", sourceType: "international", suggestedCategory: "finance", time },
    ];
  }

  /* ==================== RSS 解析 ==================== */
  function parseRSS(xmlText, sourceName) {
    const articles = [];
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "text/xml");

      // 检查是否为 RSSHub 格式（JSON 或 Atom）
      const isJSON = xmlText.trim().startsWith("{") || xmlText.trim().startsWith("[");
      if (isJSON) {
        return parseJSONFeed(xmlText, sourceName);
      }

      const items = xml.querySelectorAll("item, entry");

      if (items.length === 0) {
        console.warn(`[NewsFetcher] ${sourceName}: 未找到 item/entry 节点`);
        return articles;
      }

      items.forEach((item) => {
        const title = item.querySelector("title")?.textContent?.trim() || "";
        const description =
          item.querySelector("description, summary, content")?.textContent?.trim() || "";
        const link =
          item.querySelector("link")?.textContent?.trim() ||
          item.querySelector("link")?.getAttribute("href") || "";
        const pubDate =
          item.querySelector("pubDate, published, updated")?.textContent?.trim() || "";

        if (!title || title.length < 4) return;

        const cleanDesc = description
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .trim();

        articles.push({
          title,
          summary: truncate(cleanDesc, 30),
          url: link,
          time: formatTime(pubDate),
          source: sourceName,
          rawTitle: title.toLowerCase(),
        });
      });
    } catch (err) {
      console.warn(`[NewsFetcher] 解析 ${sourceName} 失败:`, err.message);
    }
    return articles;
  }

  function parseJSONFeed(jsonText, sourceName) {
    const articles = [];
    try {
      const data = JSON.parse(jsonText);
      const items = data?.items || data?.data?.items || data?.item || data || [];

      (Array.isArray(items) ? items : [items]).forEach((item) => {
        const title = item.title || "";
        const description = item.description || item.summary || item.content_text || "";
        const link = item.url || item.link || "";
        const pubDate = item.date_published || item.pubDate || item.published || "";

        if (!title || title.length < 4) return;

        const cleanDesc = (description || "").replace(/<[^>]+>/g, "").trim();

        articles.push({
          title,
          summary: truncate(cleanDesc, 30),
          url: link,
          time: formatTime(pubDate),
          source: sourceName,
          rawTitle: title.toLowerCase(),
        });
      });
    } catch (err) {
      console.warn(`[NewsFetcher] 解析 ${sourceName} JSON 失败:`, err.message);
    }
    return articles;
  }

  /* ==================== 抓取逻辑 ==================== */
  async function fetchSource(source) {
    for (const url of source.urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const resp = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, application/json, */*",
          },
        });
        clearTimeout(timeout);

        if (!resp.ok) continue;

        const text = await resp.text();
        if (!text || text.length < 50) continue;

        const articles = parseRSS(text, source.name);
        if (articles.length > 0) {
          console.log(`[NewsFetcher] ${source.label} (${url}): ${articles.length} 条`);
          articles.forEach((a) => {
            a.suggestedCategory = "politics";
            a.sourceType = source.type;
          });
          return articles;
        }
      } catch (err) {
        console.warn(`[NewsFetcher] ${source.label} URL ${url}: ${err.message}`);
        continue;
      }
    }
    console.warn(`[NewsFetcher] ${source.label}: 所有源均失败`);
    return [];
  }

  async function fetchAll() {
    const allArticles = [];
    const promises = RSS_SOURCES.map(async (source) => {
      const articles = await fetchSource(source);
      allArticles.push(...articles);
    });

    await Promise.allSettled(promises);

    // 如果 RSS 抓取结果为空，使用兜底数据
    if (allArticles.length === 0) {
      console.warn("[NewsFetcher] RSS 抓取全部失败，使用兜底示例数据");
      const fallback = getFallbackArticles();
      allArticles.push(...fallback);
    }

    console.log(`[NewsFetcher] 共抓取 ${allArticles.length} 条新闻`);
    return allArticles;
  }

  /* ==================== 分类判断 ==================== */
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
  function truncate(text, maxChars) {
    if (!text) return "";
    const clean = text.replace(/[\r\n\t]+/g, " ").trim();
    if (clean.length <= maxChars) return clean;
    // 尝试在标点处截断
    const cut = clean.substring(0, maxChars);
    const lastPeriod = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("！"), cut.lastIndexOf("？"), cut.lastIndexOf("."), cut.lastIndexOf("!"));
    if (lastPeriod > maxChars * 0.5) {
      return clean.substring(0, lastPeriod + 1);
    }
    return cut + "...";
  }

  function formatTime(pubDate) {
    if (!pubDate) return "";
    try {
      const d = new Date(pubDate);
      if (isNaN(d.getTime())) return "";
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (_) {
      return "";
    }
  }

  return { fetchAll, categorizeArticle, RSS_SOURCES };
})();
