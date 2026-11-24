# Lançar Notas - VirtualIF (Extensão Chrome)

Extensão para Google Chrome (Manifest V3) que substitui a macro do Google Planilhas e preenche automaticamente as notas dos alunos no **VirtualIF** diretamente pela interface da extensão.

## Funcionalidades

- **Importação com separador (split) configurável**: cole os dados diretamente do Google Planilhas, Excel ou CSV e escolha o separador (`Tabulação`, `;`, `,`, `|`, `Espaço` ou `Personalizado`).
- **Pré-visualização em tabela**: confira os pares `Nome` e `Nota` extraídos antes de aplicar.
- **Filtros de correspondência**:
  - Ignorar maiúsculas e minúsculas (`MARIA` = `Maria`).
  - Ignorar acentos e caracteres especiais (`João` = `Joao`).
  - Normalizar espaços extras.
- **Preenchimento direto na página**: injeta no contexto da página (`MAIN` world), mantendo a chamada `jQuery(input).blur()` do VirtualIF e exibindo quais alunos foram preenchidos ou não encontrados.
- **Copiar JS**: opção extra para copiar o script JavaScript equivalente para o console, se desejar.

## Como instalar no Google Chrome

1. Abra o Chrome e acesse `chrome://extensions/`.
2. Ative o **Modo do desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** (*Load unpacked*).
4. Selecione a pasta deste projeto (`/home/danilo/Documentos/projetos/lancar-if`).
5. Fixe o ícone da extensão na barra do Chrome, abra a tela de lançamento de notas no VirtualIF, cole os dados e clique em **Preencher Notas no VirtualIF**.
