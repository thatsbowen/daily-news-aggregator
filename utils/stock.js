/**
 * stock.js - A股四大指数数据获取模块
 * 使用东方财富公开接口，无需 API Key
 * 上证=1.000001, 深证=0.399001, 创业板=0.399006, 沪深300=1.000300
 */

const StockFetcher = (() => {
  const INDICES = [
    { key: "sh", secid: "1.000001", name: "上证指数" },
    { key: "sz", secid: "0.399001", name: "深证成指" },
    { key: "cy", secid: "0.399006", name: "创业板指" },
    { key: "hs", secid: "1.000300", name: "沪深300" },
  ];

  const API_BASE = "https://push2.eastmoney.com/api/qt/stock/get";

  /**
   * 获取单只指数数据
   */
  async function fetchOne(index) {
    const fields = "f43,f44,f45,f46,f47,f48,f57,f58,f60,f170,f171";
    const url = `${API_BASE}?secid=${index.secid}&fields=${fields}&cb=&ut=fa5fd1943c7b386f172d6893dbfba10b`;

    const resp = await fetch(url, {
      headers: { Referer: "https://www.eastmoney.com/" },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const text = await resp.text();
    // 接口可能返回 JSONP，尝试提取 JSON
    let json;
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      json = JSON.parse(jsonMatch[0]);
    } else {
      json = JSON.parse(text);
    }

    const d = json.data;
    if (!d) throw new Error("接口返回数据为空");

    const price = d.f43 / 100;       // 最新价（分→元）
    const change = d.f170 / 100;     // 涨跌额（分→元）
    const changePercent = d.f171 / 100; // 涨跌幅（万分之一→%）

    return {
      key: index.key,
      name: index.name,
      price: price,
      change: change,
      changePercent: changePercent,
    };
  }

  /**
   * 获取全部四大指数
   */
  async function fetchAll() {
    const results = {};
    const promises = INDICES.map(async (index) => {
      try {
        const data = await fetchOne(index);
        results[index.key] = data;
      } catch (err) {
        console.warn(`[StockFetcher] ${index.name} 获取失败:`, err.message);
        results[index.key] = null;
      }
    });

    await Promise.all(promises);
    return results;
  }

  return { fetchAll, fetchOne, INDICES };
})();