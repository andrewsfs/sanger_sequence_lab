import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { CLINICAL_CASES, type ClinicalCase } from "@/data/cases";
import { simulate, type SimResult } from "@/lib/sanger-engine";
import type { ThermoStage } from "@/data/thermocycler";
import { THERMO_STAGES } from "@/data/thermocycler";
import { PURIF_COMPONENTS, type PurifId } from "@/data/purification";

export const STEPS = [
  "intro",
  "objective",
  "reaction",
  "checklist",
  "thermocycler",
  "seq-start",
  "incorporation",
  "fragments",
  "purification",
  "separation",
  "electro",
  "interpretation",
  "result",
] as const;
export type StepId = (typeof STEPS)[number];

export interface ThermoState {
  denat: number | null;
  anneal: number | null;
  extend: number | null;
  attempts: number;
  wrongAttempts: number;
}

export interface PurifState {
  /** Componentes que o aluno escolheu MANTER (presentes na amostra). */
  kept: PurifId[];
  committed: boolean;
}

export interface ExperimentState {
  stepIndex: number;
  caseId: string;
  selectedReagents: Set<string>;
  startedAt: number;
  finishedAt: number | null;
  interpretationAttempts: number;
  pickedHypothesis: string | null;
  interpretationCorrect: boolean;
  thermo: ThermoState;
  purif: PurifState;
}

type Action =
  | { type: "go"; delta: number }
  | { type: "goto"; step: StepId }
  | { type: "toggleReagent"; id: string; correct: boolean }
  | { type: "pickHypothesis"; id: string; correct: boolean }
  | { type: "setThermo"; stage: ThermoStage; temp: number; correct: boolean }
  | { type: "togglePurif"; id: PurifId }
  | { type: "commitPurif" }
  | { type: "finish" }
  | { type: "reset"; caseId?: string };

function reducer(state: ExperimentState, action: Action): ExperimentState {
  switch (action.type) {
    case "go": {
      const next = Math.max(0, Math.min(STEPS.length - 1, state.stepIndex + action.delta));
      return { ...state, stepIndex: next };
    }
    case "goto": {
      const idx = STEPS.indexOf(action.step);
      return idx >= 0 ? { ...state, stepIndex: idx } : state;
    }
    case "toggleReagent": {
      const next = new Set(state.selectedReagents);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, selectedReagents: next };
    }
    case "pickHypothesis": {
      return {
        ...state,
        pickedHypothesis: action.id,
        interpretationAttempts: state.interpretationAttempts + 1,
        interpretationCorrect: action.correct || state.interpretationCorrect,
      };
    }
    case "setThermo": {
      const t = { ...state.thermo };
      t[action.stage] = action.temp;
      t.attempts = t.attempts + 1;
      if (!action.correct) t.wrongAttempts = t.wrongAttempts + 1;
      return { ...state, thermo: t };
    }
    case "togglePurif": {
      const kept = state.purif.kept.includes(action.id)
        ? state.purif.kept.filter((x) => x !== action.id)
        : [...state.purif.kept, action.id];
      return { ...state, purif: { ...state.purif, kept } };
    }
    case "commitPurif":
      return { ...state, purif: { ...state.purif, committed: true } };
    case "finish":
      return { ...state, finishedAt: state.finishedAt ?? Date.now() };
    case "reset": {
      // If no specific caseId requested, pick a random case different from the current one.
      let nextId = action.caseId;
      if (!nextId) {
        const pool = CLINICAL_CASES.filter((c) => c.id !== state.caseId);
        const list = pool.length > 0 ? pool : CLINICAL_CASES;
        nextId = list[Math.floor(Math.random() * list.length)].id;
      }
      return initial(nextId);
    }
  }
}

function initial(caseId?: string): ExperimentState {
  // Always start with the first case during SSR/initial render to avoid
  // hydration mismatch. Randomization happens client-side via useEffect.
  const c = caseId
    ? CLINICAL_CASES.find((x) => x.id === caseId) ?? CLINICAL_CASES[0]
    : CLINICAL_CASES[0];
  return {
    stepIndex: 0,
    caseId: c.id,
    selectedReagents: new Set(),
    startedAt: Date.now(),
    finishedAt: null,
    interpretationAttempts: 0,
    pickedHypothesis: null,
    interpretationCorrect: false,
    thermo: { denat: null, anneal: null, extend: null, attempts: 0, wrongAttempts: 0 },
    purif: { kept: [], committed: false },
  };
}

export function thermoIsComplete(t: ThermoState): boolean {
  return THERMO_STAGES.every((s) => t[s.id] === s.correctTemp);
}

export function purifIsClean(p: PurifState): boolean {
  const kept = new Set(p.kept);
  return PURIF_COMPONENTS.every((c) => kept.has(c.id) === c.keep);
}

export function purifContaminants(p: PurifState): number {
  return p.kept.filter((id) => !PURIF_COMPONENTS.find((c) => c.id === id)?.keep).length;
}

export function purifHasFrags(p: PurifState): boolean {
  return p.kept.includes("frags");
}

interface Ctx {
  state: ExperimentState;
  step: StepId;
  total: number;
  activeCase: ClinicalCase;
  sim: SimResult;
  dispatch: React.Dispatch<Action>;
  next: () => void;
  back: () => void;
}

const ExperimentContext = createContext<Ctx | null>(null);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initial());

  // Pick a random case on client mount (after hydration) so each session
  // varies, without causing a server/client text mismatch.
  useEffect(() => {
    const random = CLINICAL_CASES[Math.floor(Math.random() * CLINICAL_CASES.length)];
    if (random.id !== state.caseId) {
      dispatch({ type: "reset", caseId: random.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<Ctx>(() => {
    const activeCase =
      CLINICAL_CASES.find((c) => c.id === state.caseId) ?? CLINICAL_CASES[0];
    const sim = simulate(activeCase, state.selectedReagents);
    return {
      state,
      step: STEPS[state.stepIndex],
      total: STEPS.length,
      activeCase,
      sim,
      dispatch,
      next: () => dispatch({ type: "go", delta: 1 }),
      back: () => dispatch({ type: "go", delta: -1 }),
    };
  }, [state]);
  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) throw new Error("useExperiment must be used inside <ExperimentProvider>");
  return ctx;
}
