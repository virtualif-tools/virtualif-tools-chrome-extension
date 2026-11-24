(function () {
  const STORAGE_KEY = 'virtualif_lancar_notas_state';

  function applyHighlightPrefs(state) {
    const root = document.documentElement;
    if (!root) return;

    const highlightF = state && typeof state.highlightF === 'boolean' ? state.highlightF : true;
    const highlightI = state && typeof state.highlightI === 'boolean' ? state.highlightI : true;
    const highlightE = state && typeof state.highlightE === 'boolean' ? state.highlightE : true;
    const colorModules = state && typeof state.colorModules === 'boolean' ? state.colorModules : true;

    root.setAttribute('data-destaque-f', highlightF ? '1' : '0');
    root.setAttribute('data-destaque-i', highlightI ? '1' : '0');
    root.setAttribute('data-destaque-e', highlightE ? '1' : '0');
    root.setAttribute('data-colorir-modulos', colorModules ? '1' : '0');
  }

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    applyHighlightPrefs(result[STORAGE_KEY]);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      applyHighlightPrefs(changes[STORAGE_KEY].newValue);
    }
  });
})();
