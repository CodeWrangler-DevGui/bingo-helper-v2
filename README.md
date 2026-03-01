# Jogo de Bingo

## Descrição

Este é um jogo de bingo baseado na web, onde os usuários podem gerar suas próprias cartelas, jogar com regras diferentes e verificar os vencedores automaticamente.

## Funcionalidades

- Gere cartelas de bingo personalizadas com nome e cor.
- Insira seus próprios números (1-75).
- O centro da cartela é um espaço "FREE".
- Múltiplas regras de jogo: Cartela Cheia, Quatro Cantos, Linha Horizontal, Linha Vertical, Diagonal e Padrão Especial.
- As cartelas são agrupadas por cor.
- Detecção automática de vencedores.
- Opção de continuar o jogo ou iniciar uma nova rodada após uma vitória.
- Design responsivo para diferentes tamanhos de tela.

## Regras da Rodada

As regras da rodada definem qual padrão de números marcados na cartela resulta numa vitória.

Pode escolher a regra do jogo antes de começar a marcar os números. O jogo irá detetar automaticamente um vencedor assim que uma cartela completar o padrão da regra selecionada.

As regras disponíveis são:

- **Cartela Cheia:** Todos os 24 números e o espaço "FREE" central devem estar marcados.
- **Quatro Cantos:** Os 4 números nos cantos da cartela (o primeiro e o último da coluna B, e o primeiro e o último da coluna O) devem estar marcados.
- **Linha Horizontal:** Qualquer uma das 5 linhas horizontais completas deve estar marcada.
- **Linha Vertical:** Qualquer uma das 5 colunas verticais (B, I, N, G, O) completas deve estar marcada.
- **Diagonal:** Qualquer uma das 2 linhas diagonais completas (de canto a canto, passando pelo centro) deve estar marcada.
- **Padrão Especial:** Esta regra combina várias condições. Vence se completar qualquer um dos seguintes padrões: Quatro Cantos, uma Linha Horizontal, uma Linha Vertical ou uma Diagonal.

## Como Jogar

1. Abra o arquivo `https://devgui28.github.io/Jogo-Bingo/` em seu navegador da web.
2. Dê um nome para sua cartela.
3. Escolha uma cor para sua cartela.
4. Preencha os 24 números na cartela (o centro é um espaço "FREE").
5. Clique em "Adicionar Cartela" para adicionar sua cartela ao jogo.
6. Repita o processo para adicionar mais cartelas.
7. Selecione a regra do jogo para a rodada atual.
8. À medida que os números forem sorteados, clique nos números correspondentes em suas cartelas para marcá-los.
9. O jogo detectará e anunciará automaticamente o vencedor.

## Tecnologias Utilizadas

- HTML
- CSS
- JavaScript

## Estrutura de pastas
```
Bingo Helper
│
├── 📁 actions
│   └── 📄 bingo.ts
├── 📁 app
│   ├── 🎨 globals.css
│   ├── 🖼️ icon.png
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📁 components
│   ├── 📄 AddCardModal.tsx
│   └── 📄 BingoCard.tsx
├── 📁 lib
│   ├── 📄 bingo-utils.ts
│   └── 📄 prisma.ts
├── 📁 prisma
│   └── 📄 schema.prisma
├── 📁 public
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 eslint.config.mjs
├── 📄 next.config.ts
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 postcss.config.mjs
├── 📄 prisma.config.ts
└── ⚙️ tsconfig.json
```