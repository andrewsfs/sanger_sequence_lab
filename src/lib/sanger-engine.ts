import type { Base } from "@/data/sanger";
import type { ClinicalCase, CasePeak } from "@/data/cases";

export type Outcome =
  | "ok"
  | "no_primer"
  | "no_polymerase"
  | "no_ddntp"
  | "no_dntp"
  | "wrong_reagent_only";

export interface Peak {
  position: number;
  /** Base "principal" do pico (primeira de coBases quando heterozigoto). */
  base: Base;
  /** Quando presente, picos sobrepostos (heterozigose). */
  coBases?: Base[];
  height: number;
  /** Metadados ricos vindos do caso clínico (quando aplicável). */
  meta?: CasePeak;
}

export interface SimResult {
  outcome: Outcome;
  fragments: { size: number; terminal: Base }[];
  peaks: Peak[];
  /** Sequência lida (5'→3'). Para picos duplos usa-se "X/Y". */
  readSequence: Base[];
  /** Versão textual da leitura, preservando notação de pico duplo. */
  readDisplay: string[];
}

const REQUIRED = ["dna", "primer", "pol", "dntp", "ddntp", "buffer"] as const;
const WRONG = ["ribo", "rbc", "ab", "trna"] as const;

export function computeOutcome(selected: Set<string>): Outcome {
  if (!selected.has("primer")) return "no_primer";
  if (!selected.has("pol")) return "no_polymerase";
  if (!selected.has("ddntp")) return "no_ddntp";
  if (!selected.has("dntp")) return "no_dntp";
  const hasWrong = WRONG.some((w) => selected.has(w));
  const missingOther = REQUIRED.some((r) => !selected.has(r));
  if (missingOther) return "no_polymerase";
  if (hasWrong) return "wrong_reagent_only";
  return "ok";
}

export function missingRequired(selected: Set<string>): string[] {
  return REQUIRED.filter((r) => !selected.has(r));
}

export function extraWrong(selected: Set<string>): string[] {
  return WRONG.filter((w) => selected.has(w));
}

function peaksFromCase(c: ClinicalCase): Peak[] {
  return c.picos.map((cp) => ({
    position: cp.position,
    base: cp.bases[0],
    coBases: cp.bases.length > 1 ? (cp.bases as Base[]) : undefined,
    height: cp.height ?? 0.78,
    meta: cp,
  }));
}

export function simulate(c: ClinicalCase, selected: Set<string>): SimResult {
  const outcome = computeOutcome(selected);

  if (outcome === "no_primer" || outcome === "no_polymerase") {
    return { outcome, fragments: [], peaks: [], readSequence: [], readDisplay: [] };
  }

  if (outcome === "no_ddntp") {
    const last = c.picos[c.picos.length - 1].bases[0];
    return {
      outcome,
      fragments: [{ size: c.picos.length, terminal: last }],
      peaks: [],
      readSequence: [],
      readDisplay: [],
    };
  }

  if (outcome === "no_dntp") {
    const short = c.picos.slice(0, 2);
    const peaks: Peak[] = short.map((cp) => ({
      position: cp.position,
      base: cp.bases[0],
      coBases: cp.bases.length > 1 ? (cp.bases as Base[]) : undefined,
      height: 0.55,
      meta: cp,
    }));
    return {
      outcome,
      fragments: short.map((cp, i) => ({ size: i + 1, terminal: cp.bases[0] })),
      peaks,
      readSequence: peaks.map((p) => p.base),
      readDisplay: peaks.map((p) => (p.coBases ? p.coBases.join("/") : p.base)),
    };
  }

  // ok / wrong_reagent_only — usa os picos definidos no caso clínico
  const peaks = peaksFromCase(c);
  const fragments = c.picos.map((cp, i) => ({
    size: i + 1,
    terminal: cp.bases[0],
  }));
  const readSequence = peaks.map((p) => p.base);
  const readDisplay = peaks.map((p) =>
    p.coBases ? p.coBases.join("/") : p.base,
  );

  return { outcome, fragments, peaks, readSequence, readDisplay };
}
