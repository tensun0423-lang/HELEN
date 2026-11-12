// 美食清單：國道一號台中交流道 ～ 東海商圈（沿台灣大道四段）
// 區域：交流道・工業區、福科路、榮總周邊、東海商圈
// 資料整理自網路食記與美食網站（來源列在每家店的 source），部分文章發表已超過一年。
// 營業時間、價格、是否仍在營業都可能變動，出發前請先用 Google 地圖確認。
// 類型：飯食、麵食、小吃、聚餐
window.FOOD_LIST = [
  // 交流道・工業區（台中工業區、中工三路）
  { name: "陳師傅牛肉麵大王", area: "交流道・工業區", type: "麵食", note: "工業區一路的超人氣排隊牛肉麵，口味偏重。", source: "https://mercury0314.pixnet.net/blog/posts/9462528377" },
  { name: "茶之軒飯舖", area: "交流道・工業區", type: "飯食", note: "中工三路，有便當、火鍋、麻辣燙，許多東海學生常去。", source: "https://mercury0314.pixnet.net/blog/posts/9462528377" },

  // 福科路
  { name: "羅林小館", area: "福科路", type: "聚餐", note: "資深中式餐館，用餐時間常客滿，建議先訂位。", source: "https://taiwan17go.com/foucaultfood/" },
  { name: "有魯肉 福科店", area: "福科路", type: "飯食", note: "魯肉飯老店的分店，在福科路 362 巷內。", source: "https://taiwan17go.com/foucaultfood/" },
  { name: "霸味羊肉爐 福科店", area: "福科路", type: "聚餐", note: "福科路上的羊肉爐，適合天冷聚餐。", source: "https://niniandblue.com/blog/post/203928766" },

  // 榮總周邊（台灣大道四段、福科路尾段）
  { name: "桿式水餃牛肉麵", area: "榮總周邊", type: "麵食", note: "榮總旁，冰花煎餃配紅燒牛肉麵，商業午餐划算。", source: "https://ifoodie.tw/explore/%E5%8F%B0%E4%B8%AD%E5%B8%82/list/%E5%8F%B0%E4%B8%AD%E6%A6%AE%E7%B8%BD%E9%99%84%E8%BF%91%E7%BE%8E%E9%A3%9F" },
  { name: "張家莊牛肉麵", area: "榮總周邊", type: "麵食", note: "榮總附近的牛肉麵，部落客推薦。", source: "https://jamesdiscover.tw/blog/243" },
  { name: "阿嬤的灶腳", area: "榮總周邊", type: "飯食", note: "招牌豬油拌飯，簡單古早味。", source: "https://jamesdiscover.tw/blog/243" },
  { name: "漁人碼頭海鮮熱炒", area: "榮總周邊", type: "聚餐", note: "平價海鮮熱炒，適合晚餐多人一起吃。", source: "https://jamesdiscover.tw/blog/243" },
  { name: "森森燒肉 中科店", area: "榮總周邊", type: "聚餐", note: "台灣大道四段的燒肉，愛食記評分 4.6，午晚餐都有營業。", source: "https://ifoodie.tw/explore/%E5%8F%B0%E4%B8%AD%E5%B8%82/list/%E5%8F%B0%E7%81%A3%E5%A4%A7%E9%81%93%E5%9B%9B%E6%AE%B5/" },
  { name: "聊聊鍋物", area: "榮總周邊", type: "聚餐", note: "台灣大道四段的鍋物，愛食記評分 4.9。", source: "https://ifoodie.tw/explore/%E5%8F%B0%E4%B8%AD%E5%B8%82/list/%E5%8F%B0%E4%B8%AD%E6%A6%AE%E7%B8%BD%E9%99%84%E8%BF%91%E7%BE%8E%E9%A3%9F" },
  { name: "臥龍城巴蜀麻辣燙", area: "榮總周邊", type: "聚餐", note: "福科路近榮總，四川麻辣風味，愛食記評分 4.5。", source: "https://ifoodie.tw/explore/%E5%8F%B0%E4%B8%AD%E5%B8%82/list/%E5%8F%B0%E4%B8%AD%E6%A6%AE%E7%B8%BD%E9%99%84%E8%BF%91%E7%BE%8E%E9%A3%9F" },

  // 東海商圈（東海別墅、新興路一帶）
  { name: "向宏魯肉飯", area: "東海商圈", type: "飯食", note: "東海商圈魯肉飯老店，學生和上班族都愛。", source: "https://yiwutrip.tw/tung-hai-night-market/" },
  { name: "哲本丸。森之丼", area: "東海商圈", type: "飯食", note: "東海學生推爆的日式丼飯與定食。", source: "https://vialife.tw/1933/" },
  { name: "鳴門壽司", area: "東海商圈", type: "小吃", note: "東海夜市 A2 攤的銅板壽司，用餐時段常排隊。", source: "https://yiwutrip.tw/tung-hai-night-market/" },
  { name: "東海刈包大王", area: "東海商圈", type: "小吃", note: "被稱為隱藏版冠軍，傍晚 5:30～7:30 前去人較少。", source: "https://yiwutrip.tw/tung-hai-night-market/" },
  { name: "豆子洋食商行 東海店", area: "東海商圈", type: "聚餐", note: "巷弄裡的洋食餐廳，東海學生和家庭客都喜歡。", source: "https://vialife.tw/1933/" },
];
