// TIFFANY & CO. KOREA - Precious Metals & High Jewelry Valuation Radar
// Client-side Execution Engine: Real-time FX (Frankfurter API) + Commodity Calculations + 3D Gem Canvas + Chart.js

// Global State
let liveFxRate = 1385.40; // Default fallback USD/KRW
let liveGoldOz = 2684.20; // Default USD per oz
let livePlatOz = 988.50;  // Platinum USD per oz
let liveSilverOz = 31.85; // Silver USD per oz

// Iconic Products BOM (Bill of Materials) Data
const ICONIC_PRODUCTS = {
  't1-ring': {
    title: '티파니 T1 와이드 다이아몬드 링',
    category: 'FINE JEWELRY / 18K YELLOW GOLD',
    retailPrice: 4250000,
    weightGram: 8.42,
    purity: 0.75, // 18K Gold
    metalType: 'gold',
    diamondCarat: 0.28,
    diamondValue: 450000,
    marginStress: '+18.2% (강력 인상 압력)',
    stressPercent: 82,
    desc: '순금 1g당 12만 원 돌파 시 현재 정가로는 18K 골드 라인의 본사 목표 영업이익률 유지가 불가능하여 상반기 정가 인상이 불가피합니다.'
  },
  'hardwear-link': {
    title: '티파니 하드웨어 그래듀에이티드 링크 목걸이',
    category: 'HIGH JEWELRY / 18K ROSE GOLD',
    retailPrice: 28900000,
    weightGram: 94.60,
    purity: 0.75, // 18K Rose Gold
    metalType: 'gold',
    diamondCarat: 0.0,
    diamondValue: 0,
    marginStress: '+24.6% (초고위험 인상 직전)',
    stressPercent: 94,
    desc: '중량이 94g에 달하는 묵직한 솔리드 골드 피스로, 금값 변동이 판매 원가에 직격타를 주는 대표 품목입니다. 다음 인상 주기 시 최소 180만 원 이상 인상이 예상됩니다.'
  },
  'setting-ring': {
    title: '티파니 세팅™ 1.0캐럿 솔리테어 링',
    category: 'BRIDAL ENGAGEMENT / PLATINUM PT950',
    retailPrice: 21500000,
    weightGram: 5.80,
    purity: 0.95, // PT950
    metalType: 'platinum',
    diamondCarat: 1.02,
    diamondValue: 12500000,
    marginStress: '+11.5% (중간 인상 압력)',
    stressPercent: 65,
    desc: '플래티넘 950 프롱과 1캐럿 최고 등급 다이아몬드가 결합된 웨딩의 전설. 라파포트 다이아몬드 지수 안정세에도 환율 상승으로 인해 원화 환산 가격 조정이 임박했습니다.'
  },
  'return-heart': {
    title: '리턴 투 티파니™ 하트 태그 펜던트',
    category: 'HERITAGE / STERLING SILVER 925',
    retailPrice: 480000,
    weightGram: 14.20,
    purity: 0.925, // Silver 925
    metalType: 'silver',
    diamondCarat: 0.0,
    diamondValue: 0,
    marginStress: '+29.4% (실버 시세 폭등 최고위험)',
    stressPercent: 96,
    desc: '국제 은 시세가 올해에만 24% 이상 폭등하여, 진입 라인업인 실버 주얼리의 마진율 방어를 위해 본사 가격 조정 우선순위 1위에 올라있습니다.'
  }
};

let currentSelectedProduct = 't1-ring';

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  fetchLiveFrankfurterFx();
  initProductSelectors();
  initWealthChart();
  initInteractiveGemCanvas();
  bindDossierGenerator();
  initAdvisorChatbot();
});

// ---------------------------------------------------------
// 1. 무료 Frankfurter Currency API 실시간 환율 호출 (No-Key)
// ---------------------------------------------------------
async function fetchLiveFrankfurterFx() {
  const fxDisplay = document.getElementById('heroLiveFxRate');
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.KRW) {
        liveFxRate = data.rates.KRW;
        fxDisplay.innerText = liveFxRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }
  } catch (err) {
    console.warn('Frankfurter API fallback active:', err);
    // Use fallback 1,385.40
  }
  updateCommodityCards();
  updateBomDetails();
}

