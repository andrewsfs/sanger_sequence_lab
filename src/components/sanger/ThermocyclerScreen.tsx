import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import {
  THERMO_STAGES,
  TEMP_OPTIONS,
  TEMP_ERROR_FEEDBACK,
  THERMO_CURIOSITY,
  type ThermoStage,
} from "@/data/thermocycler";
import { useExperiment, thermoIsComplete } from "@/components/sanger/state";
import { cn } from "@/lib/utils";

type Feedback = { stage: ThermoStage; temp: number; ok: boolean; text: string };

export function ThermocyclerScreen() {
  const { state, total, back, next, dispatch } = useExperiment();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [dragTemp, setDragTemp] = useState<number | null>(null);
  const [selectedTemp, setSelectedTemp] = useState<number | null>(null);

  const usedTemps = useMemo(() => {
    const m = new Map<number, ThermoStage>();
    for (const s of THERMO_STAGES) {
      const v = state.thermo[s.id];
      if (v != null) m.set(v, s.id);
    }
    return m;
  }, [state.thermo]);

  const allCorrect = thermoIsComplete(state.thermo);

  function assign(stage: ThermoStage, temp: number) {
    const def = THERMO_STAGES.find((s) => s.id === stage)!;
    const ok = def.correctTemp === temp;
    dispatch({ type: "setThermo", stage, temp, correct: ok });
    setFeedback({
      stage,
      temp,
      ok,
      text: ok
        ? def.successFeedback
        : TEMP_ERROR_FEEDBACK[stage]?.[temp] ??
          `Incorreto. ${temp}°C não corresponde à etapa de ${def.label.toLowerCase()}.`,
    });
    setSelectedTemp(null);
  }

  return (
    <PageShell>
      <motion.div
        key="thermo"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
      >
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Programação do termociclador (Cycle Sequencing)"
          subtitle="Esta etapa é o Cycle Sequencing de Sanger — não uma PCR convencional. Atribua a temperatura correta a cada etapa do ciclo térmico."
        />

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Termociclador · bloco aquecedor
              </div>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary">
                25 ciclos
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <CyclerSvg />

              <div className="space-y-3">
                {THERMO_STAGES.map((s) => {
                  const value = state.thermo[s.id];
                  const isCorrect = value === s.correctTemp;
                  return (
                    <div
                      key={s.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const t = dragTemp ?? Number(e.dataTransfer.getData("text/plain"));
                        if (!Number.isFinite(t)) return;
                        assign(s.id, t);
                        setDragTemp(null);
                      }}
                      onClick={() => {
                        if (selectedTemp != null) assign(s.id, selectedTemp);
                      }}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors",
                        "border-border bg-[var(--color-background)]/50",
                        selectedTemp != null && "cursor-copy border-primary/60",
                        value != null && isCorrect && "border-[var(--color-success)] bg-[var(--color-success)]/10",
                        value != null && !isCorrect && "border-destructive bg-destructive/10",
                      )}
                    >
                      <div>
                        <div className="text-sm font-semibold">{s.label}</div>
                        <p className="text-[11px] text-muted-foreground">{s.description}</p>
                      </div>
                      <div
                        className={cn(
                          "flex h-12 min-w-[78px] items-center justify-center rounded-lg border font-mono text-lg",
                          value == null
                            ? "border-dashed border-muted-foreground/40 text-muted-foreground/60"
                            : isCorrect
                              ? "border-[var(--color-success)]/60 text-[var(--color-success)]"
                              : "border-destructive/60 text-destructive",
                        )}
                      >
                        {value != null ? `${value}°C` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Temperaturas disponíveis
              </div>
              <div className="flex flex-wrap gap-2">
                {TEMP_OPTIONS.map((t) => {
                  const usedFor = usedTemps.get(t);
                  const isSelected = selectedTemp === t;
                  return (
                    <button
                      key={t}
                      draggable
                      onDragStart={(e) => {
                        setDragTemp(t);
                        e.dataTransfer.setData("text/plain", String(t));
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onDragEnd={() => setDragTemp(null)}
                      onClick={() => setSelectedTemp(isSelected ? null : t)}
                      className={cn(
                        "relative flex h-14 w-20 cursor-grab flex-col items-center justify-center rounded-lg border font-mono text-base transition-all active:cursor-grabbing",
                        "border-border bg-[var(--color-background)]/60 hover:border-primary/60 hover:-translate-y-0.5",
                        isSelected && "border-primary bg-primary/10 ring-2 ring-primary/40",
                        usedFor && "opacity-90",
                      )}
                    >
                      <span className="text-lg font-semibold">{t}°C</span>
                      {usedFor && (
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                          em uso
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Orientador
              </div>
              <AnimatePresence mode="wait">
                {feedback ? (
                  <motion.div
                    key={feedback.stage + feedback.temp}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={cn(
                      "mt-3 rounded-lg border p-3 text-sm",
                      feedback.ok
                        ? "border-[var(--color-success)]/50 bg-[var(--color-success)]/10"
                        : "border-destructive/50 bg-destructive/10",
                    )}
                  >
                    <div className="text-[11px] uppercase tracking-wider">
                      {feedback.ok ? (
                        <span className="text-[var(--color-success)]">✓ Acerto</span>
                      ) : (
                        <span className="text-destructive">✗ Reveja</span>
                      )}
                    </div>
                    <p className="mt-1">{feedback.text}</p>
                  </motion.div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Atribua uma temperatura para cada etapa. O orientador
                    explica acertos e erros — você pode trocar quantas vezes
                    quiser.
                  </p>
                )}
              </AnimatePresence>
            </Panel>

            <Panel className="border-primary/30 bg-primary/5">
              <div className="text-xs uppercase tracking-[0.2em] text-primary">
                Você sabia?
              </div>
              <p className="mt-2 text-sm">{THERMO_CURIOSITY}</p>
            </Panel>
          </div>
        </div>

        <NavBar
          onBack={back}
          onNext={next}
          nextDisabled={!allCorrect}
          nextLabel={allCorrect ? "Iniciar ciclagem →" : "Configure as 3 etapas corretas"}
        />
      </motion.div>
    </PageShell>
  );
}

function CyclerSvg() {
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 180 180" className="h-44 w-full">
        <defs>
          <linearGradient id="lid" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.35 0.04 220)" />
            <stop offset="100%" stopColor="oklch(0.22 0.03 220)" />
          </linearGradient>
          <linearGradient id="block" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.30 0.04 220)" />
            <stop offset="100%" stopColor="oklch(0.18 0.03 220)" />
          </linearGradient>
        </defs>
        {/* Base */}
        <rect x="10" y="120" width="160" height="50" rx="8" fill="url(#block)" stroke="var(--color-border)" />
        {/* Open lid */}
        <g transform="translate(20,40) rotate(-12)">
          <rect width="140" height="40" rx="6" fill="url(#lid)" stroke="var(--color-border)" />
          <circle cx="70" cy="20" r="4" fill="var(--color-primary)" opacity="0.7" />
        </g>
        {/* Heating block with wells */}
        <rect x="22" y="130" width="136" height="30" rx="4" fill="oklch(0.14 0.02 220)" stroke="var(--color-border)" />
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={32 + i * 17} cy={145} r="4" fill="oklch(0.10 0.02 220)" stroke="var(--color-primary)" strokeOpacity="0.4" />
        ))}
        {/* Heat shimmer */}
        <motion.rect
          x="22"
          y="125"
          width="136"
          height="4"
          rx="2"
          fill="var(--color-primary)"
          opacity="0.4"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        {/* Display */}
        <rect x="120" y="100" width="40" height="14" rx="2" fill="oklch(0.10 0.02 220)" stroke="var(--color-primary)" strokeOpacity="0.4" />
        <text x="140" y="111" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill="var(--color-primary)">
          SEQ
        </text>
      </svg>
    </div>
  );
}
