import type { Base } from "./sanger";

export type ElectroType =
  | "normal"
  | "homozigoto"
  | "heterozigoto_pico_duplo"
  | "heterozigoto_delecao";

export interface CasePeak {
  /** Posição na leitura (1-indexed). */
  position: number;
  /** 1 base = pico único; 2 = pico duplo / sobreposição. */
  bases: Base[];
  /** Rótulo do fluoróforo (didático). */
  fluorophore: string;
  /** Descrição do fragmento que gerou o pico. */
  fragmentDesc: string;
  /** Interpretação textual do pico. */
  interpretation: string;
  /** Marca picos posteriores à deleção, para anotação especial. */
  postDeletion?: boolean;
  /** Altura relativa (0..1) — só para estilizar. */
  height?: number;
}

export interface Hypothesis {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
}

export interface MolecularResult {
  gene: string;
  regiao: string;
  sequenciaObtida: string;
  varianteInvestigada: string;
  alteracaoDetectada: string;
  interpretacaoMolecular: string;
  conclusaoClinica: string;
}

export interface ClinicalCase {
  id: string;
  // Novo modelo rico
  titulo: string;
  conceito: string;
  contextoClinico: string;
  objetivo: string;
  gene: string;
  regiao: string;
  varianteInvestigada: string;
  alteracao: string;
  sequenciaNormal: string;
  sequenciaObtidaLabel: string;
  picos: CasePeak[];
  padraoObservado: string;
  alternativas: Hypothesis[];
  resultadoMolecular: MolecularResult;
  conclusaoFinal: string;
  tipoEletroferograma: ElectroType;

  // ---- Aliases legados (mantêm telas anteriores funcionando) ----
  title: string;
  patient: string;
  goal: string;
  hypotheses: Hypothesis[];
  conclusion: string;
  /** Sequência primária lida (5'→3'), usada por telas de síntese. */
  referenceRead: Base[];
}

// ----------------- helpers para montar picos -----------------

function single(
  pos: number,
  base: Base,
  fluo: string,
  extra?: Partial<CasePeak>,
): CasePeak {
  return {
    position: pos,
    bases: [base],
    fluorophore: fluo,
    fragmentDesc: `Fragmento de ${pos} nt — terminado por dd${base} fluorescente.`,
    interpretation: "Pico único e nítido — base inequívoca nesta posição.",
    height: 0.78,
    ...extra,
  };
}

function dbl(
  pos: number,
  b1: Base,
  b2: Base,
  fluo: string,
  extra?: Partial<CasePeak>,
): CasePeak {
  return {
    position: pos,
    bases: [b1, b2],
    fluorophore: fluo,
    fragmentDesc: `Fragmentos de ${pos} nt — mesma extensão, com bases terminais diferentes (${b1} e ${b2}).`,
    interpretation:
      "Sobreposição detectada: duas bases na mesma posição. Esse padrão sugere heterozigose.",
    height: 0.6,
    ...extra,
  };
}

const FLUO = {
  A: "Verde (emissão dd-A)",
  T: "Vermelho (emissão dd-T)",
  C: "Azul (emissão dd-C)",
  G: "Amarelo (emissão dd-G)",
} as const;

const fluoMix = (b1: Base, b2: Base) =>
  `Duas emissões sobrepostas — ${FLUO[b1]} + ${FLUO[b2]}`;

// ----------------- CASOS CLÍNICOS -----------------

