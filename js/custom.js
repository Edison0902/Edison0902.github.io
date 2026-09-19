/* ============================================================
 * 全站自定义脚本
 * 由 _config.fluid.yml 中 custom_js 引入，包含：
 *   1. 页脚网站运行时间（实时秒级刷新）
 *   2. 鼠标点击爱心特效
 *   3. 切换浏览器标签页时的标题彩蛋
 * ============================================================ */
(function () {
  'use strict';

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

  function initAll() {
    initRuntime();
    initClickLove();
    initTitleEgg();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
