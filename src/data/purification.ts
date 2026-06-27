export type PurifId =
  | "frags"
  | "template"
  | "primers"
  | "pol"
  | "dntp"
  | "ddntp"
  | "salts";

export interface PurifComponent {
  id: PurifId;
  label: string;
  icon: string;
  keep: boolean; // true = deve permanecer na amostra
  /** Feedback exibido ao escolher MANTER este componente. */
  keepFeedback: string;
  /** Feedback exibido ao escolher REMOVER este componente. */
  removeFeedback: string;
  /** Cor para o "token" dentro do tubo. */
  color?: string;
}

export const PURIF_COMPONENTS: PurifComponent[] = [
  {
    id: "frags",
    label: "Fragmentos de DNA fluorescentes",
    icon: "✨",
    keep: true,
    keepFeedback:
      "Correto! Apenas os fragmentos de DNA fluorescentes devem permanecer — serão separados por tamanho na eletroforese capilar.",
    removeFeedback:
      "Esses são justamente os fragmentos de DNA fluorescentes que precisamos! Removê-los inviabiliza qualquer leitura.",
    color: "var(--color-primary)",
  },
  {
    id: "template",
    label: "DNA molde",
    icon: "🧬",
    keep: false,
    keepFeedback:
      "Incorreto. O DNA molde original também migraria pelo capilar e contaminaria a leitura.",
    removeFeedback:
      "Correto — o DNA molde já cumpriu seu papel e deve ser removido antes da eletroforese capilar.",
    color: "oklch(0.55 0.06 220)",
  },
  {
    id: "primers",
    label: "Primers livres",
    icon: "➰",
    keep: false,
    keepFeedback:
      "Incorreto. Primers livres geram ruído e interferem na leitura.",
    removeFeedback: "Bem feito — primers livres seriam fonte de ruído no início do eletroferograma.",
    color: "oklch(0.78 0.12 60)",
  },
  {
    id: "pol",
    label: "DNA Polimerase",
    icon: "⚙️",
    keep: false,
    keepFeedback:
      "Incorreto. Sua função terminou após a síntese dos fragmentos.",
    removeFeedback: "Correto — a enzima já cumpriu seu papel e poderia atrapalhar a corrida.",
    color: "oklch(0.70 0.10 280)",
  },
  {
    id: "dntp",
    label: "dNTPs livres",
    icon: "🔹",
    keep: false,
    keepFeedback:
      "Incorreto. Nucleotídeos livres aumentam o fundo fluorescente.",
    removeFeedback: "Correto — sem nucleotídeos livres, o sinal de fundo cai.",
    color: "oklch(0.78 0.10 210)",
  },
  {
    id: "ddntp",
    label: "ddNTPs livres",
    icon: "💠",
    keep: false,
    keepFeedback:
      "Incorreto. Devem ser removidos para evitar interferência na detecção.",
    removeFeedback: "Correto — ddNTPs livres falsificariam picos no detector.",
    color: "oklch(0.80 0.16 320)",
  },
  {
    id: "salts",
    label: "Sais do tampão",
    icon: "🧂",
    keep: false,
    keepFeedback:
      "Incorreto. Os sais podem prejudicar a eletroforese capilar.",
    removeFeedback: "Correto — sais em excesso comprometem a injeção no capilar.",
    color: "oklch(0.70 0.04 220)",
  },
];

export const PURIF_SUMMARY = {
  clean:
    "Amostra limpa: apenas os fragmentos de DNA fluorescentes seguem para a eletroforese capilar.",
  dirty:
    "Amostra com contaminantes: a corrida vai prosseguir, mas o eletroferograma terá ruído de baseline.",
  empty:
    "Você removeu os fragmentos de DNA fluorescentes — não há material útil para o sequenciador.",
};
