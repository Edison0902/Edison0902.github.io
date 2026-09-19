/* ============================================================
 * 全站自定义脚本
 * 由 _config.fluid.yml 中 custom_js 引入，包含：
 *   1. 页脚网站运行时间（实时秒级刷新）
 *   2. 鼠标点击爱心特效
 *   3. 切换浏览器标签页时的标题彩蛋
 *   4. 文章页阅读进度条
 *   5. TOP 按钮显示阅读百分比
 *   6. 键盘快捷键：← / → 翻上下一篇，S 或 / 打开搜索
 *   7. 页脚个人访问打卡（localStorage）
 *   8. 首页时间问候语
 *   9. 文章分享按钮（系统分享 / 复制链接）
 *  10. PWA：注入 manifest 并注册 Service Worker（离线访问）
 *  11. 控制台彩蛋
 * ============================================================ */
(function () {
  'use strict';

  var IS_POST = /\/20\d{2}\//.test(location.pathname) && document.querySelector('.markdown-body');

  /* ---------- 1. 页脚：网站运行时间 ---------- */
  // 博客启用日期，可自行修改
  var SITE_START = new Date('2025-06-01T00:00:00');

  function runtimeText() {
    var now = new Date();
    var days = Math.floor((now - SITE_START) / 86400000);
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return '\uD83D\uDE80 本站已安全运行 ' + days + ' 天 ' + pad(now.getHours()) +
      ' 小时 ' + pad(now.getMinutes()) + ' 分 ' + pad(now.getSeconds()) + ' 秒';
  }

  function initRuntime() {
    var footer = document.querySelector('footer');
    if (!footer || document.getElementById('site-runtime')) return;
    var el = document.createElement('div');
    el.id = 'site-runtime';
    footer.appendChild(el);
    var tick = function () { el.textContent = runtimeText(); };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 2. 鼠标点击爱心特效 ---------- */
  function initClickLove() {
    document.addEventListener('click', function (e) {
      var heart = document.createElement('span');
      var size = 10 + Math.random() * 12;
      heart.textContent = '\u2764';
      heart.style.cssText =
        'position:fixed;z-index:99999;pointer-events:none;user-select:none;' +
        'left:' + (e.clientX - size / 2) + 'px;top:' + (e.clientY - size) + 'px;' +
        'font-size:' + size + 'px;color:hsl(' + Math.floor(Math.random() * 360) +
        ',80%,60%);transition:transform 1s ease-out,opacity 1s ease-out;';
      document.body.appendChild(heart);
      requestAnimationFrame(function () {
        heart.style.transform = 'translateY(-40px)';
        heart.style.opacity = '0';
      });
      setTimeout(function () { heart.remove(); }, 1100);
    });
  }

  /* ---------- 3. 切换标签页时修改标题 ---------- */
  function initTitleEgg() {
    var origin = document.title;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        document.title = '(\u25CF\u2014\u25CF) 我被藏起来了~ ';
      } else {
        document.title = '\uFF9E\uFF7E(\u2267\u25BD\u2266)\uFF89\uFF8F 欢迎回来！';
        setTimeout(function () { document.title = origin; }, 1500);
      }
    });
  }

  /* ---------- 4. 文章页阅读进度条 ---------- */
  function initReadingProgress() {
    if (!IS_POST || document.getElementById('reading-progress')) return;
    var bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);

    var update = function () {
      var doc = document.documentElement;
      var total = doc.scrollHeight - window.innerHeight;
      var pct = total > 0 ? Math.min(100, Math.round((window.scrollY / total) * 100)) : 0;
      bar.style.width = pct + '%';
      var topBtn = document.getElementById('scroll-pct');
      if (topBtn) topBtn.textContent = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 5. TOP 按钮显示阅读百分比 ---------- */
  function initTopPercent() {
    if (!IS_POST) return;
    var btn = document.getElementById('scroll-top-button');
    if (!btn || document.getElementById('scroll-pct')) return;
    var label = document.createElement('span');
    label.id = 'scroll-pct';
    label.textContent = '0%';
    btn.appendChild(label);
  }

  /* ---------- 6. 键盘快捷键 ---------- */
  function initShortcuts() {
    document.addEventListener('keydown', function (e) {
      var target = e.target;
      var typing = target && (
        /INPUT|TEXTAREA|SELECT/.test(target.tagName) ||
        target.isContentEditable
      );
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

      // ← / → 翻上下一篇（仅文章页）
      if (IS_POST) {
        if (e.key === 'ArrowLeft') {
          var prev = document.querySelector('.post-prevnext .post-prev a[href]');
          if (prev) { location.href = prev.href; return; }
        }
        if (e.key === 'ArrowRight') {
          var next = document.querySelector('.post-prevnext .post-next a[href]');
          if (next) { location.href = next.href; return; }
        }
      }

      // S 或 / 打开搜索
      if (e.key === 's' || e.key === 'S' || e.key === '/') {
        var searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
          e.preventDefault();
          var link = searchBtn.querySelector('a');
          if (link) link.click();
        }
      }
    });
  }

  /* ---------- 7. 页脚个人访问打卡 ---------- */
  function initVisitTracker() {
    var footer = document.querySelector('footer');
    if (!footer || document.getElementById('visit-footprint')) return;

    var today = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    var dateStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
    var yesterday = new Date(today.getTime() - 86400000);
    var yestStr = yesterday.getFullYear() + '-' + pad(yesterday.getMonth() + 1) + '-' + pad(yesterday.getDate());

    var count = parseInt(localStorage.getItem('zhi_visit_count') || '0', 10);
    var last = localStorage.getItem('zhi_last_visit') || '';
    var streak = parseInt(localStorage.getItem('zhi_streak') || '0', 10);

    if (last !== dateStr) {
      count += 1;
      streak = (last === yestStr) ? streak + 1 : 1;
      localStorage.setItem('zhi_visit_count', String(count));
      localStorage.setItem('zhi_last_visit', dateStr);
      localStorage.setItem('zhi_streak', String(streak));
    }
    if (count === 0) { count = 1; streak = 1; }

    var el = document.createElement('div');
    el.id = 'visit-footprint';
    el.textContent = '\uD83D\uDC63 您已来访 ' + count + ' 次 · 连续打卡 ' + streak + ' 天';
    footer.appendChild(el);
  }

  /* ---------- 8. 首页时间问候语 ---------- */
  function initGreeting() {
    var subtitle = document.getElementById('subtitle');
    if (!subtitle || document.getElementById('time-greeting')) return;
    var h = new Date().getHours();
    var text =
      (h >= 5 && h < 11) ? '\uD83C\uDF05 早上好，今天也要元气满满！' :
      (h >= 11 && h < 14) ? '\uD83C\uDF5A 中午好，记得吃午饭~' :
      (h >= 14 && h < 18) ? '\u2615 下午好，来杯咖啡提提神' :
      (h >= 18 && h < 23) ? '\uD83C\uDF19 晚上好，夜读时光正合适' :
      '\uD83C\uDF1B 夜深了，注意休息哦';
    var el = document.createElement('div');
    el.id = 'time-greeting';
    el.textContent = text;
    subtitle.parentNode.parentNode.insertBefore(el, subtitle.parentNode);
  }

  /* ---------- 9. 文章分享按钮 ---------- */
  function toast(msg) {
    var t = document.createElement('div');
    t.id = 'share-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2000);
  }

  function initShareButton() {
    if (!IS_POST || document.getElementById('share-btn')) return;
    var anchor = document.querySelector('.license-box');
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.id = 'share-btn';
    btn.type = 'button';
    btn.innerHTML = '\u21F1 \u5206\u4EAB\u672C\u6587';
    btn.addEventListener('click', function () {
      var payload = {
        title: document.title,
        text: document.title,
        url: location.href
      };
      if (navigator.share) {
        navigator.share(payload).catch(function () { /* 用户取消 */ });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function () {
          toast('\u94FE\u63A5\u5DF2\u590D\u5236\uFF0C\u53BB\u5206\u4EAB\u5427\uFF01');
        });
      } else {
        var input = document.createElement('input');
        input.value = location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        toast('\u94FE\u63A5\u5DF2\u590D\u5236\uFF0C\u53BB\u5206\u4EAB\u5427\uFF01');
      }
    });
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
  }

  /* ---------- 10. PWA：manifest 注入 + Service Worker 注册 ---------- */
  function initPWA() {
    try {
      if (!document.querySelector('link[rel="manifest"]')) {
        var link = document.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest.json';
        document.head.appendChild(link);
      }
      if (!document.querySelector('meta[name="theme-color"]')) {
        var meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#2f4154';
        document.head.appendChild(meta);
      }
      if ('serviceWorker' in navigator &&
          location.protocol === 'https:' &&
          !/localhost|127\.0\.0\.1/.test(location.hostname)) {
        navigator.serviceWorker.register('/sw.js').catch(function () { /* 注册失败静默 */ });
      }
    } catch (e) { /* PWA 失败不影响主站 */ }
  }

  /* ---------- 11. 控制台彩蛋 ---------- */
  function initConsoleEgg() {
    console.log(
      '%cZhi Blog %c你好，朋友！\n欢迎来我的博客逛逛：' + location.origin +
      '\n如果发现 bug，欢迎通过「关于」页的邮箱联系我 \uD83D\uDE0A',
      'color:#165dff;font-size:22px;font-weight:bold;',
      'color:inherit;font-size:12px;'
    );
  }

  function initAll() {
    initRuntime();
    initClickLove();
    initTitleEgg();
    initReadingProgress();
    initTopPercent();
    initShortcuts();
    initVisitTracker();
    initGreeting();
    initShareButton();
    initPWA();
    initConsoleEgg();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
