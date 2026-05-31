import { cfg } from './store.js';

export function showToast(msg) {
  var toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 2000);
}

export function formatRangeLabel(key, val, unit) {
  if (key === 'site_cols') {
    if (val === '0') return '自动';
    return val + '个';
  }
  if (key === 'clock_pos' || key === 'search_pos' || key === 'sites_pos') {
    var viewportH = window.innerHeight;
    var pct = parseInt(val) || 0;
    var elem = null;
    var h = 0;
    if (key === 'clock_pos') {
      elem = document.getElementById('clock-wrap');
    } else if (key === 'search_pos') {
      elem = document.getElementById('search-wrap');
    } else if (key === 'sites_pos') {
      elem = document.getElementById('site-wrap');
    }
    if (elem && !elem.classList.contains('hidden')) {
      h = elem.getBoundingClientRect().height;
    }
    if (h > 0) {
      var minY = h / 2;
      var maxY = viewportH - h / 2;
      var actualY = Math.round(minY + (maxY - minY) * pct / 100);
      return pct + '% (' + actualY + 'px)';
    }
  }
  if (unit) return val + unit;
  return val;
}

export function refreshSettingsUI() {
  document.querySelectorAll('.toggle-switch').forEach(function (el) {
    var key = el.dataset.key;
    if (cfg(key) === '1') el.classList.add('on');
    else el.classList.remove('on');
  });
  document.querySelectorAll('input[type="range"][data-key]').forEach(function (el) {
    var key = el.dataset.key;
    var unit = el.dataset.unit;
    var val = cfg(key);
    el.value = val;
    el.nextElementSibling.textContent = formatRangeLabel(key, val, unit);
  });
  document.querySelectorAll('select[data-key], input[data-key][list]').forEach(function (el) {
    el.value = cfg(el.dataset.key);
  });
  document.querySelectorAll('.preset-row').forEach(function (row) {
    var group = row.dataset.presetGroup;
    var currentStyle = cfg(group + '_style');
    row.querySelectorAll('.preset-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.preset === currentStyle);
    });
  });
  refreshFontPicker();
}

function refreshFontPicker() {
  var picker = document.getElementById('clock-font-picker');
  if (!picker) return;
  var preview = picker.querySelector('.font-picker-preview');
  var font = cfg('clock_font');
  picker.querySelectorAll('.font-picker-option').forEach(function (opt) {
    opt.classList.toggle('active', opt.dataset.font === font);
  });
  preview.textContent = font || '默认';
  preview.style.fontFamily = '';
}

export function refreshBgFitUI() {
  var currentFit = cfg('bg_fit');
  document.querySelectorAll('.bg-fit-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.fit === currentFit);
  });
}
