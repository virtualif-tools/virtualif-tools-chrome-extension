(function () {
  function syncInputState(input) {
    if (!input || !input.classList || !input.classList.contains('_cx_chamada')) {
      return;
    }
    const val = (input.value || '').trim().toUpperCase();
    if (val === 'F' || val === 'I' || val === 'E') {
      input.setAttribute('data-chamada', val);
    } else {
      input.removeAttribute('data-chamada');
    }
  }

  function syncAll(root = document) {
    root.querySelectorAll('input._cx_chamada').forEach(syncInputState);
  }

  // Intercepta alterações programáticas em input.value (ex: jQuery .val())
  const valueDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  if (valueDesc && valueDesc.set && valueDesc.get) {
    Object.defineProperty(HTMLInputElement.prototype, 'value', {
      configurable: true,
      enumerable: true,
      get() {
        return valueDesc.get.call(this);
      },
      set(v) {
        valueDesc.set.call(this, v);
        if (this.classList && this.classList.contains('_cx_chamada')) {
          syncInputState(this);
        }
      },
    });
  }

  // Sincroniza ao carregar
  syncAll();

  // Atualiza em tempo real quando o professor digita no campo
  document.addEventListener('input', (e) => {
    if (e.target && e.target.matches && e.target.matches('input._cx_chamada')) {
      syncInputState(e.target);
    }
  });

  // Atualiza quando o campo ou qualquer <select> da página muda (ex: select em lote no topo da tabela)
  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches && e.target.matches('input._cx_chamada')) {
      syncInputState(e.target);
    } else if (e.target && e.target.tagName === 'SELECT') {
      setTimeout(() => syncAll(), 0);
    }
  });

  // Observa inserções dinâmicas na página (AJAX / troca de diário ou aula)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches && node.matches('input._cx_chamada')) {
          syncInputState(node);
        } else if (node.querySelectorAll) {
          syncAll(node);
        }
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