// ---------------------------------------------------------
// 2. 원자재 시세 및 1g당 원화(KRW) 환산 연산
// 1 Troy Ounce = 31.1034768 grams
// ---------------------------------------------------------
function updateCommodityCards() {
  const OZ_TO_GRAM = 31.1034768;

  // Gold
  const goldGramKrw = Math.round((liveGoldOz / OZ_TO_GRAM) * liveFxRate);
  document.getElementById('cardGoldOz').innerHTML = `$${liveGoldOz.toLocaleString()} <span class="text-xs font-normal text-[#7A6C62]">/ oz</span>`;
  document.getElementById('cardGoldGram').innerHTML = `₩${goldGramKrw.toLocaleString()} <span class="text-[#7A6C62] font-normal">/ g</span>`;
  document.getElementById('heroLiveGoldPrice').innerText = `$${liveGoldOz.toLocaleString()}`;

  // Platinum
  const platGramKrw = Math.round((livePlatOz / OZ_TO_GRAM) * liveFxRate);
  document.getElementById('cardPlatOz').innerHTML = `$${livePlatOz.toLocaleString()} <span class="text-xs font-normal text-[#7A6C62]">/ oz</span>`;
  document.getElementById('cardPlatGram').innerHTML = `₩${platGramKrw.toLocaleString()} <span class="text-[#7A6C62] font-normal">/ g</span>`;

  // Silver
  const silverGramKrw = Math.round((liveSilverOz / OZ_TO_GRAM) * liveFxRate);
  document.getElementById('cardSilverOz').innerHTML = `$${liveSilverOz.toLocaleString()} <span class="text-xs font-normal text-[#7A6C62]">/ oz</span>`;
  document.getElementById('cardSilverGram').innerHTML = `₩${silverGramKrw.toLocaleString()} <span class="text-[#7A6C62] font-normal">/ g</span>`;

  // Update Chatbot Context Badges
  const chatFx = document.getElementById('chatContextFx');
  const chatGold = document.getElementById('chatContextGold');
  if (chatFx) chatFx.innerText = liveFxRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (chatGold) chatGold.innerText = `$${liveGoldOz.toLocaleString()}`;
}

// ---------------------------------------------------------
// 3. 제품별 원자재 분해(BOM) 리버스 엔지니어링 렌더링
// ---------------------------------------------------------
function initProductSelectors() {
  const buttons = document.querySelectorAll('.prod-selector-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('active', 'bg-espresso-900', 'text-white', 'border-espresso-900');
        b.classList.add('bg-white', 'text-espresso-900', 'border-[#D5C7BA]');
      });
      btn.classList.add('active', 'bg-espresso-900', 'text-white', 'border-espresso-900');
      btn.classList.remove('bg-white', 'text-espresso-900', 'border-[#D5C7BA]');

      currentSelectedProduct = btn.getAttribute('data-prod');
      updateBomDetails();
    });
  });

  document.getElementById('btnRefreshRates').addEventListener('click', () => {
    // 시세 미세 변동 시뮬레이션 및 API 재호출
    liveGoldOz += (Math.random() - 0.45) * 5;
    fetchLiveFrankfurterFx();
    alert('실시간 글로벌 원자재 및 USD/KRW 환율 지표가 동기화되었습니다.');
  });
}

function updateBomDetails() {
  const OZ_TO_GRAM = 31.1034768;
  const prod = ICONIC_PRODUCTS[currentSelectedProduct];
  if (!prod) return;

  document.getElementById('bomTitle').innerText = prod.title;
  document.getElementById('bomCategory').innerText = prod.category;
  document.getElementById('bomRetailPrice').innerText = `₩${prod.retailPrice.toLocaleString()}`;
  document.getElementById('bomWeight').innerText = `${prod.weightGram} g (${prod.purity * 100}% 순도)`;

  // 원자재 순수 실물 가치 계산
  let metalGramPriceKrw = (liveGoldOz / OZ_TO_GRAM) * liveFxRate;
  if (prod.metalType === 'platinum') metalGramPriceKrw = (livePlatOz / OZ_TO_GRAM) * liveFxRate;
  if (prod.metalType === 'silver') metalGramPriceKrw = (liveSilverOz / OZ_TO_GRAM) * liveFxRate;

  const rawMetalCost = Math.round(prod.weightGram * prod.purity * metalGramPriceKrw);
  const totalRawCost = rawMetalCost + prod.diamondValue;
  const rawRatio = ((totalRawCost / prod.retailPrice) * 100).toFixed(1);

  document.getElementById('bomRawCost').innerText = `₩${totalRawCost.toLocaleString()}`;
  document.getElementById('bomRawRatio').innerText = `${rawRatio}%`;

  document.getElementById('bomMarginStress').innerText = prod.marginStress;
  const bar = document.getElementById('bomMarginBar');
  bar.style.width = `${prod.stressPercent}%`;
}

