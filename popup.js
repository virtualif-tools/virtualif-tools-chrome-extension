const STORAGE_KEY = 'virtualif_lancar_notas_state';

const els = {
  rawInput: document.getElementById('rawInput'),
  delimiterSelect: document.getElementById('delimiterSelect'),
  customDelimiterGroup: document.getElementById('customDelimiterGroup'),
  customDelimiter: document.getElementById('customDelimiter'),
  skipHeader: document.getElementById('skipHeader'),
  ignoreCase: document.getElementById('ignoreCase'),
  ignoreSpecialChars: document.getElementById('ignoreSpecialChars'),
  trimSpaces: document.getElementById('trimSpaces'),
  highlightF: document.getElementById('highlightF'),
  highlightI: document.getElementById('highlightI'),
  highlightE: document.getElementById('highlightE'),
  colorModules: document.getElementById('colorModules'),
  parsedCount: document.getElementById('parsedCount'),
  skippedInfo: document.getElementById('skippedInfo'),
  previewSection: document.getElementById('previewSection'),
  previewBody: document.getElementById('previewBody'),
  btnClear: document.getElementById('btnClear'),
  btnFill: document.getElementById('btnFill'),
  statusBox: document.getElementById('statusBox'),
};

function getActiveDelimiter() {
  const val = els.delimiterSelect.value;
  if (val === '\\t') return '\t';
  if (val === 'custom') return els.customDelimiter.value;
  return val;
}

function getFilterOptions() {
  return {
    ignoreCase: els.ignoreCase.checked,
    ignoreSpecialChars: els.ignoreSpecialChars.checked,
    trimSpaces: els.trimSpaces.checked,
  };
}

function parseStudentData() {
  const raw = els.rawInput.value;
  const delimiter = getActiveDelimiter();
  const alunos = [];
  let skipped = 0;

  if (!raw.trim() || !delimiter) {
    return { alunos, skipped };
  }

  const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== '');
  const startIndex = els.skipHeader.checked && lines.length > 0 ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    let nome = '';
    let nota = '';

    if (delimiter === ' ') {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        nota = parts.pop();
        nome = parts.join(' ');
      }
    } else {
      const parts = line.split(delimiter);
      if (parts.length >= 2) {
        nome = parts[0].trim();
        nota = parts[1].trim();
      }
    }

    if (nome !== '' && nota !== '') {
      alunos.push({ nome, nota });
    } else {
      skipped++;
    }
  }

  return { alunos, skipped };
}

function renderPreview() {
  const { alunos, skipped } = parseStudentData();
  const count = alunos.length;

  els.parsedCount.textContent = `${count} ${count === 1 ? 'aluno' : 'alunos'}`;
  els.parsedCount.classList.toggle('has-items', count > 0);

  els.btnFill.disabled = count === 0;

  if (count === 0 && skipped === 0) {
    els.previewSection.classList.add('hidden');
    els.previewBody.innerHTML = '';
    els.skippedInfo.textContent = '';
    return;
  }

  els.previewSection.classList.remove('hidden');
  els.skippedInfo.textContent =
    skipped > 0 ? `${skipped} ${skipped === 1 ? 'linha ignorada' : 'linhas ignoradas'}` : '';

  const fragment = document.createDocumentFragment();
  alunos.forEach((aluno, idx) => {
    const tr = document.createElement('tr');

    const tdIdx = document.createElement('td');
    tdIdx.textContent = String(idx + 1);

    const tdNome = document.createElement('td');
    tdNome.textContent = aluno.nome;

    const tdNota = document.createElement('td');
    tdNota.textContent = aluno.nota;

    tr.append(tdIdx, tdNome, tdNota);
    fragment.appendChild(tr);
  });

  els.previewBody.innerHTML = '';
  els.previewBody.appendChild(fragment);
}

