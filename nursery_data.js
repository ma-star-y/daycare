// 梅田・中央本町地域（西新井栄町〜関町）に絞った保育園データ（公式ページを参照）
const nurseries = [
  { name: "いづみ", type: "私立", classification: "認可私立", address: "西新井栄町一丁目15番10号", phone: "03-3886-2520", capacity: 30, hours: "7:30～18:30", feeding: "自園調理", ageSlots: "0歳：2名・1歳：1名・2歳：0名", features: ["0歳受け入れ","延長保育"], currentStatus: "募集中：0歳2名・1歳1名", reviews: 4.1, reviewSum: "地域密着の小規模保育園。", cost: "要確認", ranking: 4, pros: ["小規模で目が届く"], cons: ["定員が少ない"], lat: 35.775130, lon: 139.7879781 },

  { name: "足立ひまわり", type: "私立", classification: "認可私立", address: "西新井栄町一丁目7番8号", phone: "03-3840-6287", capacity: 110, hours: "7:30～19:00", feeding: "自園調理", ageSlots: "不明", features: ["延長保育"], currentStatus: "募集中枠数は公式PDF参照", reviews: 4.0, reviewSum: "駅近で通勤に便利。", cost: "要確認", ranking: 3, pros: ["駅近で利便性◎"], cons: ["人気で競争率高め"], lat: 35.775130, lon: 139.7879781 },

  { name: "西新井きらきら（本園）", type: "私立", classification: "認可私立", address: "西新井栄町一丁目18番14号", phone: "03-5888-9163", capacity: 70, hours: "7:30～19:00", feeding: "自園調理", ageSlots: "不明", features: ["分園あり","0歳受け入れ"], currentStatus: "募集中枠数は公式PDF参照", reviews: 4.2, reviewSum: "分園と連携しているため柔軟。", cost: "要確認", ranking: 5, pros: ["分園での振替対応あり"], cons: ["通園ルールに注意"], lat: 35.775130, lon: 139.7879781 },

  { name: "ちゃいれっく西新井駅前", type: "私立", classification: "認可私立", address: "西新井栄町二丁目3番7号", phone: "03-5888-7916", capacity: 60, hours: "7:00～20:00", feeding: "自園調理", ageSlots: "不明", features: ["駅前立地","延長保育"], currentStatus: "募集中枠数は公式PDF参照", reviews: 4.0, reviewSum: "駅前で便利だが競争率が高い。", cost: "要確認", ranking: 2, pros: ["通勤に便利"], cons: ["枠が取りにくい"], lat: 35.775130, lon: 139.7879781 },

  { name: "中部ひまわり", type: "私立", classification: "認可私立", address: "関原二丁目10番4号", phone: "03-5845-5702", capacity: 124, hours: "7:30～19:00", feeding: "自園調理", ageSlots: "不明", features: ["大規模クラス"], currentStatus: "募集中枠数は公式PDF参照", reviews: 4.0, reviewSum: "定員が多く入りやすさがメリット。", cost: "要確認", ranking: 6, pros: ["定員が多く入りやすい"], cons: ["園児数多め"], lat: 35.766350, lon: 139.7889735 },

  { name: "たんぽぽ保育所西新井南園", type: "私立", classification: "認可私立", address: "関原三丁目31番6号", phone: "03-5845-2511", capacity: 70, hours: "7:30～18:30", feeding: "自園調理", ageSlots: "0歳：0名・1歳：3名・2歳：5名", features: ["家庭的保育"], currentStatus: "募集中：1歳3名・2歳5名", reviews: 3.9, reviewSum: "家庭的で評判の園。", cost: "要確認", ranking: 1, pros: ["家庭的で安心感あり"], cons: ["定員限りあり"], lat: 35.766350, lon: 139.7889735 },

  { name: "梅田（区立）", type: "区立", classification: "区立", address: "梅田四丁目2番19号", phone: "03-3848-4775", capacity: 107, hours: "7:30～18:30", feeding: "自園調理", ageSlots: "不明", features: ["区立で安定運営"], currentStatus: "募集中枠数は公式PDF参照", reviews: 4.1, reviewSum: "区立ならではの安定感。", cost: "市基準", ranking: 7, pros: ["運営安定・信頼感あり"], cons: ["申し込み集中の可能性"], lat: 35.767002, lon: 139.7977934 },

  { name: "親隣館", type: "私立", classification: "認可私立", address: "梅田四丁目29番6号", phone: "03-3886-6810", capacity: 40, hours: "7:30～19:00", feeding: "自園調理", features: ["小規模保育"], currentStatus: "要確認", reviews: 4.0, reviewSum: "小規模でアットホーム。", cost: "要確認", ranking: 8, pros: ["目が届く保育"], cons: ["枠が少ない"], lat: 35.767002, lon: 139.7977934 },

  { name: "ミアヘルサ保育園ひびき梅島", type: "私立", classification: "認可私立", address: "梅田五丁目25番33号 ロイヤルパークス梅島1F", phone: "03-5845-3411", capacity: 70, hours: "7:30～19:00", feeding: "自園調理", features: ["施設充実"], currentStatus: "要確認", reviews: 4.1, reviewSum: "施設が新しく安心。", cost: "要確認", ranking: 9, pros: ["設備が新しい"], cons: ["駅から若干歩く場合あり"], lat: 35.767002, lon: 139.7977934 },

  { name: "エーワン梅島", type: "私立", classification: "認可私立", address: "梅島一丁目18番3号", phone: "03-3849-0758", capacity: 60, hours: "7:30～18:30", feeding: "自園調理", features: ["地域密着"], currentStatus: "要確認", reviews: 3.9, reviewSum: "地域に根ざした運営。", cost: "要確認", ranking: 10, pros: ["地域密着で安心"], cons: ["規模は中程度"], lat: 35.7723784, lon: 139.7980832 },

  { name: "にじいろ保育園梅島", type: "私立", classification: "認可私立", address: "梅島二丁目37番10号", phone: "03-6807-2881", capacity: 73, hours: "7:30～19:00", feeding: "自園調理", features: ["延長保育","おむつ対応"], currentStatus: "要確認", reviews: 4.2, reviewSum: "地域で人気の保育園。", cost: "要確認", ranking: 11, pros: ["保育内容が充実"], cons: ["人気で競争"], lat: 35.7723784, lon: 139.7980832 },

  { name: "バンビ保育園梅島園", type: "私立", classification: "認可私立", address: "梅島三丁目4番8号", phone: "03-6806-3141", capacity: 65, hours: "7:30～18:30", feeding: "自園調理", features: ["家庭的保育"], currentStatus: "要確認", reviews: 4.0, reviewSum: "家庭的で安心。", cost: "要確認", ranking: 12, pros: ["丁寧な保育"], cons: ["定員制限あり"], lat: 35.7723784, lon: 139.7980832 },

  { name: "うめだ「子供の家」", type: "私立", classification: "認可私立", address: "梅田七丁目19番23号", phone: "03-3889-8800", capacity: 132, hours: "7:30～19:00", feeding: "自園調理", features: ["大規模保育"], currentStatus: "要確認", reviews: 4.1, reviewSum: "大きめの園で受け入れ幅が広い。", cost: "要確認", ranking: 13, pros: ["受け入れ枠が広い"], cons: ["個別対応に差が出る場合あり"], lat: 35.767002, lon: 139.7977934 },

  { name: "島根", type: "私立", classification: "認可私立", address: "梅島三丁目14番18号", phone: "03-3852-6370", capacity: 100, hours: "7:30～18:30", feeding: "自園調理", features: ["地域連携"], currentStatus: "要確認", reviews: 3.9, reviewSum: "地域と連携した活動が多い。", cost: "要確認", ranking: 14, lat: 35.7723784, lon: 139.7980832 },

  { name: "ミアヘルサ保育園ひびき西新井", type: "私立", classification: "認可私立", address: "梅島三丁目17番20号", phone: "03-5888-7405", capacity: 80, hours: "7:30～19:00", feeding: "自園調理", features: ["複数園運営"], currentStatus: "要確認", reviews: 4.0, reviewSum: "運営組織が安定している。", cost: "要確認", ranking: 15, lat: 35.7723784, lon: 139.7980832 },

  { name: "五反野（公設民営）", type: "公設民営", classification: "公設民営", address: "足立二丁目26番14号", phone: "03-3848-4791", capacity: 135, hours: "7:30～19:00", feeding: "自園調理", features: ["公設民営で安心"], currentStatus: "要確認", reviews: 4.0, reviewSum: "広めの定員で入りやすさが期待できる。", cost: "市基準", ranking: 16, lat: 35.761111, lon: 139.808559 },

  { name: "子ひばり", type: "私立", classification: "認可私立", address: "足立二丁目33番2号", phone: "03-3887-1701", capacity: 60, hours: "7:30～18:30", feeding: "自園調理", features: ["延長あり"], currentStatus: "要確認", reviews: 3.9, reviewSum: "地域に根ざした保育。", cost: "要確認", ranking: 17, lat: 35.761111, lon: 139.808559 },

  { name: "高和", type: "私立", classification: "認可私立", address: "足立四丁目31番17号", phone: "03-3886-5075", capacity: 80, hours: "7:30～18:30", feeding: "自園調理", features: ["地域行事重視"], currentStatus: "要確認", reviews: 3.8, reviewSum: "行事が充実している。", cost: "要確認", ranking: 18, lat: 35.761111, lon: 139.808559 },

  { name: "やよい（公設民営）", type: "公設民営", classification: "公設民営", address: "中央本町一丁目9番3-105号", phone: "03-3889-9580", capacity: 100, hours: "7:30～19:00", feeding: "自園調理", features: ["中央本町エリア"], currentStatus: "要確認", reviews: 4.0, reviewSum: "中央本町の利便性が高い施設。", cost: "市基準", ranking: 19, lat: 35.772523, lon: 139.8070816 },

  { name: "足立さくらんぼ", type: "私立", classification: "認可私立", address: "中央本町一丁目12番23号", phone: "03-5888-6581", capacity: 71, hours: "7:30～18:30", feeding: "自園調理", features: ["親子支援プログラム"], currentStatus: "要確認", reviews: 4.1, reviewSum: "親向けサポートが手厚い。", cost: "要確認", ranking: 20, lat: 35.772523, lon: 139.8070816 },
];

