import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar, BaseToken } from "@/components/sanger/ui";
import { BASE_INFO, type Base } from "@/data/sanger";
import { useExperiment } from "@/components/sanger/state";
import { PrimerBlock } from "@/components/sanger/FragmentsScreen";
import { Button } from "@/components/ui/button";

const PRIMER_LEN = 3;
const CELL_W = 28;

const PHASE_TEMPLATE = 0;
const PHASE_PRIMER_FLOAT = 1;
const PHASE_PRIMER_ANNEALED = 2;
const PHASE_POLY_DOCKING = 3;
const PHASE_POLY_DOCKED = 4;
const PHASE_FIRST_INCORP = 5;

function complement(b: Base): Base {
  return b === "A" ? "T" : b === "T" ? "A" : b === "C" ? "G" : "C";
}

export function SequencingStartScreen() {
  const { state, total, back, next, activeCase } = useExperiment();
  const newStrand = activeCase.referenceRead;

  // Single demonstration molecule — terminates around the middle so the
  // student sees synthesis happen and a STOP event before moving on.
  const terminateAt = useMemo(
    () => Math.max(3, Math.floor(newStrand.length * 0.5)),
    [newStrand.length],
  );
  const finalTick = PHASE_FIRST_INCORP + terminateAt + 1;
  const [tick, setTick] = useState(0);
  const done = tick >= finalTick;

  useEffect(() => {
    if (done) return;
    const delays: Record<number, number> = {
      [PHASE_TEMPLATE]: 900,
      [PHASE_PRIMER_FLOAT]: 1200,
      [PHASE_PRIMER_ANNEALED]: 900,
      [PHASE_POLY_DOCKING]: 1000,
      [PHASE_POLY_DOCKED]: 800,
    };
    const d = delays[tick] ?? 520;
    const t = setTimeout(() => setTick((s) => s + 1), d);
    return () => clearTimeout(t);
  }, [tick, done]);

  const phaseLabel =
    tick === PHASE_TEMPLATE ? "1. Fita molde de DNA exposta (3' → 5')"
    : tick === PHASE_PRIMER_FLOAT ? "2. Primer se aproxima procurando complementaridade"
    : tick === PHASE_PRIMER_ANNEALED ? "2. Primer anelado à fita molde — 3'-OH livre"
    : tick === PHASE_POLY_DOCKING ? "3. DNA polimerase se aproxima do complexo primer/molde"
    : tick === PHASE_POLY_DOCKED ? "3. DNA polimerase ancorada — pronta para sintetizar"
    : tick < finalTick - 1 ? "4–5. Síntese a partir do 3'-OH · dNTPs sendo incorporados"
    : "6. ddNTP fluorescente incorporado — sem 3'-OH, a síntese para";

  return (
    <PageShell>
      <motion.div key="seqstart" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Início da reação"
          subtitle="Acompanhe a montagem de um único fragmento. A fita molde fica exposta, o primer encontra a região complementar, a DNA polimerase ancora no 3'-OH e a síntese segue até um ddNTP fluorescente ser incorporado e interromper a cadeia."
        />

        <Panel className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary">
                Etapa atual
              </div>
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTick(0)}
              disabled={!done}
            >
              ↻ Repetir animação
            </Button>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <SynthesisStage strand={newStrand} tick={tick} terminateAt={terminateAt} />
        </Panel>

        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Molde</div>
            <p className="mt-2 text-muted-foreground">
              Fita de DNA do paciente, lida pela polimerase no sentido 3'→5'.
            </p>
          </Panel>
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Primer</div>
            <p className="mt-2 text-muted-foreground">
              Pareia em região conhecida e fornece o 3'-OH inicial para a polimerase.
            </p>
          </Panel>
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Polimerase</div>
            <p className="mt-2 text-muted-foreground">
              Adiciona nucleotídeos complementares no sentido 5'→3' até encontrar um ddNTP.
            </p>
          </Panel>
        </div>

        <NavBar
          onBack={back}
          onNext={next}
          nextLabel={done ? "Iniciar síntese em paralelo" : "Aguarde a demonstração…"}
          nextDisabled={!done}
        />
      </motion.div>
    </PageShell>
  );
}

// ----------------------------------------------------------------------

