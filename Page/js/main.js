import { load, applyConfig, updatePositions, state, getRandomChineseSites } from './store.js';
import { initClock } from './clock.js';
import { initSearch } from './search.js';
import { renderSites, initContextMenu, openEditModal, closeEditModal, confirmEdit } from './sites.js';
import { initSettings } from './settings.js';
import { initWallpaper } from './wallpaper.js';
import { getFavicon } from './favicon.js';
import { showToast } from './utils.js';

function init() {
  load();
  if (!localStorage.getItem('mh_sites')) {
    state.sites = getRandomChineseSites();
    localStorage.setItem('mh_sites', JSON.stringify(state.sites));
  }
  afterSiteInit();
}

function afterSiteInit() {
  applyConfig();
  renderSites();
  initPositions();
  initClock();
  initSearch();
  initSettings();
  initWallpaper();
  initContextMenu();
  document.getElementById('site-edit-modal').addEventListener('click', function (e) { if (e.target === this) closeEditModal(); });
  document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
  document.getElementById('edit-confirm').addEventListener('click', confirmEdit);
  document.getElementById('edit-url').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); confirmEdit(); } });
  document.getElementById('edit-fetch-icon').addEventListener('click', function () {
    var urlInput = document.getElementById('edit-url');
    var iconInput = document.getElementById('edit-icon');
    var url = urlInput.value.trim();
    if (!url) { showToast('请先填写网址'); return; }
    if (!/^https?:\/\//i.test(url)) { showToast('网址需以 http:// 或 https:// 开头'); return; }
    var btn = document.getElementById('edit-fetch-icon');
    btn.textContent = '获取中...';
    btn.disabled = true;
    import('./favicon.js').then(function(m) {
      m.forceFetchFavicon(url).then(function (record) {
        btn.textContent = '获取图标';
        btn.disabled = false;
        if (record.fetchStatus === 'success') {
          if (record.url) iconInput.value = record.url;
          showToast('已重新获取并缓存图标');
        } else {
          showToast('未能获取到图标，请尝试手动输入链接');
        }
      });
    });
  });

  document.addEventListener('click', function (e) {
    var sp = document.getElementById('settings-panel');
    var wp = document.getElementById('wallpaper-panel');
    var sb = document.getElementById('settings-btn');
    var wb = document.getElementById('wallpaper-btn');
    if (sp.classList.contains('open') && !sp.contains(e.target) && !sb.contains(e.target)) {
      sp.classList.remove('open');
      document.querySelectorAll('.settings-page').forEach(function (p) { p.classList.remove('active'); });
      document.getElementById('settings-page-main').classList.add('active');
      document.getElementById('settings-title').textContent = '设置';
      document.getElementById('settings-back').classList.add('hidden');
    }
    if (wp.classList.contains('open') && !wp.contains(e.target) && !wb.contains(e.target)) {
      wp.classList.remove('open');
    }
  });
}

export function initPositions() {
  var mainWrap = document.getElementById('main-wrap');
  if (mainWrap.classList.contains('abs-pos')) {
    mainWrap.classList.remove('abs-pos');
    mainWrap.offsetHeight;
  }

  var viewportH = window.innerHeight;

  var clockWrap = document.getElementById('clock-wrap');
  if (!clockWrap.classList.contains('hidden') && localStorage.getItem('mh_cfg_clock_pos') === null) {
    var clockRect = clockWrap.getBoundingClientRect();
    var clockH = clockRect.height;
    var clockCenterY = clockRect.top + clockH / 2;
    var clockMinY = clockH / 2;
    var clockMaxY = viewportH - clockH / 2;
    if (clockMaxY > clockMinY) {
      var clockPct = Math.round((clockCenterY - clockMinY) / (clockMaxY - clockMinY) * 100);
      clockPct = Math.max(0, Math.min(100, clockPct));
      localStorage.setItem('mh_cfg_clock_pos', clockPct.toString());
    }
  }

  var searchWrap = document.getElementById('search-wrap');
  if (!searchWrap.classList.contains('hidden') && localStorage.getItem('mh_cfg_search_pos') === null) {
    var searchRect = searchWrap.getBoundingClientRect();
    var searchH = searchRect.height;
    var searchCenterY = searchRect.top + searchH / 2;
    var searchMinY = searchH / 2;
    var searchMaxY = viewportH - searchH / 2;
    if (searchMaxY > searchMinY) {
      var searchPct = Math.round((searchCenterY - searchMinY) / (searchMaxY - searchMinY) * 100);
      searchPct = Math.max(0, Math.min(100, searchPct));
      localStorage.setItem('mh_cfg_search_pos', searchPct.toString());
    }
  }

  var siteWrap = document.getElementById('site-wrap');
  if (!siteWrap.classList.contains('hidden') && localStorage.getItem('mh_cfg_sites_pos') === null) {
    var siteRect = siteWrap.getBoundingClientRect();
    var siteH = siteRect.height;
    var siteCenterY = siteRect.top + siteH / 2;
    var siteMinY = siteH / 2;
    var siteMaxY = viewportH - siteH / 2;
    if (siteMaxY > siteMinY) {
      var sitePct = Math.round((siteCenterY - siteMinY) / (siteMaxY - siteMinY) * 100);
      sitePct = Math.max(0, Math.min(100, sitePct));
      localStorage.setItem('mh_cfg_sites_pos', sitePct.toString());
    }
  }

  updatePositions();
  mainWrap.classList.add('abs-pos');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

var resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    var mainWrap = document.getElementById('main-wrap');
    if (mainWrap.classList.contains('abs-pos')) {
      updatePositions();
    }
  }, 200);
});
