/**
 * Cerebro CRM — Client-side auth gate
 * Only a SHA-256 hash is stored here. The password never appears in source.
 * On correct entry a session token is saved so re-entry isn't needed until the tab closes.
 */
(function () {
  var HASH = '36e09cf891c6c313596d5143c0fb073a6a30ea1483c120730411a8358a005177';
  var TOKEN_KEY = '__cerebro_auth';

  // Already authenticated this session
  if (sessionStorage.getItem(TOKEN_KEY) === HASH) return;

  // Hide the real page content
  document.documentElement.style.visibility = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // Build the login overlay once DOM is ready
  function buildGate() {
    var overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;' +
      'background:#1e2a3a;font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;visibility:visible;';

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:12px;padding:40px 36px;width:360px;box-shadow:0 8px 32px rgba(0,0,0,0.25);text-align:center">' +
        '<div style="font-size:22px;font-weight:700;color:#2d3748;margin-bottom:4px">Cerebro<span style="color:#d4813e">CRM</span></div>' +
        '<div style="font-size:13px;color:#94a0b4;margin-bottom:28px">Enter password to continue</div>' +
        '<input id="authPwd" type="password" placeholder="Password" autocomplete="off" ' +
          'style="width:100%;padding:12px 16px;border:1px solid #e2e6ed;border-radius:8px;font-size:14px;outline:none;color:#2d3748;margin-bottom:8px">' +
        '<div id="authErr" style="font-size:12px;color:#c4524a;min-height:20px;margin-bottom:12px"></div>' +
        '<button id="authBtn" style="width:100%;padding:12px 0;background:#3b6b9a;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s">Sign In</button>' +
      '</div>';

    document.body.appendChild(overlay);

    var pwd = document.getElementById('authPwd');
    var btn = document.getElementById('authBtn');
    var err = document.getElementById('authErr');

    btn.onmouseenter = function () { btn.style.background = '#2f5a84'; };
    btn.onmouseleave = function () { btn.style.background = '#3b6b9a'; };

    function attempt() {
      var val = pwd.value;
      if (!val) { err.textContent = 'Please enter a password'; return; }
      // Hash input with Web Crypto and compare
      var enc = new TextEncoder();
      crypto.subtle.digest('SHA-256', enc.encode(val)).then(function (buf) {
        var hex = Array.from(new Uint8Array(buf)).map(function (b) {
          return b.toString(16).padStart(2, '0');
        }).join('');
        if (hex === HASH) {
          sessionStorage.setItem(TOKEN_KEY, HASH);
          overlay.remove();
          document.documentElement.style.visibility = '';
          document.documentElement.style.overflow = '';
        } else {
          err.textContent = 'Incorrect password';
          pwd.value = '';
          pwd.focus();
        }
      });
    }

    btn.onclick = attempt;
    pwd.onkeydown = function (e) { if (e.key === 'Enter') attempt(); };
    pwd.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGate);
  } else {
    buildGate();
  }
})();