function SynthesisStage({
  strand, tick, terminateAt,
}: { strand: Base[]; tick: number; terminateAt: number }) {
  const showPrimerFloat = tick === PHASE_PRIMER_FLOAT;
  const showPrimerAnnealed = tick >= PHASE_PRIMER_ANNEALED;
  const showPolyDocking = tick === PHASE_POLY_DOCKING;
  const showPolyDocked = tick >= PHASE_POLY_DOCKED;

  const incorporated = Math.max(0, Math.min(terminateAt + 1, tick - PHASE_FIRST_INCORP + 1));
  const terminated = tick >= PHASE_FIRST_INCORP + terminateAt + 1;
  const polyIndex = Math.min(incorporated, terminateAt);
  const floaters: Base[] = ["A", "T", "C", "G"];

  return (
    <div className="relative rounded-lg border border-border bg-[var(--color-background)]/40 p-3 pt-10 pb-4">
      {showPolyDocked && !terminated && (
        <div className="pointer-events-none absolute inset-x-3 top-1 flex gap-2">
          {floaters.map((b, i) => (
            <motion.div
              key={b + i}
              initial={{ y: 0, opacity: 0.4 }}
              animate={{ y: [0, -4, 0], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              style={{ color: BASE_INFO[b].color }}
              className="font-mono text-[10px]"
            >
              dd{b}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showPolyDocking && (
          <motion.div
            key="poly-dock"
            initial={{ opacity: 0, y: -28, x: 0 }}
            animate={{ opacity: 1, y: -4, x: PRIMER_LEN * (CELL_W + 4) }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-7 left-3 flex h-6 items-center gap-1 rounded-full border border-primary/60 bg-[var(--color-background)] px-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-[0_0_12px_var(--color-primary)]"
          >
            ⚙ DNA Pol
          </motion.div>
        )}
        {showPolyDocked && !terminated && (
          <motion.div
            key="poly"
            initial={false}
            animate={{
              opacity: 1,
              x: (PRIMER_LEN + polyIndex) * (CELL_W + 4),
            }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="absolute top-3 left-3 flex h-6 items-center gap-1 rounded-full border border-primary/60 bg-[var(--color-background)] px-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-[0_0_12px_var(--color-primary)]"
          >
            ⚙ DNA Pol
          </motion.div>
        )}
        {terminated && (
          <motion.div
            key="stop"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: (PRIMER_LEN + terminateAt) * (CELL_W + 4),
            }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="absolute top-3 left-3 flex h-6 items-center gap-1 rounded-full border border-destructive/70 bg-[var(--color-background)] px-2 text-[10px] font-bold uppercase tracking-wider text-destructive shadow-[0_0_12px_var(--color-destructive)]"
          >
            ✕ STOP — sem 3'-OH
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrimerFloat && (
          <motion.div
            key="primer-float"
            initial={{ opacity: 0, x: 80, y: -24 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute top-9 left-3"
          >
            <PrimerBlock size={CELL_W} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-1">
        {showPrimerAnnealed ? (
          <motion.div key="primer-annealed" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <PrimerBlock size={CELL_W} />
          </motion.div>
        ) : (
          <div
            style={{ width: CELL_W * PRIMER_LEN + 28, height: CELL_W }}
            className="flex items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground/40"
          >
            primer →
          </div>
        )}
        {strand.map((b, i) => {
          const visible = i < incorporated;
          if (!visible) {
            return (
              <div key={"new" + i} style={{ width: CELL_W, height: CELL_W }} className="text-center font-mono text-xs opacity-15">
                ·
              </div>
            );
          }
          const isTerm = i === terminateAt && terminated;
          return (
            <motion.div
              key={"new" + i}
              initial={{ y: -16, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
            >
              <BaseToken base={b} size={CELL_W} dd={isTerm} glow={isTerm} />
            </motion.div>
          );
        })}
        {showPrimerAnnealed && !terminated && incorporated < strand.length && (
          <span className="ml-1 font-mono text-[10px] text-primary">3'-OH ←</span>
        )}
      </div>

      <div className="mt-0.5 flex flex-wrap items-center gap-1">
        <div style={{ width: CELL_W * PRIMER_LEN + 28 }} className="text-center text-[10px] text-muted-foreground">
          {showPrimerAnnealed ? "│ │ │" : ""}
        </div>
        {strand.map((_, i) => (
          <div
            key={"pair" + i}
            style={{ width: CELL_W }}
            className={`text-center text-[10px] ${i < incorporated ? "text-primary" : "text-muted-foreground/30"}`}
          >
            {i < incorporated || showPrimerAnnealed ? "│" : "·"}
          </div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex flex-wrap items-center gap-1">
        <div
          style={{ width: CELL_W * PRIMER_LEN + 28, height: CELL_W }}
          className="flex items-center justify-center rounded-md border border-border bg-[var(--color-background)]/60 text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          3' molde
        </div>
        {strand.map((b, i) => (
          <div
            key={"tmpl" + i}
            style={{ width: CELL_W, height: CELL_W }}
            className="flex items-center justify-center rounded-md border border-border/60 bg-[var(--color-background)]/40 font-mono text-xs text-muted-foreground"
          >
            {complement(b)}
          </div>
        ))}
        <span className="ml-1 font-mono text-[10px] text-muted-foreground">5'</span>
      </motion.div>
    </div>
  );
}