function saveState() {
  const state = {
    rawInput: els.rawInput.value,
    delimiterSelect: els.delimiterSelect.value,
    customDelimiter: els.customDelimiter.value,
    skipHeader: els.skipHeader.checked,
    ignoreCase: els.ignoreCase.checked,
    ignoreSpecialChars: els.ignoreSpecialChars.checked,
    trimSpaces: els.trimSpaces.checked,
    highlightF: els.highlightF.checked,
    highlightI: els.highlightI.checked,
    highlightE: els.highlightE.checked,
    colorModules: els.colorModules.checked,
  };
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

function restoreState() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const state = result[STORAGE_KEY];
    if (state) {
      if (typeof state.rawInput === 'string') els.rawInput.value = state.rawInput;
      if (typeof state.delimiterSelect === 'string') els.delimiterSelect.value = state.delimiterSelect;
      if (typeof state.customDelimiter === 'string') els.customDelimiter.value = state.customDelimiter;
      if (typeof state.skipHeader === 'boolean') els.skipHeader.checked = state.skipHeader;
      if (typeof state.ignoreCase === 'boolean') els.ignoreCase.checked = state.ignoreCase;
      if (typeof state.ignoreSpecialChars === 'boolean') els.ignoreSpecialChars.checked = state.ignoreSpecialChars;
      if (typeof state.trimSpaces === 'boolean') els.trimSpaces.checked = state.trimSpaces;
      if (typeof state.highlightF === 'boolean') els.highlightF.checked = state.highlightF;
      if (typeof state.highlightI === 'boolean') els.highlightI.checked = state.highlightI;
      if (typeof state.highlightE === 'boolean') els.highlightE.checked = state.highlightE;
      if (typeof state.colorModules === 'boolean') els.colorModules.checked = state.colorModules;
    }

    els.customDelimiterGroup.classList.toggle('hidden', els.delimiterSelect.value !== 'custom');
    renderPreview();
  });
}

let toastTimer = null;

function hideStatus() {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  els.statusBox.classList.add('hidden');
}

function showStatus(type, message, unmatchedNames = []) {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  els.statusBox.className = `toast ${type}`;
  els.statusBox.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'toast-header';

  const msgEl = document.createElement('div');
  msgEl.className = 'toast-message';
  msgEl.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast-close';
  closeBtn.title = 'Fechar';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', hideStatus);

  header.append(msgEl, closeBtn);
  els.statusBox.appendChild(header);

  if (unmatchedNames.length > 0) {
    const label = document.createElement('div');
    label.style.marginTop = '6px';
    label.style.fontWeight = '600';
    label.textContent = `Não encontrados na página (${unmatchedNames.length}):`;
    els.statusBox.appendChild(label);

    const ul = document.createElement('ul');
    unmatchedNames.forEach((name) => {
      const li = document.createElement('li');
      li.textContent = name;
      ul.appendChild(li);
    });
    els.statusBox.appendChild(ul);
  }

  // Auto-fecha apenas mensagens simples de sucesso; avisos/erros permanecem visíveis até o usuário fechar
  if (type === 'success' && unmatchedNames.length === 0) {
    toastTimer = setTimeout(hideStatus, 5000);
  }
}

/**
 * Função injetada diretamente no contexto MAIN da página do VirtualIF
 * para manter compatibilidade com jQuery(...).blur() e listeners da página.
 */
