import { extraWrong, missingRequired } from "./sanger-engine";
import type { ThermoState, PurifState } from "@/components/sanger/state";
import { THERMO_STAGES } from "@/data/thermocycler";
import { PURIF_COMPONENTS } from "@/data/purification";

export interface ScoreInput {
  selectedReagents: Set<string>;
  interpretationAttempts: number; // 0 = não respondeu, 1 = acertou de primeira
  interpretationCorrect: boolean;
  elapsedMs: number;
  thermo?: ThermoState;
  purif?: PurifState;
}

export interface ScoreBreakdown {
  reagents: number;
  wrongReagents: number;
  missing: number;
  interpretation: number;
  timeBonus: number;
  thermo: number;
  purif: number;
  total: number;
  notes: string[];
}

const REQUIRED = ["dna", "primer", "pol", "dntp", "ddntp", "buffer"];

export function computeScore(input: ScoreInput): ScoreBreakdown {
  const notes: string[] = [];
  const correct = REQUIRED.filter((r) => input.selectedReagents.has(r));
  const reagents = correct.length * 10;
  const wrongs = extraWrong(input.selectedReagents);
  const wrongReagents = wrongs.length * -5;
  if (wrongs.length) notes.push(`${wrongs.length} reagente(s) irrelevante(s) na reação.`);
  const missing = missingRequired(input.selectedReagents).length * -15;
  if (missing < 0) notes.push("Componentes obrigatórios ausentes.");

  let interpretation = 0;
  if (input.interpretationCorrect) {
    interpretation = input.interpretationAttempts <= 1 ? 30 : 15;
  } else if (input.interpretationAttempts > 0) {
    notes.push("Interpretação clínica incorreta.");
  }

  const minutes = input.elapsedMs / 60000;
  let timeBonus = 0;
  if (minutes <= 3) timeBonus = 20;
  else if (minutes <= 5) timeBonus = 10;

  // Thermocycler: +20 if all 3 stages correct, -3 per wrong attempt.
  let thermo = 0;
  if (input.thermo) {
    const allOk = THERMO_STAGES.every((s) => input.thermo![s.id] === s.correctTemp);
    if (allOk) thermo += 20;
    thermo -= input.thermo.wrongAttempts * 3;
    if (input.thermo.wrongAttempts > 0)
      notes.push(`${input.thermo.wrongAttempts} tentativa(s) errada(s) no termociclador.`);
  }

  // Purification: +15 if clean; -5 per contaminant kept; -20 if fragments removed.
  let purif = 0;
  if (input.purif && input.purif.committed) {
    const kept = new Set(input.purif.kept);
    const correctPurif = PURIF_COMPONENTS.every((c) => kept.has(c.id) === c.keep);
    if (correctPurif) purif += 15;
    const contaminants = input.purif.kept.filter(
      (id) => !PURIF_COMPONENTS.find((c) => c.id === id)?.keep,
    ).length;
    purif -= contaminants * 5;
    if (!kept.has("frags")) {
      purif -= 20;
      notes.push("Fragmentos fluorescentes descartados na purificação.");
    } else if (contaminants > 0) {
      notes.push(`${contaminants} contaminante(s) mantido(s) após a purificação.`);
    }
  }

  const total = Math.max(
    0,
    reagents + wrongReagents + missing + interpretation + timeBonus + thermo + purif,
  );

  return { reagents, wrongReagents, missing, interpretation, timeBonus, thermo, purif, total, notes };
}
