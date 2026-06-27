export type ThermoStage = "denat" | "anneal" | "extend";

export interface StageInfo {
  id: ThermoStage;
  label: string;
  description: string;
  correctTemp: number;
  successFeedback: string;
}

export const THERMO_STAGES: StageInfo[] = [
  {
    id: "denat",
    label: "Desnaturação",
    description: "Separação das duas fitas do DNA molde.",
    correctTemp: 96,
    successFeedback:
      "Correto! A 96°C as duas fitas do DNA molde se separam completamente — condição padrão do Cycle Sequencing de Sanger.",
  },
  {
    id: "anneal",
    label: "Anelamento",
    description: "Pareamento do primer com a sequência-alvo.",
    correctTemp: 50,
    successFeedback:
      "Correto! No Cycle Sequencing, usa-se cerca de 50°C para o anelamento estável de um único primer à sequência-alvo.",
  },
  {
    id: "extend",
    label: "Extensão",
    description: "Síntese da nova fita pela DNA polimerase.",
    correctTemp: 60,
    successFeedback:
      "Correto! A 60°C a DNA polimerase incorpora dNTPs e, ocasionalmente, ddNTPs fluorescentes — gerando fragmentos interrompidos em posições diferentes.",
  },
];

export const TEMP_OPTIONS = [96, 85, 72, 60, 50, 40, 25] as const;

/** Feedback explicativo para combinações erradas comuns. */
export const TEMP_ERROR_FEEDBACK: Record<ThermoStage, Partial<Record<number, string>>> = {
  denat: {
    72: "Incorreto. 72°C é a temperatura típica da extensão na PCR convencional — insuficiente para desnaturar o DNA.",
    60: "Incorreto. 60°C é a temperatura de extensão do Cycle Sequencing — não desnatura as fitas.",
    50: "Incorreto. 50°C corresponde ao anelamento — insuficiente para separar as fitas do DNA.",
    40: "Incorreto. 40°C é baixo demais para romper as pontes de hidrogênio entre as fitas.",
    85: "Próximo, mas insuficiente. A desnaturação completa exige cerca de 96°C.",
    25: "Incorreto. À temperatura ambiente o DNA permanece em fita dupla.",
  },
  anneal: {
    96: "Incorreto. A 96°C nenhum primer consegue manter o pareamento — eles também desnaturam.",
    85: "Incorreto. Temperatura alta demais para o primer parear com o molde.",
    72: "Incorreto. 72°C é a temperatura de extensão da PCR convencional — alta demais para o anelamento estável.",
    60: "Incorreto. 60°C corresponde à extensão no Cycle Sequencing — não favorece o anelamento.",
    40: "Próximo, mas baixo demais — favorece pareamentos inespecíficos.",
    25: "Incorreto. A 25°C há muitas ligações inespecíficas; a reação perde precisão.",
  },
  extend: {
    96: "Incorreto. A 96°C a DNA polimerase perde eficiência e o DNA é desnaturado.",
    85: "Incorreto. Muito quente para a atividade ótima da polimerase nesta etapa.",
    72: "Atenção: 72°C é a temperatura típica de extensão na PCR convencional. No Sequenciamento de Sanger, utiliza-se cerca de 60°C para favorecer a incorporação dos ddNTPs fluorescentes.",
    50: "Incorreto. 50°C corresponde ao anelamento, não à extensão.",
    40: "Incorreto. A polimerase trabalha lentamente nessa temperatura.",
    25: "Incorreto. A 25°C a polimerase termoestável praticamente não atua.",
  },
};

export const THERMO_CURIOSITY =
  "Esta etapa é o Cycle Sequencing de Sanger — não uma PCR convencional. Usam-se ~25 ciclos para gerar milhares de fragmentos interrompidos em posições diferentes pelos ddNTPs fluorescentes.";