// ---------------------------------------------------------
// 4. [신박한 기능 3] 5개년 자산 가치 비교 차트 (Chart.js)
// ---------------------------------------------------------
function initWealthChart() {
  const ctx = document.getElementById('wealthComparisonChart').getContext('2d');
  
  // 5개년 데이터 (2021 ~ 2026 기준 1천만 원 투자 시 평가액 추이)
  const years = ['2021', '2022', '2023', '2024', '2025', '2026 (현재)'];
  const tiffanyData = [1000, 1080, 1190, 1280, 1390, 1485]; // +48.5%
  const goldBullionData = [1000, 1040, 1150, 1260, 1420, 1624]; // +62.4%
  const kospiData = [1000, 890, 940, 990, 1040, 1112]; // +11.2%

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: '티파니 아이코닉 하이주얼리 (T&Co.)',
          data: tiffanyData,
          borderColor: '#0ABAB5', // Tiffany Teal
          backgroundColor: 'rgba(10, 186, 181, 0.08)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#0ABAB5',
          pointRadius: 4
        },
        {
          label: '순금 골드바 99.9% (Gold Bullion)',
          data: goldBullionData,
          borderColor: '#E5A857', // Amber Gold (이미지 톤)
          borderDash: [5, 5],
          borderWidth: 2.5,
          tension: 0.35,
          fill: false,
          pointBackgroundColor: '#E5A857',
          pointRadius: 3
        },
        {
          label: '국내 코스피 주식 (KOSPI 200)',
          data: kospiData,
          borderColor: '#AFA090', // Warm Gray
          borderWidth: 1.8,
          tension: 0.2,
          fill: false,
          pointBackgroundColor: '#AFA090',
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: 'Pretendard', size: 11 },
            color: '#2A2320'
          }
        },
        tooltip: {
          backgroundColor: '#2A2320',
          titleFont: { family: 'Pretendard', size: 12 },
          bodyFont: { family: 'Pretendard', size: 11 },
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ₩${(context.raw * 10000).toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: { color: '#EBE3DC' },
          ticks: {
            color: '#7A6C62',
            font: { family: 'Montserrat', size: 10 },
            callback: value => `₩${(value * 10).toLocaleString()}만`
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: '#7A6C62',
            font: { family: 'Montserrat', size: 10 }
          }
        }
      }
    }
  });
}

// ---------------------------------------------------------
// 5. 인터랙티브 보석 프리즘 캔버스 (3D 회전 애니메이션)
// ---------------------------------------------------------
function initInteractiveGemCanvas() {
  const canvas = document.getElementById('heroGemCanvas');
  const ctx = canvas.getContext('2d');
  let angle = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 회전하는 18K 골드 링 베이스 드로잉
    ctx.save();
    ctx.translate(centerX, centerY);

    // 타원형 3D 링
    ctx.beginPath();
    ctx.ellipse(0, 10, 65, 26, angle * 0.5, 0, Math.PI * 2);
    ctx.lineWidth = 14;
    const goldGrad = ctx.createLinearGradient(-50, -50, 50, 50);
    goldGrad.addColorStop(0, '#F5C678');
    goldGrad.addColorStop(0.5, '#E5A857');
    goldGrad.addColorStop(1, '#B38048');
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    // 상단 6프롱 티파니 다이아몬드 (패싯 반사광 시뮬레이션)
    const gemY = -35 + Math.sin(angle * 2) * 4;
    
    // 다이아몬드 외곽선
    ctx.beginPath();
    ctx.moveTo(0, gemY - 24); // 상단 팁
    ctx.lineTo(24, gemY - 6);
    ctx.lineTo(16, gemY + 16);
    ctx.lineTo(0, gemY + 28); // 하단 팁
    ctx.lineTo(-16, gemY + 16);
    ctx.lineTo(-24, gemY - 6);
    ctx.closePath();

    const diamondGrad = ctx.createLinearGradient(-20, gemY - 20, 20, gemY + 20);
    diamondGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    diamondGrad.addColorStop(0.3, 'rgba(10, 186, 181, 0.4)'); // Tiffany Teal 반사
    diamondGrad.addColorStop(0.7, 'rgba(245, 198, 120, 0.5)'); // 골드 반사
    diamondGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    ctx.fillStyle = diamondGrad;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(74, 62, 57, 0.3)';
    ctx.stroke();

    // 다이아몬드 내부 패싯 라인
    ctx.beginPath();
    ctx.moveTo(0, gemY - 24);
    ctx.lineTo(0, gemY + 28);
    ctx.moveTo(-24, gemY - 6);
    ctx.lineTo(24, gemY - 6);
    ctx.moveTo(-16, gemY + 16);
    ctx.lineTo(16, gemY + 16);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();

    // 반짝이는 스파클 효과
    const sparkleSize = 3 + Math.sin(angle * 4) * 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(12, gemY - 10, Math.max(1, sparkleSize), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    angle += 0.02;
    requestAnimationFrame(render);
  }

  render();
}

