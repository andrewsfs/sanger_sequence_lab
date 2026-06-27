import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar, BaseToken } from "@/components/sanger/ui";
import { type Base } from "@/data/sanger";
import { useExperiment } from "@/components/sanger/state";
import { CONSEQUENCES } from "@/data/concepts";
import { PrimerBlock } from "@/components/sanger/FragmentsScreen";
import { Button } from "@/components/ui/button";

const PRIMER_LEN = 3;
const CELL_W = 22;

export function IncorporationScreen() {
  const { state, total, back, next, activeCase, sim, dispatch } = useExperiment();
  const newStrand = activeCase.referenceRead;
  const failure = sim.outcome === "no_primer" || sim.outcome === "no_polymerase";

  // Build a representative set of parallel molecules, each terminating at
  // a different position — this is what gives Sanger its size ladder.
  const terminations = useMemo(() => {
    const len = newStrand.length;
    const count = Math.min(6, len - 1);
    const set = new Set<number>();
    for (let i = 0; i < count; i++) {
      set.add(Math.max(1, Math.round(((i + 1) * (len - 1)) / count)));
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [newStrand.length]);

  const maxTerm = terminations[terminations.length - 1] ?? 0;
  // Global ticks: 0 = setup, 1 = polymerases docked, 2.. = incorporation steps
  const [tick, setTick] = useState(0);
  const finalTick = 2 + maxTerm + 1;
  const done = tick >= finalTick;

  useEffect(() => {
    if (failure) return;
    if (done) return;
    const delays: Record<number, number> = { 0: 700, 1: 700 };
    const d = delays[tick] ?? 420;
    const t = setTimeout(() => setTick((s) => s + 1), d);
    return () => clearTimeout(t);
  }, [tick, done, failure]);

  if (failure) {
    const cons = CONSEQUENCES[sim.outcome as "no_primer" | "no_polymerase"];
    return (
      <PageShell>
        <motion.div key="inc-fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <StepHeader
            step={state.stepIndex + 1}
            total={total}
            title="Algo não saiu como esperado"
            subtitle="A reação não conseguiu prosseguir."
          />
          <Panel className="border-destructive/50">
            <div className="text-xs uppercase tracking-wider text-destructive">Consequência</div>
            <div className="mt-2 text-lg font-semibold">{cons.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{cons.body}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => dispatch({ type: "goto", step: "reaction" })}
                className="rounded-md border border-primary/60 px-4 py-2 text-sm text-primary hover:bg-primary/10"
              >
                Corrigir experimento
              </button>
              <button
                onClick={next}
                className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                Ver consequência completa →
              </button>
            </div>
          </Panel>
        </motion.div>
      </PageShell>
    );
  }

  const phaseLabel =
    tick === 0 ? "Milhões de complexos primer/molde prontos em paralelo"
    : tick === 1 ? "DNA polimerase ancorada em cada um dos fragmentos"
    : !done ? "Síntese em andamento — em cada fragmento, um ddNTP diferente vai interromper a cadeia"
    : "Reação concluída — fragmentos de tamanhos variados, cada um terminado por um ddNTP fluorescente";

  return (
    <PageShell>
      <motion.div key="inc" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Síntese e incorporação dos ddNTPs"
          subtitle="A síntese acontece em milhões de fragmentos ao mesmo tempo. Em cada cópia, o ddNTP é incorporado em uma posição diferente, e é isso que gera uma população com fragmentos de praticamente todos os tamanhos possíveis."
        />

        <Panel className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary">Etapa atual</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseLabel}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-1 text-sm font-medium text-foreground"
                >
                  {phaseLabel}
                </motion.div>
              </AnimatePresence>
            </div>
            <Button size="sm" variant="outline" onClick={() => setTick(0)} disabled={!done}>
              ↻ Repetir
            </Button>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="space-y-2">
            {terminations.map((term, idx) => (
              <StrandRow
                key={idx}
                strand={newStrand}
                terminateAt={term}
                tick={tick}
                index={idx}
              />
            ))}
          </div>
        </Panel>

        <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Por que tamanhos diferentes?</div>
            <p className="mt-2 text-muted-foreground">
              Em cada fragmento, a polimerase pode incorporar um ddNTP em
              qualquer posição onde a base complementar seja necessária. Como
              isso é estatístico, obtém-se cópias com todos os comprimentos.
            </p>
          </Panel>
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Marcação fluorescente</div>
            <p className="mt-2 text-muted-foreground">
              Cada ddNTP (A, T, C, G) carrega uma cor distinta. A base terminal
              de cada fragmento de DNA fica fluorescente — é essa cor que o
              detector vai ler na próxima etapa.
            </p>
          </Panel>
        </div>

        <NavBar
          onBack={back}
          onNext={next}
          nextDisabled={!done}
          nextLabel={done ? "Ver população de fragmentos" : "Aguardando síntese…"}
        />
      </motion.div>
    </PageShell>
  );
}

// ----------------------------------------------------------------------

function StrandRow({
  strand, terminateAt, tick, index,
}: { strand: Base[]; terminateAt: number; tick: number; index: number }) {
  const polyDocked = tick >= 1;
  const incorporated = Math.max(0, Math.min(terminateAt + 1, tick - 2 + 1));
  const terminated = tick >= 2 + terminateAt + 1;
  const polyIndex = Math.min(incorporated, terminateAt);

  return (
    <div className="relative rounded-md border border-border/60 bg-[var(--color-background)]/40 px-2 pt-9 pb-1">
      <span className="absolute top-1 left-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Fragmento {index + 1} · termina na posição {terminateAt + 1}
      </span>

      <AnimatePresence>
        {polyDocked && !terminated && (
          <motion.div
            key="poly"
            initial={false}
            animate={{ opacity: 1, x: (PRIMER_LEN + polyIndex) * (CELL_W + 4) }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="pointer-events-none absolute top-[18px] left-2 flex h-4 items-center rounded-full border border-primary/60 bg-[var(--color-background)] px-1.5 text-[9px] font-bold uppercase tracking-wider text-primary shadow-[0_0_10px_var(--color-primary)]"
          >
            ⚙ Pol
          </motion.div>
        )}
        {terminated && (
          <motion.div
            key="stop"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1, scale: 1,
              x: (PRIMER_LEN + terminateAt) * (CELL_W + 4),
            }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="pointer-events-none absolute top-[18px] left-2 flex h-4 items-center rounded-full border border-destructive/70 bg-[var(--color-background)] px-1.5 text-[9px] font-bold uppercase tracking-wider text-destructive shadow-[0_0_10px_var(--color-destructive)]"
          >
            ✕ STOP
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-1">
        <PrimerBlock size={CELL_W} />
        {strand.map((b, i) => {
          if (i > terminateAt) {
            return <div key={i} style={{ width: CELL_W, height: CELL_W }} />;
          }
          const visible = i < incorporated;
          if (!visible) {
            return (
              <div key={i} style={{ width: CELL_W, height: CELL_W }} className="text-center font-mono text-[10px] opacity-15">
                ·
              </div>
            );
          }
          const isTerm = i === terminateAt && terminated;
          return (
            <motion.div
              key={i}
              initial={{ y: -12, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
            >
              <BaseToken base={b} size={CELL_W} dd={isTerm} glow={isTerm} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
