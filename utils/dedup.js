/**
 * dedup.js - 新闻去重与归纳模块
 * 基于标题相似度去重，将相似新闻合并，按分类整理
 */

const NewsDedup = (() => {
  const SIMILARITY_THRESHOLD = 0.35; // 相似度阈值，超过则视为同一事件
  const MAX_PER_CATEGORY = 20;       // 每个分类最多展示条数

  /**
   * 主入口：去重 + 分类
   * @param {Array} articles - 原始文章列表
   * @returns {{politics: Array, military: Array, finance: Array}}
   */
  function dedupAndCategorize(articles) {
    if (!articles || articles.length === 0) {
      return { politics: [], military: [], finance: [] };
    }

    // Step 1: 预处理标题（分词 + 去停用词）
    const processed = articles.map((a) => ({
      ...a,
      tokens: tokenize(a.title),
    }));

    // Step 2: 聚类去重
    const clusters = clusterArticles(processed);

    // Step 3: 每个聚类选代表文章，合并来源
    const deduped = clusters.map((cluster) => mergeCluster(cluster));

    // Step 4: 分类
    const categorized = { politics: [], military: [], finance: [] };
    deduped.forEach((article) => {
      const cat = NewsFetcher.categorizeArticle(article.title, article.suggestedCategory);
      if (categorized[cat]) {
        categorized[cat].push(article);
      } else {
        categorized.politics.push(article);
      }
    });

    // Step 5: 每个分类内按时间排序，截取前 N 条
    for (const cat of Object.keys(categorized)) {
      categorized[cat].sort((a, b) => (b._timeValue || 0) - (a._timeValue || 0));
      categorized[cat] = categorized[cat].slice(0, MAX_PER_CATEGORY);
    }

    return categorized;
  }

  /**
   * 中文标题分词（简单实现：按字符 + 2-gram）
   */
  function tokenize(title) {
    const clean = title
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")
      .toLowerCase();
    const tokens = new Set();
    // 单字
    for (const ch of clean) tokens.add(ch);
    // 2-gram
    for (let i = 0; i < clean.length - 1; i++) {
      tokens.add(clean.substring(i, i + 2));
    }
    return tokens;
  }

  /**
   * 计算两个标题的 Jaccard 相似度
   */
  function similarity(aTokens, bTokens) {
    if (aTokens.size === 0 || bTokens.size === 0) return 0;
    let intersection = 0;
    for (const t of aTokens) {
      if (bTokens.has(t)) intersection++;
    }
    const union = aTokens.size + bTokens.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * 将文章聚类（相似度 > 阈值的归为一组）
   */
  function clusterArticles(articles) {
    const visited = new Set();
    const clusters = [];

    for (let i = 0; i < articles.length; i++) {
      if (visited.has(i)) continue;

      const cluster = [articles[i]];
      visited.add(i);

      for (let j = i + 1; j < articles.length; j++) {
        if (visited.has(j)) continue;
        const sim = similarity(articles[i].tokens, articles[j].tokens);
        if (sim >= SIMILARITY_THRESHOLD) {
          cluster.push(articles[j]);
          visited.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * 合并一个聚类中的文章
   * 优先展示国内来源，补充国外视角
   */
  function mergeCluster(cluster) {
    if (cluster.length === 1) {
      return {
        title: cluster[0].title,
        summary: cluster[0].summary,
        url: cluster[0].url,
        time: cluster[0].time,
        sources: [cluster[0].source],
        suggestedCategory: cluster[0].suggestedCategory,
        _timeValue: parseTimeValue(cluster[0].time),
      };
    }

    // 按来源类型排序：国内优先
    const domestic = cluster.filter((a) => a.sourceType === "domestic");
    const international = cluster.filter((a) => a.sourceType === "international");

    const representative = domestic.length > 0 ? domestic[0] : cluster[0];
    const allSources = [...new Set(cluster.map((a) => a.source))];

    // 合并摘要：国内摘要 + 国外补充
    let summary = representative.summary;
    if (international.length > 0) {
      const intlSummary = international[0].summary;
      if (intlSummary && intlSummary !== summary) {
        summary = summary + "（外媒：" + truncate(intlSummary, 20) + "）";
      }
    }

    return {
      title: representative.title,
      summary: summary,
      url: representative.url,
      time: representative.time,
      sources: allSources,
      suggestedCategory: representative.suggestedCategory,
      _timeValue: Math.max(...cluster.map((a) => parseTimeValue(a.time))),
    };
  }

  function parseTimeValue(timeStr) {
    if (!timeStr) return 0;
    try {
      // 尝试解析 "MM-DD HH:MM" 格式
      const now = new Date();
      const parts = timeStr.match(/(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})/);
      if (parts) {
        const d = new Date(now.getFullYear(), parseInt(parts[1]) - 1, parseInt(parts[2]),
          parseInt(parts[3]), parseInt(parts[4]));
        return d.getTime();
      }
      return new Date(timeStr).getTime();
    } catch (_) {
      return 0;
    }
  }

  function truncate(text, maxLen) {
    if (!text) return "";
    return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
  }

  return { dedupAndCategorize };
})();