// レンダリング関数
function renderNurseryList() {
  const container = document.getElementById('nursery-list-dynamic');
  if (!container) return;
  
  // 順位でソート
  const sorted = nurseries.slice().sort((a,b)=>a.ranking - b.ranking);
  const html = sorted.map(n => `
      <article class="facility" data-rank="${n.ranking}">
        <h3>🏆 第${n.ranking}位：${n.name}</h3>
        <span class="badge badge-${n.type === '認可' ? 'OK' : 'warning'}">${n.type}${n.classification ? ' / ' + n.classification : ''}</span>
        <p class="meta"><strong>所在地：</strong>${n.address} | <strong>定員：</strong>${n.capacity}名</p>
        <p><strong>📞 電話：</strong>${n.phone}</p>
        <p><strong>⏰ 保育時間：</strong>${n.hours}</p>
        <p><strong>🍽 給食：</strong>${n.feeding}</p>
        ${n.ageSlots ? `<p><strong>👶 年齢別枠：</strong>${n.ageSlots}</p>` : ''}
      <p><strong>✨ 特徴：</strong>${(n.features || []).join('、')}</p>
        <p class="status"><strong>🎯 現在の枠：</strong> ${n.currentStatus}</p>
      <p><strong>⭐ ユーザー評価：</strong> ${'★'.repeat(Math.floor(n.reviews||0))}${'☆'.repeat(5-Math.floor(n.reviews||0))} (${n.reviews || 'N/A'}/5.0)</p>
        <p class="review"><strong>📝 評判：</strong> ${n.reviewSum}</p>
        <p><strong>💰 料金：</strong> ${n.cost}</p>
      ${n.lat && n.lon ? `<p><strong>📍 座標：</strong>${n.lat.toFixed(6)}, ${n.lon.toFixed(6)}</p>` : ''}
        <div class="pros-cons">
        <div class="pros"><strong>✅ おすすめポイント</strong><br>${(n.pros || []).join('<br>')}</div>
        <div class="cons"><strong>⚠️ 注意点</strong><br>${(n.cons || []).join('<br>')}</div>
        </div>
      </article>
  `).join('');
  
  container.innerHTML = html;
}

// DOMロード時に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderNurseryList);
} else {
  renderNurseryList();
}

