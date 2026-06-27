## Objetivo

Adicionar duas novas etapas experimentais ao fluxo, mantendo todo o visual e a arquitetura atuais (motor de simulação, scoring, contexto de experimento, design system).

## Novo fluxo (13 etapas)

```
1. Introdução
2. Objetivo
3. Preparação da reação
4. Checklist da bancada
5. Programação do Termociclador   ← NOVA
6. Início do sequenciamento (primer/polimerase)
7. Incorporação / terminação
8. Formação dos fragmentos
9. Purificação dos produtos       ← NOVA
10. Eletroforese capilar
11. Eletroferograma
12. Interpretação clínica
13. Resultado final
```

Posicionamento conforme pedido: termociclador logo após a preparação (antes das telas microscópicas de pareamento/incorporação, que são a "visualização" do que acontece dentro do ciclo), e purificação imediatamente antes da eletroforese capilar.

## Telas novas

### Tela "Programação do Termociclador" (`ThermocyclerScreen.tsx`)

- Layout em painel de vidro consistente com as demais telas (`PageShell` + `StepHeader`).
- À esquerda: ilustração de termociclador moderno aberto (SVG inline com bloco aquecedor, poços e tampa estilizados em tons do tema).
- Três slots verticais: **Desnaturação**, **Anelamento**, **Extensão** — cada um aceita um cartão de temperatura.
- Abaixo: 6 cartões arrastáveis com temperaturas embaralhadas (95, 72, 55, 40, 85, 25 °C). Drag-and-drop nativo HTML5 (sem nova dependência) + fallback de clique-para-selecionar/clique-para-encaixar para mobile.
- Validação por slot ao soltar: feedback verde/vermelho conforme textos fornecidos. Tentar errado não bloqueia — o cartão volta e exibe o feedback explicativo (modo supervisor).
- Painel lateral "Você sabia?" com a curiosidade dos múltiplos ciclos.
- Indicador de ciclos (ex.: badge "25–35 ciclos") apenas informativo.
- Avançar habilita quando as três posições estiverem corretas (95 / 55 / 72).
- Estado persistido no reducer global (`thermocycler: { denat, anneal, extend }`) para alimentar score.

### Tela "Purificação dos Produtos" (`PurificationScreen.tsx`)

- Centro: tubo Eppendorf estilizado contendo "ícones-token" de cada componente flutuando dentro (Fragmentos fluorescentes coloridos + primers, polimerase, dNTPs, ddNTPs, sais).
- Lateral: lista dos 6 componentes com toggles "Manter / Remover".
- Apenas **Fragmentos fluorescentes** deve permanecer; demais devem ser removidos.
- Cada toggle dispara o feedback científico correspondente (textos fornecidos), exibido em um painel de tutor.
- Botão "Executar purificação" só fica ativo quando a seleção do aluno está pronta — não bloqueia se errada, mas registra erros para o score e mostra animação alternativa (amostra "suja").
- **Animação pós-confirmação**: usando Framer Motion, amostra passa por uma coluna/beads magnéticas (representação esquemática). Componentes marcados para remoção saem do tubo (fade + slide para fora); fragmentos fluorescentes permanecem e pulsam suavemente. Duração ~3–4 s, com botão "Pular animação".
- Mensagem final adapta-se à qualidade da purificação (ex.: "Amostra limpa" vs "Amostra com contaminantes — leitura ruidosa esperada"). **Não altera os picos do eletroferograma** (a purificação não cria fragmentos), mas adiciona uma camada de "ruído de baseline" visual na tela de eletroferograma quando há contaminantes — implementada como prop opcional para não tocar no motor de simulação.

## Mudanças no estado global

Em `src/components/sanger/state.tsx`:

- Adicionar à `STEPS`: `"thermocycler"` (após `checklist`) e `"purification"` (após `fragments`).
- Estender `ExperimentState`:
  - `thermocycler: { denat: number|null; anneal: number|null; extend: number|null }`
  - `purification: { kept: Set<ComponentId> }`
- Novas actions: `setThermoSlot`, `togglePurificationKeep`, `commitPurification`.
- `initial()` zera ambos.

## Mudanças no roteador

Em `src/routes/index.tsx`: importar e mapear os dois novos `case` no `switch`.

## Scoring (`src/lib/scoring.ts`)

Adicionar duas contribuições suaves (não alteram o motor biológico):

- Termociclador: +pontos se as três temperaturas corretas na primeira tentativa; pequena penalidade por tentativa errada.
- Purificação: +pontos se manteve apenas fragmentos; penalidade proporcional ao número de contaminantes mantidos ou de fragmentos descartados.

Esses sinais aparecem no `ResultScreen` existente, em uma nova seção "Boas práticas laboratoriais", sem refatorar o que já está lá.

## Aprendizagem por erro — diretriz aplicada

Ambas as telas permitem prosseguir com erros não-críticos. O feedback do "tutor" descreve em cada caso:

- impacto no experimento (ex.: "primers livres → picos espúrios curtos no início do eletroferograma");
- o que se observaria em laboratório real;
- como corrigir;
- conceito envolvido (link curto reaproveitando textos de `src/data/concepts.ts`, expandido se necessário).

## Conteúdo / dados

- Novo arquivo `src/data/thermocycler.ts` com as temperaturas, respostas corretas, feedbacks e curiosidade.
- Novo arquivo `src/data/purification.ts` com a lista de componentes, decisão correta e feedbacks.

Mantém o princípio de separar texto pedagógico da UI (mesmo padrão de `concepts.ts` e `cases.ts`).

## Fora de escopo

- Não alterar motor (`sanger-engine.ts`) nem casos clínicos.
- Não alterar telas de eletroforese capilar, eletroferograma, interpretação e resultado, exceto:
  - eletroferograma recebe prop opcional `baselineNoise` quando a purificação foi malfeita;
  - resultado ganha uma seção compacta de "Boas práticas laboratoriais".
- Sem novas dependências (drag-and-drop nativo; animações com Framer Motion já instalado).

## Arquivos afetados

- Novos: `src/components/sanger/ThermocyclerScreen.tsx`, `src/components/sanger/PurificationScreen.tsx`, `src/data/thermocycler.ts`, `src/data/purification.ts`.
- Editados: `src/components/sanger/state.tsx`, `src/routes/index.tsx`, `src/lib/scoring.ts`, `src/components/sanger/ElectroScreen.tsx` (prop opcional), `src/components/sanger/ResultScreen.tsx` (seção extra), possivelmente `src/data/concepts.ts` (textos de consequência de contaminantes/temperaturas).
