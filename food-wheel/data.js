// 台中美食清單：米其林必比登推介 ＋ 在地人私房名店
// tag：「必比登」＝ 2026 台灣米其林指南必比登推介；「在地私房」＝ 在地人、網友或食記推薦的隱藏版／排隊店
// area：行政區；來源沒寫清楚的標「台中市」
// 營業時間、價格、是否仍在營業都可能變動，出發前請先用 Google 地圖確認。
// 類型：飯食、麵食、小吃、聚餐
(function () {
  const BIB = "https://www.taichung.gov.tw/8868/8872/9962/3321765";
  const BIB_DISHES = "https://sunnylife.tw/2025bib-gourmand/";

  // 名單更新日期：修改名單時一起更新，頁面最下方會顯示
  window.FOOD_UPDATED = "2026-11-12";

  window.FOOD_LIST = [
    // ---- 米其林必比登推介 ----
    { name: "阿坤麵", area: "中區", type: "麵食", tag: "必比登", note: "巷弄老麵店，乾麵配水晶餃湯，麻醬麵、滷蛋也有人推。", source: BIB_DISHES },
    { name: "范記金之園", area: "中區", type: "飯食", tag: "必比登", note: "招牌草袋飯，排骨飯也受歡迎。", source: BIB_DISHES },
    { name: "富鼎旺", area: "中區", type: "飯食", tag: "必比登", note: "豬腳飯、蹄膀飯、滷肉飯。", source: BIB_DISHES },
    { name: "富貴亭", area: "中區", type: "飯食", tag: "必比登", note: "燉肉飯、當歸湯品、燻鵝。", source: BIB_DISHES },
    { name: "醉月樓", area: "中區", type: "聚餐", tag: "必比登", note: "中山路老字號，推薦紅燒肉。", source: "https://supertaste.tvbs.com.tw/pack/355935" },
    { name: "繡球", area: "西區", type: "麵食", tag: "必比登", note: "江浙與川味麵食，冰糖㸆苦瓜。食記提到一週可能只開三天。", source: BIB_DISHES },
    { name: "富狀元豬腳", area: "西區", type: "飯食", tag: "必比登", note: "豬腳燉得軟嫩入味，搭配特製醬料。", source: "https://supertaste.tvbs.com.tw/food/360517" },
    { name: "功夫上海手工魚丸", area: "西區", type: "小吃", tag: "必比登", note: "手工魚丸、上海蔥油拌麵、雪菜魚丸湯。", source: "https://www.nownews.com/news/6718406" },
    { name: "好菜", area: "西區", type: "聚餐", tag: "必比登", note: "亞洲創意料理，適合聚餐。", source: "https://supertaste.tvbs.com.tw/pack/355935" },
    { name: "馨苑", area: "西區", type: "聚餐", tag: "必比登", note: "台菜套餐，滷肉飯也推薦。", source: "https://supertaste.tvbs.com.tw/pack/355935" },
    { name: "東沐。食在", area: "北區", type: "飯食", tag: "必比登", note: "2026 新入選，科博館附近的排隊鴨肉飯。", source: "https://supertaste.tvbs.com.tw/food/360517" },
    { name: "曙光居", area: "西屯區", type: "麵食", tag: "必比登", note: "素食，人氣菜色是手工拉麵「非常麵」。", source: BIB_DISHES },
    { name: "滬舍餘味", area: "南屯區", type: "聚餐", tag: "必比登", note: "上海風味料理，必比登連續入選。", source: BIB },
    { name: "台中肉員", area: "南區", type: "小吃", tag: "必比登", note: "復興路三段的老字號肉圓。", source: BIB },
    { name: "鳳記鵝肉老店", area: "沙鹿區", type: "小吃", tag: "必比登", note: "沙鹿平價鵝肉，乾麵和小菜也很受歡迎。", source: "https://news.ltn.com.tw/news/Taichung/breakingnews/5504682" },
    { name: "老士官擀麵", area: "清水區", type: "麵食", tag: "必比登", note: "清水連年入選的手擀麵。", source: "https://news.ltn.com.tw/news/Taichung/breakingnews/5504682" },
    { name: "可口牛肉麵", area: "台中市", type: "麵食", tag: "必比登", note: "大墩路，紅燒半筋半肉牛肉麵。週末公休。", source: "https://guide.michelin.com/tw/zh_TW/taichung-region/taichung/restaurant/ke-kou-beef-noodles" },
    { name: "裡小樓", area: "台中市", type: "聚餐", tag: "必比登", note: "招牌鹽焗玉米雞腿，醬冬瓜滷肉飯。", source: BIB_DISHES },
    { name: "上海未名麵點", area: "台中市", type: "小吃", tag: "必比登", note: "推薦蔥油餅、酸梅湯。", source: BIB_DISHES },
    { name: "夜間部爌肉飯", area: "台中市", type: "飯食", tag: "必比登", note: "人氣宵夜爌肉飯，可加辣菜脯。晚上才營業。", source: "https://supertaste.tvbs.com.tw/food/360517" },

    // ---- 在地私房名店 ----
    { name: "彩鳳米糕", area: "中區", type: "小吃", tag: "在地私房", note: "部落客最常回訪的私藏米糕，早上六點開門。", source: "https://supertaste.tvbs.com.tw/pack/348872" },
    { name: "滿溢手工麵線", area: "南屯區", type: "小吃", tag: "在地私房", note: "銅板價手工麵線，每日現煮。", source: "https://supertaste.tvbs.com.tw/pack/348872" },
    { name: "陳建誠牛肉麵", area: "南屯區", type: "麵食", tag: "在地私房", note: "好市多對面騎樓下的隱藏版牛肉麵。", source: "https://supertaste.tvbs.com.tw/pack/348872" },
    { name: "竹仔坑大麵焿", area: "台中市", type: "小吃", tag: "在地私房", note: "Dcard 在地人口袋名單常客。", source: "https://www.dcard.tw/f/food/p/234265070" },
    { name: "陳師傅牛肉麵大王", area: "西屯區", type: "麵食", tag: "在地私房", note: "工業區一路的超人氣排隊牛肉麵，口味偏重。", source: "https://mercury0314.pixnet.net/blog/posts/9462528377" },
    { name: "刁民酸菜魚 逢甲店", area: "西屯區", type: "聚餐", tag: "在地私房", note: "逢甲排隊名店，假日可能要排 2 小時。", source: "https://liumouth.tw/xitun-food/" },
  ];
})();