export const CLINICAL_CASES: ClinicalCase[] = [
  // ---------- CASO 1 — Controle HbAA ----------
  {
    id: "hbaa",
    titulo: "Controle normal para HbS",
    conceito: "Sequência normal — picos únicos, ausência de variante.",
    contextoClinico:
      "Adulto saudável participou de triagem populacional para hemoglobinopatias. Sem sintomas e sem histórico familiar conhecido.",
    objetivo: "Verificar a presença da variante HbS no gene HBB.",
    gene: "HBB",
    regiao: "Códon 6",
    varianteInvestigada: "HbS — alteração GAG → GTG",
    alteracao: "GAG → GTG (Glu → Val)",
    sequenciaNormal: "… CCT GAG GAG …",
    sequenciaObtidaLabel: "CCT GAG GAG",
    tipoEletroferograma: "normal",
    picos: [
      single(1, "C", FLUO.C),
      single(2, "C", FLUO.C),
      single(3, "T", FLUO.T),
      single(4, "G", FLUO.G),
      single(5, "A", FLUO.A),
      single(6, "G", FLUO.G),
      single(7, "G", FLUO.G),
      single(8, "A", FLUO.A),
      single(9, "G", FLUO.G),
    ],
    padraoObservado:
      "Eletroferograma com picos únicos e bem definidos. Não há sobreposição de picos. A sequência mantém GAG no códon investigado.",
    alternativas: [
      {
        id: "wt",
        label: "Sequência normal HbAA",
        correct: true,
        feedback:
          "Correto. Todos os picos correspondem à referência (GAG no códon 6), sem sobreposições.",
      },
      {
        id: "het",
        label: "Heterozigoto portador HbAS",
        correct: false,
        feedback:
          "Em HbAS veríamos sobreposição A/T na posição da variante. O cromatograma é limpo — não há heterozigose.",
      },
      {
        id: "hom",
        label: "Variante homozigota HbSS",
        correct: false,
        feedback:
          "Em HbSS o códon 6 mostraria GTG. Aqui ele permanece GAG — não há mutação.",
      },
    ],
    resultadoMolecular: {
      gene: "HBB",
      regiao: "Códon 6",
      sequenciaObtida: "GAG",
      varianteInvestigada: "HbS",
      alteracaoDetectada: "Nenhuma",
      interpretacaoMolecular:
        "Sequência normal no trecho analisado.",
      conclusaoClinica: "Não foi identificada a variante HbS.",
    },
    conclusaoFinal:
      "Resultado compatível com sequência normal no trecho analisado. Não foi identificada a variante HbS.",
  },

  // ---------- CASO 2 — HbSS ----------
  {
    id: "hbss",
    titulo: "Suspeita de anemia falciforme",
    conceito: "Mutação pontual homozigota com picos únicos.",
    contextoClinico:
      "Paciente de 6 anos apresenta crises dolorosas recorrentes, anemia hemolítica e histórico familiar positivo.",
    objetivo:
      "Sequenciar o códon 6 do gene HBB para investigar a variante HbS.",
    gene: "HBB",
    regiao: "Códon 6",
    varianteInvestigada: "HbS",
    alteracao: "GAG → GTG (Glu → Val)",
    sequenciaNormal: "… CCT GAG GAG …",
    sequenciaObtidaLabel: "CCT GTG GAG",
    tipoEletroferograma: "homozigoto",
    picos: [
      single(1, "C", FLUO.C),
      single(2, "C", FLUO.C),
      single(3, "T", FLUO.T),
      single(4, "G", FLUO.G),
      single(5, "T", FLUO.T, {
        interpretation:
          "Pico único onde a referência esperava A — substituição A→T (assinatura da HbS).",
      }),
      single(6, "G", FLUO.G),
      single(7, "G", FLUO.G),
      single(8, "A", FLUO.A),
      single(9, "G", FLUO.G),
    ],
    padraoObservado:
      "Eletroferograma com picos únicos e bem definidos. Não há sobreposição de picos. A sequência obtida contém GTG no códon investigado.",
    alternativas: [
      {
        id: "hom",
        label: "Variante homozigota HbSS — anemia falciforme",
        correct: true,
        feedback:
          "Correto. Um único pico T (sem sobreposição) na posição da variante indica que ambos os alelos carregam GTG.",
      },
      {
        id: "het",
        label: "Heterozigoto portador HbAS",
        correct: false,
        feedback:
          "Em HbAS haveria sobreposição A/T na posição. Aqui há apenas T puro — é homozigoto.",
      },
      {
        id: "wt",
        label: "Sequência normal HbAA",
        correct: false,
        feedback:
          "A sequência normal mantém GAG no códon 6. Aqui foi lido GTG — há mutação.",
      },
    ],
    resultadoMolecular: {
      gene: "HBB",
      regiao: "Códon 6",
      sequenciaObtida: "GTG",
      varianteInvestigada: "HbS",
      alteracaoDetectada: "GAG → GTG",
      interpretacaoMolecular:
        "Variante HbS detectada em padrão homozigoto.",
      conclusaoClinica: "Compatível com anemia falciforme.",
    },
    conclusaoFinal:
      "Resultado compatível com anemia falciforme (HbSS). Recomenda-se acompanhamento hematológico.",
  },

  // ---------- CASO 3 — HbAS ----------
  {
    id: "hbas",
    titulo: "Triagem familiar para HbS",
    conceito: "Heterozigose com sobreposição de picos.",
    contextoClinico:
      "Adolescente de 17 anos realizou rastreamento familiar após diagnóstico de anemia falciforme em um irmão. Não apresenta sintomas.",
    objetivo:
      "Avaliar se o paciente é portador da variante HbS no gene HBB.",
    gene: "HBB",
    regiao: "Códon 6",
    varianteInvestigada: "HbS",
    alteracao: "GAG / GTG (heterozigose)",
    sequenciaNormal: "… CCT GAG GAG …",
    sequenciaObtidaLabel: "CCT G(A/T)G GAG",
    tipoEletroferograma: "heterozigoto_pico_duplo",
    picos: [
      single(1, "C", FLUO.C),
      single(2, "C", FLUO.C),
      single(3, "T", FLUO.T),
      single(4, "G", FLUO.G),
      dbl(5, "A", "T", fluoMix("A", "T")),
      single(6, "G", FLUO.G),
      single(7, "G", FLUO.G),
      single(8, "A", FLUO.A),
      single(9, "G", FLUO.G),
    ],
    padraoObservado:
      "Eletroferograma com picos bem definidos, mas com sobreposição de dois sinais na posição correspondente ao códon 6. A presença simultânea de A e T indica duas sequências diferentes: GAG e GTG.",
    alternativas: [
      {
        id: "het",
        label: "Heterozigoto portador HbAS",
        correct: true,
        feedback:
          "Correto. Sobreposição A/T na posição da variante revela dois alelos — um selvagem e um mutante.",
      },
      {
        id: "hom",
        label: "Variante homozigota HbSS",
        correct: false,
        feedback:
          "Em HbSS haveria um único pico T na posição. A sobreposição A/T descarta homozigose.",
      },
      {
        id: "wt",
        label: "Sequência normal HbAA",
        correct: false,
        feedback:
          "Em HbAA o pico seria único e correspondente à referência. A sobreposição indica presença de alelo variante.",
      },
    ],
    resultadoMolecular: {
      gene: "HBB",
      regiao: "Códon 6",
      sequenciaObtida: "GAG / GTG",
      varianteInvestigada: "HbS",
      alteracaoDetectada: "Sobreposição A/T na posição da variante",
      interpretacaoMolecular: "Heterozigose para HbS.",
      conclusaoClinica: "Compatível com traço falciforme.",
    },
    conclusaoFinal:
      "Resultado compatível com heterozigose para HbS (HbAS). O paciente é portador da variante HbS.",
  },

  // ---------- CASO 4 — CFTR F508del ----------
  {
    id: "cftr-f508del",
    titulo: "Suspeita de fibrose cística",
    conceito:
      "Deleção de três nucleotídeos em heterozigose — desalinhamento após o ponto da deleção.",
    contextoClinico:
      "Criança de 2 anos apresenta infecções respiratórias recorrentes, dificuldade de ganho de peso e teste do suor alterado.",
    objetivo: "Investigar a deleção F508del no gene CFTR.",
    gene: "CFTR",
    regiao: "Região do códon 508",
    varianteInvestigada: "F508del",
    alteracao: "c.1521_1523delCTT (deleção de 3 nt)",
    sequenciaNormal: "… ATC TTT GGT …",
    sequenciaObtidaLabel: "ATC TTT/GGT (padrão misto após deleção)",
    tipoEletroferograma: "heterozigoto_delecao",
    picos: [
      single(1, "A", FLUO.A),
      single(2, "T", FLUO.T),
      single(3, "C", FLUO.C),
      single(4, "T", FLUO.T),
      single(5, "T", FLUO.T),
      single(6, "T", FLUO.T),
      dbl(7, "T", "G", fluoMix("T", "G"), {
        postDeletion: true,
        interpretation:
          "Início do desalinhamento — após a deleção, as duas cópias do gene ficam fora de fase. Picos passam a aparecer sobrepostos.",
      }),
      dbl(8, "G", "T", fluoMix("G", "T"), {
        postDeletion: true,
        interpretation:
          "Sobreposição compatível com leitura simultânea de duas sequências defasadas em 3 nt.",
      }),
      dbl(9, "G", "G", FLUO.G, {
        postDeletion: true,
        interpretation:
          "Mesmo nucleotídeo nas duas cópias nesta posição — pico único aparente, mas dentro de uma janela de desalinhamento.",
      }),
      dbl(10, "T", "G", fluoMix("T", "G"), {
        postDeletion: true,
        interpretation:
          "Sobreposição persistente — fase deslocada entre os alelos após a deleção CTT.",
      }),
    ],
    padraoObservado:
      "Eletroferograma com picos únicos antes da região investigada. A partir do ponto da deleção, surgem picos sobrepostos e desalinhados, compatíveis com deleção heterozigótica de três nucleotídeos.",
    alternativas: [
      {
        id: "het",
        label: "Heterozigoto para F508del",
        correct: true,
        feedback:
          "Correto. O desalinhamento dos picos a partir da região do códon 508 é a assinatura clássica de uma deleção heterozigótica em CFTR.",
      },
      {
        id: "wt",
        label: "CFTR normal",
        correct: false,
        feedback:
          "Em CFTR normal os picos permaneceriam únicos por toda a janela. A sobreposição a partir do códon 508 indica deleção em pelo menos uma das cópias.",
      },
      {
        id: "hom",
        label: "Homozigoto para F508del",
        correct: false,
        feedback:
          "Em homozigose, as duas cópias estariam em fase (ambas com a deleção). Não haveria sobreposição — veríamos apenas a sequência encurtada.",
      },
    ],
    resultadoMolecular: {
      gene: "CFTR",
      regiao: "Códon 508",
      sequenciaObtida: "Padrão misto com deleção CTT em uma das cópias",
      varianteInvestigada: "F508del",
      alteracaoDetectada: "c.1521_1523delCTT em heterozigose",
      interpretacaoMolecular:
        "Uma cópia normal e uma cópia com deleção F508del.",
      conclusaoClinica:
        "Achado compatível com portador de variante patogênica em CFTR.",
    },
    conclusaoFinal:
      "Resultado compatível com heterozigose para F508del no gene CFTR. A interpretação clínica deve considerar o contexto do paciente e investigação complementar.",
  },

  // ---------- CASO 5 — HFE C282Y ----------
  {
    id: "hfe-c282y",
    titulo: "Suspeita de hemocromatose hereditária",
    conceito:
      "Mutação pontual em gene não hematológico clássico, com sobreposição heterozigótica.",
    contextoClinico:
      "Adulto de 45 anos apresenta ferritina elevada, saturação de transferrina aumentada, fadiga e histórico familiar de sobrecarga de ferro.",
    objetivo: "Investigar a variante C282Y no gene HFE.",
    gene: "HFE",
    regiao: "Códon 282",
    varianteInvestigada: "C282Y",
    alteracao: "c.845G>A (heterozigose)",
    sequenciaNormal: "… TGC …",
    sequenciaObtidaLabel: "T(G/A)C ATG",
    tipoEletroferograma: "heterozigoto_pico_duplo",
    picos: [
      single(1, "T", FLUO.T),
      dbl(2, "G", "A", fluoMix("G", "A")),
      single(3, "C", FLUO.C),
      single(4, "A", FLUO.A),
      single(5, "T", FLUO.T),
      single(6, "G", FLUO.G),
    ],
    padraoObservado:
      "Eletroferograma com sobreposição de picos G/A na posição investigada. Esse padrão indica presença simultânea da sequência normal e da sequência variante.",
    alternativas: [
      {
        id: "het",
        label: "Heterozigoto para C282Y",
        correct: true,
        feedback:
          "Correto. A sobreposição G/A na posição investigada revela duas cópias do gene HFE — uma selvagem e uma com a variante.",
      },
      {
        id: "wt",
        label: "HFE normal",
        correct: false,
        feedback:
          "Em HFE normal veríamos pico único G na posição. A presença simultânea de A descarta esta hipótese.",
      },
      {
        id: "hom",
        label: "Homozigoto para C282Y",
        correct: false,
        feedback:
          "Em homozigose para C282Y veríamos apenas A puro na posição. A presença residual do sinal G indica heterozigose.",
      },
    ],
    resultadoMolecular: {
      gene: "HFE",
      regiao: "Códon 282",
      sequenciaObtida: "T(G/A)C",
      varianteInvestigada: "C282Y",
      alteracaoDetectada: "c.845G>A em heterozigose",
      interpretacaoMolecular: "Heterozigose para a variante C282Y.",
      conclusaoClinica:
        "Achado associado a predisposição para sobrecarga de ferro. Interpretar junto a exames bioquímicos e contexto clínico.",
    },
    conclusaoFinal:
      "Resultado compatível com heterozigose para C282Y no gene HFE. O achado deve ser correlacionado com ferritina, saturação de transferrina e avaliação clínica.",
  },
].map((c) => {
  // ---- preenche aliases legados a partir do modelo rico ----
  const referenceRead = c.picos.map((p) => p.bases[0]) as Base[];
  return {
    ...c,
    title: c.titulo,
    patient: c.contextoClinico,
    goal: c.objetivo,
    hypotheses: c.alternativas,
    conclusion: c.conclusaoFinal,
    referenceRead,
  } as ClinicalCase;
});

export function pickRandomCase(): ClinicalCase {
  return CLINICAL_CASES[Math.floor(Math.random() * CLINICAL_CASES.length)];
}
