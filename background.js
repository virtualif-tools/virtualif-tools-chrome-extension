chrome.runtime.onInstalled.addListener(() => {
  // Desabilita o ícone por padrão em todas as páginas
  chrome.action.disable();

  // Habilita o ícone em todo o domínio do VirtualIF
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostEquals: 'virtualif.iftm.edu.br',
              schemes: ['https'],
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});