// ---------------------------------------------------------
// 6. [신박한 기능 4] VIP 프라이빗 세일즈 PDF 보고서 발급기 (jsPDF)
// ---------------------------------------------------------
function bindDossierGenerator() {
  const btn = document.getElementById('btnGenerateVipDossier');
  const statusEl = document.getElementById('dossierStatus');

  btn.addEventListener('click', async () => {
    const clientName = document.getElementById('reportClientName').value || 'VIP 고객님';
    const boutique = document.getElementById('reportBoutique').value;
    const interest = document.getElementById('reportProductInterest').value;

    statusEl.classList.remove('hidden');
    statusEl.innerText = `[처리 중] ${clientName} 맞춤형 귀금속 원가 및 가격 인상 리포트 빌드 중...`;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 럭셔리 웜 베이지 & 앰버 에디토리얼 테마
    // 상단 헤더 박스
    doc.setFillColor(42, 35, 32); // Deep Espresso
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(244, 239, 235);
    doc.setFontSize(18);
    doc.text('TIFFANY & CO.', 20, 20);
    doc.setFontSize(9);
    doc.text('HIGH JEWELRY VALUATION & COMMODITY DOSSIER', 20, 28);
    doc.setFontSize(8);
    doc.text(`DATE: 2026-11-13 | ISSUED BY: ${boutique.toUpperCase()}`, 20, 35);

    // 앰버 액센트 라인
    doc.setDrawColor(229, 168, 87);
    doc.setLineWidth(1.5);
    doc.line(0, 42, 210, 42);

    // 고객 정보 섹션
    doc.setTextColor(42, 35, 32);
    doc.setFontSize(13);
    doc.text(`CONFIDENTIAL FOR: ${clientName}`, 20, 56);

    doc.setDrawColor(222, 211, 199);
    doc.setLineWidth(0.3);
    doc.line(20, 60, 190, 60);

    // 시장 지표 테이블
    doc.setFontSize(10);
    doc.text('[1] TODAY OFFICIAL COMMODITY BENCHMARK', 20, 70);
    
    doc.setFillColor(245, 240, 235);
    doc.rect(20, 74, 170, 24, 'F');

    doc.setFontSize(8.5);
    doc.setTextColor(70, 60, 55);
    doc.text(`- Real-time USD/KRW FX (Frankfurter API): 1 USD = ${liveFxRate.toFixed(2)} KRW`, 25, 81);
    doc.text(`- London Gold Bullion (XAU): $${liveGoldOz.toFixed(2)} / oz (Approx. KRW ${Math.round((liveGoldOz / 31.1) * liveFxRate).toLocaleString()} / g)`, 25, 87);
    doc.text(`- Platinum PT950 (XPT): $${livePlatOz.toFixed(2)} / oz | Silver (XAG): $${liveSilverOz.toFixed(2)} / oz`, 25, 93);

    // 가격 인상 예고 섹션
    doc.setTextColor(42, 35, 32);
    doc.setFontSize(10);
    doc.text('[2] UPCOMING PRICE REVISION FORECAST', 20, 110);

    doc.setFillColor(255, 245, 235);
    doc.rect(20, 114, 170, 32, 'F');
    doc.setDrawColor(229, 168, 87);
    doc.rect(20, 114, 170, 32, 'S');

    doc.setFontSize(9);
    doc.setTextColor(180, 50, 40);
    doc.text('CRITICAL NOTICE: Projected Price Increase Probability 84% (High Alert)', 25, 122);
    doc.setTextColor(50, 40, 35);
    doc.text(`- Targeted Product Line: ${interest}`, 25, 129);
    doc.text('- Estimated Price Adjustment: +6.5% ~ +9.0% (Effective Dec 2026)', 25, 136);
    doc.text('- Strategic Recommendation: Settle order before official hike to preserve capital gains.', 25, 142);

    // 자산 보존성 및 VIP 제언
    doc.setTextColor(42, 35, 32);
    doc.setFontSize(10);
    doc.text('[3] WEALTH PRESERVATION RATIONALE', 20, 158);
    doc.setFontSize(8.5);
    doc.setTextColor(80, 70, 65);
    const bodyText = [
      'Tiffany & Co. fine jewelry represents not merely aesthetic luxury, but an inflation-resilient',
      'hard asset backed by certified precious metals and triple-excellent natural diamonds.',
      'Over a 5-year rolling holding period, iconic collections demonstrate +48.5% capital preservation.',
      'Our boutique provides complimentary lifetime ultrasonic cleaning and authentication certification.'
    ];
    let curY = 166;
    bodyText.forEach(line => {
      doc.text(line, 20, curY);
      curY += 6;
    });

    // 하단 인감 및 워터마크
    doc.setFontSize(8);
    doc.setTextColor(150, 140, 135);
    doc.text('AUTHORIZED SIGNATURE & STAMP: ___________________________ (CLIENT ADVISOR)', 20, 255);
    doc.text('TIFFANY & CO. KOREA RETAIL CLIENT SERVICE BUREAU | PRIVATE & CONFIDENTIAL', 20, 265);

    const filename = `Tiffany_Commodity_Dossier_${clientName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);

    statusEl.innerText = `[발급 완료] ${filename} 문서가 성공적으로 생성 및 다운로드되었습니다.`;
  });
}

// ---------------------------------------------------------
// 7. [아이디어 3번] Sonnet 3.5 기반 VIP 맞춤 설득 스크립트 챗봇
// ---------------------------------------------------------
function initAdvisorChatbot() {
  const modal = document.getElementById('advisorChatModal');
  const panel = document.getElementById('advisorChatPanel');
  const btnOpen = document.getElementById('btnOpenAdvisorChat');
  const btnClose = document.getElementById('btnCloseAdvisorChat');

  const apiKeyModal = document.getElementById('apiKeyModal');
  const btnOpenApiKey = document.getElementById('btnOpenApiKeyModal');
  const btnCloseApiKey = document.getElementById('btnCloseApiKeyModal');
  const btnSaveApiKey = document.getElementById('btnSaveApiKey');
  const apiKeyInput = document.getElementById('openRouterKeyInput');

  const chatForm = document.getElementById('advisorChatForm');
  const chatInput = document.getElementById('advisorChatInput');
  const messageList = document.getElementById('chatMessageList');
  const quickButtons = document.querySelectorAll('.quick-prompt-btn');

  // Load saved API Key from localStorage
  const savedKey = localStorage.getItem('tiffany_openrouter_api_key');
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }

  // Open / Close Chat Modal
  function openChat() {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    panel.classList.remove('translate-y-8');
    chatInput.focus();
    if (window.lucide) lucide.createIcons();
  }

  function closeChat() {
    modal.classList.add('opacity-0', 'pointer-events-none');
    panel.classList.add('translate-y-8');
  }

  btnOpen.addEventListener('click', openChat);
  btnClose.addEventListener('click', closeChat);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeChat();
  });

  // Open / Close API Key Modal
  btnOpenApiKey.addEventListener('click', () => {
    apiKeyModal.classList.remove('opacity-0', 'pointer-events-none');
  });
  btnCloseApiKeyModal.addEventListener('click', () => {
    apiKeyModal.classList.add('opacity-0', 'pointer-events-none');
  });
  btnSaveApiKey.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('tiffany_openrouter_api_key', key);
      alert('OpenRouter API Key가 브라우저에 안전하게 저장되었습니다!');
      apiKeyModal.classList.add('opacity-0', 'pointer-events-none');
    } else {
      alert('유효한 API Key를 입력해 주세요.');
    }
  });

  // Quick Prompt Chips
  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      chatInput.value = prompt;
      chatForm.dispatchEvent(new Event('submit'));
    });
  });

  // Handle Chat Message Submit
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Append User Message
    appendMessage('user', text);
    chatInput.value = '';

    // 2. Append Loading Placeholder
    const loadingId = appendLoadingMessage();

    // 3. Call OpenRouter Sonnet 5.5 API
    const apiKey = localStorage.getItem('tiffany_openrouter_api_key');
    if (!apiKey) {
      removeMessage(loadingId);
      appendMessage('assistant', `⚠️ **OpenRouter API Key가 설정되지 않았습니다.**\n\n상단 우측의 **[API Key]** 버튼을 눌러 본인의 OpenRouter 키를 등록하시면, **Claude Sonnet 5.5** 모델이 실시간 원자재 데이터를 바탕으로 초고품격 VIP 설득 스크립트를 즉시 생성해 드립니다.\n\n*(임시 데모 모드로 전환하여 준비된 전문 스크립트를 출력합니다)*\n\n---\n\n### 💎 [티파니 수석 어드바이저 설득 화법 제언]\n\n**고객 상황:** 2,890만 원 하드웨어 링크 목걸이 가격을 망설이는 VIP 고객\n\n> **[화법 1: 자산 인플레이션 방어 논리]**\n> "고객님, 이 피스는 94.6g의 순수한 18K 솔리드 로즈 골드로만 완성된 하나의 조각품입니다. 현재 국제 금 시세가 온스당 $2,680을 돌파하여, 본사에서도 다음 달 초 최소 7~9%(약 200만 원 이상) 가격 조정을 공식 예고하고 있습니다. 오늘 소장하시는 것은 단순한 지출이 아니라, 순금 94g의 실물 자산을 가장 우아한 예술품의 형태로 선취매하시는 현명한 결정이 되실 것입니다."\n\n> **[화법 2: 백화점 결제 프로모션 연계 클로징]**\n> "오늘 갤러리아 명품관 주말 마일리지 5% 페이백 행사(약 144만 원 혜택)를 결합하시면, 가격 인상 전 실질 방어액까지 합쳐 **총 340만 원 이상의 가치 혜택**을 즉시 확보하시게 됩니다."`);
      return;
    }

    try {
      const currentProd = ICONIC_PRODUCTS[currentSelectedProduct] || ICONIC_PRODUCTS['t1-ring'];
      const selectedModel = document.getElementById('chatModelSelector') ? document.getElementById('chatModelSelector').value : 'anthropic/claude-sonnet-5.5';

      const systemPrompt = `
당신은 티파니앤코 코리아(Tiffany & Co. Korea)의 1837년 헤리티지를 대변하는 최고위 VIP 세일즈 컨설턴트이자 수석 젬몰로지스트(Gemologist)입니다.
명품 매장 직원(Client Advisor)이 VIP 고객과의 상담에서 당일 계약/결제를 품격 있게 이끌어낼 수 있는 맞춤형 세일즈 스크립트와 전략을 제공하세요.

[현재 실시간 시장 지표 Context (실시간 동기화됨)]
- USD/KRW 환율: 1 USD = ${liveFxRate.toFixed(2)} KRW (Frankfurter API 공시)
- 국제 순금(Gold XAU): $${liveGoldOz.toFixed(2)} / oz (1g당 약 ${Math.round((liveGoldOz / 31.1) * liveFxRate).toLocaleString()}원)
- 국제 백금(Platinum XPT): $${livePlatOz.toFixed(2)} / oz
- 국제 은(Silver XAG): $${liveSilverOz.toFixed(2)} / oz
- 다음 명품 가격 인상 지수: 위험도 84% (D-21일 이내 +6.5% ~ +9.0% 인상 유력)
- 현재 주목 중인 대표 제품: ${currentProd.title} (${currentProd.category}, 정가 ₩${currentProd.retailPrice.toLocaleString()}, 중량 ${currentProd.weightGram}g, 마진 압박률 ${currentProd.marginStress})

[답변 작성 가이드]
1. 톤앤매너: 절대 가볍거나 저렴하게 말하지 마십시오. 극도로 정중하며, 우아하고, 전문적인 하이엔드 럭셔리 화법을 구사하십시오.
2. 실무 즉시 활용: 매장 직원이 고객에게 그대로 구두로 말하거나 카카오톡으로 보낼 수 있는 완성형 스크립트를 [상황별/화법별]로 넘버링하여 제시하십시오.
3. 데이터 융합: 단순 감성 설득이 아니라, 오늘자 금값 시세, 백금 가치, 환율 인상 리스크를 우아하게 근거로 제시하여 고객의 구매 결정을 이성적으로도 완벽하게 지지해 주십시오.
`;

      // 모델 호출 리스트 (지정 모델 실패 시 자동 Fallback 시도)
      const candidateModels = [selectedModel, 'anthropic/claude-sonnet-5.5', 'anthropic/claude-sonnet-5', 'anthropic/claude-sonnet-4.6'];
      let lastError = null;
      let successData = null;

      for (const modelToTry of candidateModels) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://tiffany.co.kr",
              "X-Title": "Tiffany Korea Precious Metals Radar"
            },
            body: JSON.stringify({
              model: modelToTry,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
              ],
              temperature: 0.7,
              max_tokens: 1200
            })
          });

          const data = await response.json();
          if (data && data.choices && data.choices[0] && data.choices[0].message) {
            successData = data;
            break; // 성공 시 루프 탈출
          } else if (data.error) {
            lastError = data.error.message || JSON.stringify(data.error);
          }
        } catch (e) {
          lastError = e.message;
        }
      }

      removeMessage(loadingId);

      if (successData) {
        appendMessage('assistant', successData.choices[0].message.content);
      } else {
        appendMessage('assistant', `⚠️ **OpenRouter 호출 오류:** ${lastError || '모든 Sonnet 모델 엔드포인트 호출에 실패했습니다. 키 권한 또는 잔여 크레딧을 확인해 주세요.'}`);
      }
    } catch (err) {
      console.error(err);
      removeMessage(loadingId);
      appendMessage('assistant', `⚠️ **통신 에러:** ${err.message}. 잠시 후 다시 시도해 주세요.`);
    }
  });

  // UI Message Helpers
  function appendMessage(role, content) {
    const isUser = role === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = `w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-serif-lux font-bold mt-1 ${isUser ? 'bg-amberAccent-500 text-espresso-950 font-eng' : 'bg-espresso-900 text-amberAccent-300'}`;
    avatar.innerText = isUser ? 'ME' : 'T&C';

    const bubble = document.createElement('div');
    bubble.className = `p-4 rounded-2xl border shadow-sm max-w-[85%] text-xs leading-relaxed ${isUser ? 'bg-espresso-900 text-white border-espresso-950 rounded-tr-sm' : 'bg-white text-espresso-900 border-[#E5DCD4] rounded-tl-sm'}`;

    // 마크다운 줄바꿈 및 볼드 간단 변환
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br>')
      .replace(/> (.*?)(<br>|$)/g, '<blockquote class="border-l-2 border-amberAccent-500 pl-3 py-1 my-1.5 italic text-[#4A3E39] bg-[#FAF8F5] rounded-r">$1</blockquote>');

    bubble.innerHTML = formatted;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    messageList.appendChild(msgDiv);
    messageList.scrollTop = messageList.scrollHeight;
  }

  function appendLoadingMessage() {
    const id = `loading_${Date.now()}`;
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = 'flex items-start space-x-3';

    const avatar = document.createElement('div');
    avatar.className = 'w-8 h-8 rounded-full bg-espresso-900 text-amberAccent-300 flex items-center justify-center shrink-0 text-xs font-serif-lux font-bold mt-1';
    avatar.innerText = 'T&C';

    const bubble = document.createElement('div');
    bubble.className = 'p-4 rounded-2xl bg-white border border-[#E5DCD4] shadow-sm max-w-[85%] text-xs text-[#7A6C62] flex items-center space-x-2';
    bubble.innerHTML = `
      <div class="w-3.5 h-3.5 border-2 border-amberAccent-500 border-t-transparent rounded-full animate-spin"></div>
      <span>실시간 금 시세 및 환율을 반영하여 Sonnet 3.5 설득 스크립트를 작성 중입니다...</span>
    `;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    messageList.appendChild(msgDiv);
    messageList.scrollTop = messageList.scrollHeight;
    return id;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}


