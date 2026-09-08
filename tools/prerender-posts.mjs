/**
 * 인사이트 카드 정적 프리렌더
 * common.js의 POSTS 배열을 읽어 insight.html(#insightGrid, 첫 페이지 9장 + noscript 전체 링크)과
 * index.html(#indexInsightPreview, CEO 인터뷰 + 최신 2편)에 정적 HTML을 써 넣는다.
 * JS는 로드 후 같은 내용으로 다시 그리므로 화면은 달라지지 않고, 크롤러는 링크를 바로 본다.
 *
 * 실행: node tools/prerender-posts.mjs   (글 추가·수정 후 매번 실행)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => writeFileSync(join(ROOT, p), s, 'utf8');

// POSTS 배열 추출 후 평가
const js = read('common.js');
const m = js.match(/const POSTS = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error('common.js에서 POSTS 배열을 찾지 못했습니다');
const POSTS = new Function(`return ${m[1]};`)();
const root = (p) => (p.startsWith('../') ? p.slice(3) : p);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function replaceBetween(html, startMark, endMark, inner, fallbackRe) {
  const s = html.indexOf(startMark), e = html.indexOf(endMark);
  if (s !== -1 && e !== -1) return html.slice(0, s) + startMark + '\n' + inner + '\n' + endMark + html.slice(e + endMark.length);
  // 첫 실행: 빈 컨테이너를 마커 포함 내용으로 교체
  const r = html.match(fallbackRe);
  if (!r) throw new Error('컨테이너를 찾지 못했습니다: ' + fallbackRe);
  return html.replace(fallbackRe, `${r[1]}${startMark}\n${inner}\n${endMark}${r[2]}`);
}

/* ---------- insight.html ---------- */
{
  let html = read('insight.html');
  const page = POSTS.slice(0, 9);
  const cards = page.map((p, i) => {
    const featured = i === 0;
    return `            <a href="posts/${p.slug}.html" class="insight-card ${featured ? 'featured-card' : ''}" data-cat="${esc(p.cat)}">
              <div class="insight-thumb" style="background-image:url('${root(p.img)}');"></div>
              <div class="insight-body ${featured ? 'featured-body' : ''}">
                <span class="insight-cat">${esc(p.cat)}</span>
                <h3${featured ? ' style="font-size:22px;"' : ''}>${esc(p.title)}</h3>
                <p>${esc(p.desc)}</p>
                <div class="insight-meta"><span>${p.date}</span><span>·</span><span>읽는 시간 약 ${p.read}</span></div>
              </div>
            </a>`;
  }).join('\n');
  const noscript = `            <noscript><ul class="insight-static-list">\n${POSTS.map(p => `              <li><a href="posts/${p.slug}.html">${esc(p.title)}</a> <span>${p.date}</span></li>`).join('\n')}\n            </ul></noscript>`;
  html = replaceBetween(html, '<!-- prerender:insight-grid -->', '<!-- /prerender:insight-grid -->', cards + '\n' + noscript,
    /(<div class="insight-grid" id="insightGrid">)([\s\S]*?<\/div>)/);
  // fallback 정규식은 빈 컨테이너 기준: `<div ... id="insightGrid"></div>` 의 `</div>` 앞에 삽입
  write('insight.html', html);
  console.log(`insight.html: ${page.length} cards + noscript ${POSTS.length} links`);
}

/* ---------- index.html ---------- */
{
  let html = read('index.html');
  const ceo = POSTS.find(p => p.slug === 'post-ceo-interview-2025');
  const others = POSTS.filter(p => p.slug !== 'post-ceo-interview-2025').slice(0, 2);
  const top3 = ceo ? [ceo, ...others] : POSTS.slice(0, 3);
  const cards = top3.map(p => `        <a href="posts/${p.slug}.html" class="card portfolio-card">
          <div class="portfolio-image" style="background-image:url('${root(p.img)}');"></div>
          <div class="portfolio-body">
            <span class="portfolio-tag">${esc(p.cat)}</span>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.desc)}</p>
          </div>
        </a>`).join('\n');
  html = replaceBetween(html, '<!-- prerender:index-insight -->', '<!-- /prerender:index-insight -->', cards,
    /(<div[^>]*id="indexInsightPreview"[^>]*>)([\s\S]*?<\/div>)/);
  write('index.html', html);
  console.log(`index.html: ${top3.length} cards`);
}
