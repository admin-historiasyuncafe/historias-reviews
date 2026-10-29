/**
 * Puente para GitHub Pages.
 * Imita google.script.run usando fetch hacia el web app de Apps Script,
 * así index.html funciona sin cambiar nada de su lógica ni de su diseño.
 *
 * ÚNICO PASO MANUAL: pega abajo la URL de tu implementación (la que termina en /exec).
 */
(function () {
  'use strict';

  var API_URL = 'https://script.google.com/a/macros/historiasyuncafe.com/s/AKfycbxa62-CDrAIsu50wKA48nCnl8Db01xNeFfvZOXH5pV6P0bSFphXyd_uu9k4Ixmo2ZM/exec';

  // Si la página corre dentro de Apps Script, no hace falta el puente.
  if (window.google && window.google.script && window.google.script.run) return;

  var ACTIONS = { getRecentData: 'recent', getOlderData: 'older' };

  function runner(ok, fail) {
    var r = {
      withSuccessHandler: function (f) { return runner(f, fail); },
      withFailureHandler: function (f) { return runner(ok, f); }
    };
    Object.keys(ACTIONS).forEach(function (fn) {
      r[fn] = function (arg) {
        var url = API_URL + '?action=' + ACTIONS[fn] + (arg ? '&force=1' : '');
        fetch(url, { method: 'GET', redirect: 'follow', credentials: 'omit', cache: 'no-store' })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(function (p) {
            if (!p || p.error || !Array.isArray(p.rows)) throw new Error((p && p.error) || 'respuesta invalida');
            return p;
          })
          .then(
            function (p) { if (ok) ok(p); },
            function (err) { if (fail) fail(err); }
          );
      };
    });
    return r;
  }

  window.google = { script: { run: runner() } };
})();
