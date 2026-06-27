import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import { useExperiment } from "@/components/sanger/state";
import { BASE_INFO, type Base } from "@/data/sanger";
import { cn } from "@/lib/utils";
import type { Hypothesis } from "@/data/cases";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function InterpretationScreen() {
  const { state, total, back, next, activeCase, dispatch, sim } = useExperiment();
  const [picked, setPicked] = useState<string | null>(state.pickedHypothesis);
  const [opts, setOpts] = useState<Hypothesis[]>(activeCase.alternativas);
  useEffect(() => { setOpts(shuffle(activeCase.alternativas)); }, [activeCase.id]);

  function choose(id: string) {
    const h = activeCase.alternativas.find((x) => x.id === id);
    if (!h) return;
    setPicked(id);
    dispatch({ type: "pickHypothesis", id, correct: h.correct });
  }

  return (
    <PageShell>
      <motion.div key="interp" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Interpretação do caso clínico"
          subtitle="Considere o histórico do paciente, o objetivo da análise, a sequência obtida e o eletroferograma. Escolha a hipótese mais provável."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Caso clínico — {activeCase.titulo}</div>
            <p className="mt-2 text-sm">{activeCase.contextoClinico}</p>
          </Panel>
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Objetivo da análise</div>
            <p className="mt-2 text-sm">{activeCase.objetivo}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <Mini label="Gene" value={activeCase.gene} />
              <Mini label="Região" value={activeCase.regiao} />
              <Mini label="Variante" value={activeCase.varianteInvestigada} />
              <Mini label="Alteração" value={activeCase.alteracao} />
            </div>
          </Panel>
        </div>

        <Panel className="mt-4">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Eletroferograma do paciente</div>
          <MiniElectro />
        </Panel>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Padrão observado</div>
            <p className="mt-2 text-sm">{activeCase.padraoObservado}</p>
          </Panel>
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sequência obtida</div>
            <p className="mt-2 font-mono text-base">{activeCase.sequenciaObtidaLabel}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Referência: <span className="font-mono">{activeCase.sequenciaNormal}</span></p>
          </Panel>
        </div>

        <Panel className="mt-4 border-primary/30">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Raciocínio molecular</div>
          <p className="mt-2 text-sm text-muted-foreground">
            O sequenciamento de Sanger permite identificar a sequência de
            nucleotídeos na região analisada. Compare a sequência obtida com a
            variante investigada e escolha a interpretação mais compatível.
          </p>
        </Panel>

        <Panel className="mt-4">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Sua hipótese</div>
          <div className="grid gap-2">
            {opts.map((h) => {
              const isPicked = picked === h.id;
              const showResult = picked !== null;
              return (
                <button
                  key={h.id}
                  onClick={() => !isPicked && choose(h.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left text-sm transition-colors",
                    "border-border bg-[var(--color-background)]/40 hover:border-primary/60",
                    showResult && isPicked && h.correct && "border-[var(--color-success)] bg-[var(--color-success)]/10",
                    showResult && isPicked && !h.correct && "border-destructive bg-destructive/10",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{h.label}</span>
                    {showResult && isPicked && (
                      <span className={cn(
                        "text-[11px] uppercase tracking-wider",
                        h.correct ? "text-[var(--color-success)]" : "text-destructive",
                      )}>
                        {h.correct ? "✓ Correto" : "✗ Reveja"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {picked !== null && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm"
              >
                <div className="text-xs uppercase tracking-wider text-primary">Feedback do tutor</div>
                <p className="mt-1">
                  {activeCase.alternativas.find((h) => h.id === picked)?.feedback}
                </p>
                {!activeCase.alternativas.find((h) => h.id === picked)?.correct && (
                  <button
                    onClick={() => setPicked(null)}
                    className="mt-3 text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Tentar outra hipótese
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>

        <NavBar onBack={back} onNext={next} nextDisabled={picked === null} nextLabel="Ver resultado final" />
      </motion.div>
    </PageShell>
  );

  function MiniElectro() {
    const peaks = sim.peaks;
    if (peaks.length === 0) {
      return (
        <p className="mt-2 text-sm text-muted-foreground">
          A reação falhou — sem dados suficientes para interpretar.
        </p>
      );
    }
    const W = 680, H = 130, padX = 24, padY = 12;
    const stepX = (W - padX * 2) / Math.max(1, peaks.length - 1);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-32 w-full">
        <line x1={padX} x2={W - padX} y1={H - padY} y2={H - padY} stroke="var(--color-border)" />
        {peaks.map((p, i) => {
          const cx = padX + i * stepX;
          const baseY = H - padY;
          const drawables = p.coBases ? p.coBases : [p.base];
          return (
            <g key={i}>
              {drawables.map((b, k) => {
                const color = BASE_INFO[b as Base].color;
                const h = (p.height || 0.7) * 80 * (p.coBases ? 0.85 : 1);
                const topY = baseY - h;
                const off = drawables.length > 1 ? (k === 0 ? -3 : 3) : 0;
                const path = `M ${cx - 10 + off} ${baseY} C ${cx - 5 + off} ${baseY}, ${cx - 3 + off} ${topY}, ${cx + off} ${topY} C ${cx + 3 + off} ${topY}, ${cx + 5 + off} ${baseY}, ${cx + 10 + off} ${baseY}`;
                return <path key={k} d={path} fill="none" stroke={color} strokeWidth={2} />;
              })}
              <text x={cx} y={baseY + 10} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--color-muted-foreground)">
                {p.coBases ? `${p.coBases[0]}/${p.coBases[1]}` : p.base}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[var(--color-background)]/40 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
