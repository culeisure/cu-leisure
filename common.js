/* ── CU Leisure Common JS ── */

/* Intro overlay (index.html, first visit only) */
(function () {
  const path = location.pathname;
  const isIndex = path === '/' || path.endsWith('/index.html') || path.endsWith('index.html') || path === '';
  if (!isIndex) return;
  if (sessionStorage.getItem('cuIntroSeen')) return;
  sessionStorage.setItem('cuIntroSeen', '1');
  const isPost = path.includes('/posts/');
  const logoSrc = isPost ? '../assets/logo/cu_logo.png' : 'assets/logo/cu_logo.png';
  const overlay = document.createElement('div');
  overlay.className = 'intro-overlay';
  overlay.innerHTML = '<img src="' + logoSrc + '" alt="CU Leisure">';
  document.documentElement.style.overflow = 'hidden';
  function inject() { document.body.appendChild(overlay); }
  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
  setTimeout(() => {
    overlay.classList.add('fade-out');
    document.documentElement.style.overflow = '';
    setTimeout(() => overlay.remove(), 500);
  }, 1400);
})();

/* Mobile Nav Toggle */
(function () {
  function initNav() {
    const navInner = document.querySelector('.nav-inner');
    if (!navInner) return;
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const navCta = navInner.querySelector('.nav-cta');
    if (navCta) {
      const full = navCta.textContent.trim();
      navCta.setAttribute('aria-label', full);
      navCta.innerHTML = `<span class="cta-icon" aria-hidden="true">✉</span><span class="cta-label">${full}</span>`;
    }

    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', '메뉴 열기');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    navInner.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
    });

    document.addEventListener('click', (e) => {
      if (!navInner.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();

/* Scroll Reveal */
(function () {
  const css = `
    .reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s ease, transform .8s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const selectors = [
    '.pain-card', '.case-card', '.solution-card', '.cycle-step',
    '.portfolio-card', '.client-logo', '.insight-card', '.card',
    '.stat-card', '.stage-item', '.side-item', '.tl-item',
    '.section-head', '.cta'
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function applyReveal() {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = (i * 0.08) + 's';
        observer.observe(el);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyReveal);
  } else {
    applyReveal();
  }
})();

/* Count-up animation */
(function () {
  function countUp(el) {
    const raw = el.dataset.target || el.textContent.replace(/[^0-9]/g, '');
    const target = parseInt(raw, 10);
    if (!target) return;
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = current.toLocaleString('ko-KR') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function applyCountUp() {
    document.querySelectorAll('.count-up').forEach(el => {
      countObserver.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCountUp);
  } else {
    applyCountUp();
  }
})();

/* Scroll Progress Bar */
(function () {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  function update() {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (scrolled / max) * 100 : 0;
    bar.style.width = percent + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* Floating Buttons: Back-to-top + Contact */
(function () {
  const isPost = location.pathname.includes('/posts/');
  const isContact = location.pathname.endsWith('/contact.html') || location.pathname.endsWith('contact.html');
  const contactHref = isPost ? '../contact.html' : 'contact.html';

  const stack = document.createElement('div');
  stack.className = 'fab-stack';

  let contact = null;
  if (!isContact) {
    contact = document.createElement('a');
    contact.className = 'fab fab-contact';
    contact.href = contactHref;
    contact.setAttribute('aria-label', '문의하기');
    contact.innerHTML = '<span class="fab-icon">✉</span><span class="fab-label">문의하기</span>';
    stack.appendChild(contact);
  }

  const top = document.createElement('button');
  top.className = 'fab fab-top';
  top.setAttribute('aria-label', '맨 위로');
  top.innerHTML = '↑';
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  stack.appendChild(top);

  document.body.appendChild(stack);

  function update() {
    const show = window.scrollY > 400;
    stack.classList.toggle('visible', show);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* 3D Card Tilt Effect */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const selectors = '.portfolio-card, .insight-card, .related-card, .case-card, .org-box';
  function bind() {
    document.querySelectorAll(selectors).forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = '1';
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform .25s ease, box-shadow .25s ease, border-color .25s ease';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rotateY = (x - 0.5) * 8;
        const rotateX = (0.5 - y) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  // Re-bind for dynamically added cards (related posts injection)
  setTimeout(bind, 500);
})();

/* Posts metadata for related-posts widget */
const POSTS = [
  { slug: 'post-agency-selection', title: '회원권 분양대행사, 무엇을 보고 선택해야 하는가', cat: '분양 전략', date: '2026.05.04', read: '6분', img: '../assets/images/posts/post-agency-selection/post-agency-selection_cover.webp', desc: '분양대행사 선정에서 시행사가 점검해야 할 5가지 기준, 그리고 가장 결정적인 한 가지 — 시행사 발급 실적증명서.' },
  { slug: 'post-2025-golf-stats', title: '2025년 골프장 내장객 4,641만 명, 비회원제의 약진과 회원제의 둔화', cat: '골프 산업', date: '2026.04.03', read: '6분', img: '../assets/images/posts/post-2025-golf-stats/post-2025-golf-stats_cover.webp', desc: '한국골프장경영협회 2025년 전국 골프장 이용 데이터 분석. 2년 연속 감소세 속 회원제·비회원제 격차 확대.' },
  { slug: 'post-five-step-method', title: '골프·리조트 회원모집의 성공 5단계, CU레저의 프로세스', cat: '분양 전략', date: '2026.03.07', read: '5분', img: '../assets/images/posts/post-five-step-method/post-five-step-method_cover.webp', desc: '시장조사부터 운영관리까지, CU레저가 회원모집 프로젝트를 진행하는 5단계 프로세스와 15곳 이상의 검증된 클라이언트.' },
  { slug: 'post-2026-outlook', title: '2026년 골프·리조트 시장, "불황은 언제까지 이어질까?"', cat: '골프 산업', date: '2026.01.04', read: '7분', img: '../assets/images/posts/post-2026-outlook/post-2026-outlook_cover.webp', desc: '코로나 특수가 사라진 시장의 변곡점에서 콰이어트케이션·디지털 디톡스·올인클루시브가 새로운 키워드로 떠오른다.' },
  { slug: 'post-ceo-interview-2025', title: '씨유레저 채수용 대표 인터뷰, 오랫동안 함께 호흡할 수 있는 시장 내 동반자', cat: '전문가 인사이트', date: '2025.11.10', read: '8분', img: '../assets/images/posts/post-ceo-interview-2025/post-ceo-interview-2025_cover.webp', desc: '회원권 분양 시장의 현재와 미래, 일반 분양대행과 다른 씨유레저의 철학, 더시에나 리조트 성공 사례를 직접 풀어낸 CEO 인터뷰.' },
  { slug: 'post-luxury-condominium', title: '회원제 콘도미니엄 고급화 전략, 유지될 것인가?', cat: '골프 산업', date: '2025.11.03', read: '7분', img: '../assets/images/posts/post-luxury-condominium/post-luxury-condominium_cover.webp', desc: '대명리조트에서 아난티, 그리고 글로벌 브랜드 위탁운영의 시대. 소유에서 경험으로 옮겨가는 시장의 미래를 짚는다.' },
  { slug: 'post-two-green-system', title: '투 그린 시스템, 다시 시장에 정착할 것인가?', cat: '골프 산업', date: '2025.09.23', read: '7분', img: '../assets/images/posts/post-two-green-system/post-two-green-system_cover.webp', desc: '1921년 효창원부터 2026년 수서CC까지, 한국 골프 100년 속 투그린 시스템의 역사와 현재의 부활.' },
  { slug: 'post-sports-facility-law', title: '체육시설법 제21조 개정, 비회원제 골프장 회원모집 합법화 되는가?', cat: '골프 산업', date: '2025.08.04', read: '8분', img: '../assets/images/posts/post-sports-facility-law/post-sports-facility-law_cover.webp', desc: '2024년 2월 신설된 체육시설법 제21조 4항. 골프장과 숙박시설을 묶은 상품에 한해 비회원제도 예약우선권 회원권 발행이 가능해진다.' },
  { slug: 'post-suseo-cc', title: '군위수서CC 완벽 가이드, 자연과 골프의 완벽한 조화', cat: '골프 산업', date: '2025.07.15', read: '5분', img: '../assets/images/posts/post-suseo-cc/post-suseo-cc_cover.webp', desc: 'A·B·C 세 코스 18홀 6,997야드, 51실 골프텔, 페어웨이뷰 야외 수영장. 대구·구미에서도 접근성 좋은 자연 친화 골프 리조트의 시설과 진행 현황.' },
  { slug: 'post-prepaid-card', title: '선불카드로 돌파구 찾기, 골프장의 생존 전략', cat: '분양 전략', date: '2025.07.07', read: '4분', img: '../assets/images/posts/post-prepaid-card/post-prepaid-card_cover.webp', desc: '비수기 매출 하락, 고객 이탈… 선불카드는 위기를 기회로 바꿀 수 있을까. 골프장 운영의 복합 전략 도구.' },
  { slug: 'post-real-premium', title: "씨유레저의 '진짜 프리미엄' 회원권 분양 전략", cat: '분양 전략', date: '2025.07.02', read: '6분', img: '../assets/images/posts/post-real-premium/post-real-premium_cover.webp', desc: '외형의 고급화는 더 이상 차별점이 아니다. 진짜 프리미엄은 고객의 기억에 남는 경험에서 탄생한다.' },
  { slug: 'post-interview', title: '"흙먼지를 마시는 리더십", 류성현 영남지사장', cat: '전문가 인사이트', date: '2025.03.28', read: '5분', img: '../assets/images/posts/post-interview/post-interview_cover.webp', desc: '동의서 한 장을 받기 위해 가장 먼저 현장에 뛰어들던 시간. 영남지사가 회생 사업지에서 쌓아온 신뢰·속도·감정의 원칙.' },
  { slug: 'post-serenity', title: '세레니티CC & 리조트, 럭셔리와 자연이 공존하는 완벽한 휴식', cat: '골프 산업', date: '2025.02.15', read: '7분', img: '../assets/images/posts/post-serenity/post-serenity_cover.webp', desc: '그레이엄 마쉬 설계 27홀 코스와 건축가 김찬중의 리조트, KLPGA 투어 개최. 회원권 하나로 누리는 럭셔리 라이프스타일.' },
];

/* Related posts injection on post pages — auto-random from POSTS */
(function () {
  const isPost = location.pathname.includes('/posts/');
  if (!isPost) return;
  function inject() {
    const match = location.pathname.match(/post-[^.\/]+/);
    if (!match) return;
    const currentSlug = match[0];
    const others = POSTS.filter(p => p.slug !== currentSlug);
    if (others.length === 0) return;
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const related = others.slice(0, 3);
    const main = document.querySelector('main');
    if (!main) return;
    const section = document.createElement('section');
    section.className = 'related-posts';
    section.innerHTML = `
      <div class="container">
        <h3 class="related-title">이런 글도 있어요</h3>
        <div class="related-grid">
          ${related.map(p => `
            <a href="${p.slug}.html" class="related-card">
              <div class="related-thumb" style="background-image:url('${p.img}');"></div>
              <div class="related-body">
                <span class="related-cat">${p.cat}</span>
                <h4>${p.title}</h4>
                <div class="related-meta"><span>${p.date}</span><span>·</span><span>${p.read}</span></div>
              </div>
            </a>`).join('')}
        </div>
      </div>`;
    main.appendChild(section);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