function applyGradesInPage(alunos, filterOptions) {
  function normalizeName(str) {
    let s = String(str ?? '');
    if (filterOptions.trimSpaces) {
      s = s.trim().replace(/\s+/g, ' ');
    } else {
      s = s.trim();
    }
    if (filterOptions.ignoreCase) {
      s = s.toLowerCase();
    }
    if (filterOptions.ignoreSpecialChars) {
      s = s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return s;
  }

  const normalizedAlunos = alunos.map((a, idx) => ({
    idx,
    nomeNorm: normalizeName(a.nome),
    nota: a.nota,
  }));

  let tableRowsWithInput = 0;
  let filledCount = 0;
  const matchedInputIndices = [];

  document.querySelectorAll('.tabela_itens tr').forEach((item) => {
    try {
      const tds = item.querySelectorAll('td');
      if (tds.length < 3) return;

      const input = tds[2].querySelector('input');
      if (!input) return;

      tableRowsWithInput++;
      const cellNameNorm = normalizeName(tds[1].innerText);

      for (let i = 0; i < normalizedAlunos.length; i++) {
        if (cellNameNorm === normalizedAlunos[i].nomeNorm) {
          input.value = normalizedAlunos[i].nota;
          if (typeof window.jQuery === 'function') {
            window.jQuery(input).blur();
          } else {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
          }
          filledCount++;
          matchedInputIndices.push(normalizedAlunos[i].idx);
          break;
        }
      }
    } catch (e) {
      // Ignora linhas malformadas, mantendo comportamento original
    }
  });

  if (tableRowsWithInput > 0) {
    console.log(`VirtualIF Notas: ${filledCount} nota(s) preenchida(s) com sucesso.`);
  }

  return { tableRowsWithInput, filledCount, matchedInputIndices };
}

async function handleFillGrades() {
  const { alunos } = parseStudentData();
  if (alunos.length === 0) return;

  const filterOptions = getFilterOptions();
  els.btnFill.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showStatus('error', 'Não foi possível identificar a aba ativa.');
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      world: 'MAIN',
      func: applyGradesInPage,
      args: [alunos, filterOptions],
    });

    let totalTableRows = 0;
    let totalFilled = 0;
    const matchedSet = new Set();

    for (const frameResult of results) {
      if (frameResult && frameResult.result) {
        totalTableRows += frameResult.result.tableRowsWithInput;
        totalFilled += frameResult.result.filledCount;
        frameResult.result.matchedInputIndices.forEach((idx) => matchedSet.add(idx));
      }
    }

    if (totalTableRows === 0) {
      showStatus(
        'error',
        'Nenhuma tabela de notas (.tabela_itens) foi encontrada nesta página. Certifique-se de estar na tela de lançamento de notas do VirtualIF.'
      );
      return;
    }

    const unmatchedNames = alunos
      .filter((_, idx) => !matchedSet.has(idx))
      .map((a) => a.nome);

    if (unmatchedNames.length === 0) {
      showStatus(
        'success',
        `Sucesso! ${totalFilled} de ${alunos.length} nota(s) preenchida(s) no VirtualIF.`
      );
    } else {
      showStatus(
        'warning',
        `Preenchidas ${totalFilled} de ${alunos.length} nota(s) (${totalTableRows} campo(s) na tabela).`,
        unmatchedNames
      );
    }
  } catch (err) {
    showStatus('error', `Erro ao executar na página: ${err.message}`);
  } finally {
    els.btnFill.disabled = parseStudentData().alunos.length === 0;
  }
}

// Event Listeners
els.delimiterSelect.addEventListener('change', () => {
  els.customDelimiterGroup.classList.toggle('hidden', els.delimiterSelect.value !== 'custom');
  renderPreview();
  saveState();
});

[els.rawInput, els.customDelimiter].forEach((el) => {
  el.addEventListener('input', () => {
    renderPreview();
    saveState();
  });
});

[els.skipHeader, els.ignoreCase, els.ignoreSpecialChars, els.trimSpaces].forEach((el) => {
  el.addEventListener('change', () => {
    renderPreview();
    saveState();
  });
});

[els.highlightF, els.highlightI, els.highlightE, els.colorModules].forEach((el) => {
  el.addEventListener('change', saveState);
});

els.btnClear.addEventListener('click', () => {
  els.rawInput.value = '';
  els.statusBox.classList.add('hidden');
  renderPreview();
  saveState();
});

els.btnFill.addEventListener('click', handleFillGrades);

document.addEventListener('DOMContentLoaded', restoreState);
