import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import { REAGENTS, type Reagent } from "@/data/sanger";
import { useExperiment } from "@/components/sanger/state";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ReactionScreen() {
  const { state, total, back, next, dispatch } = useExperiment();
  const [last, setLast] = useState<{ r: Reagent; action: "add" | "remove" } | null>(null);

  // Ordem determinística no SSR; aleatória após hidratação.
  const [shuffled, setShuffled] = useState<Reagent[]>(() =>
    [...REAGENTS].sort((a, b) => a.name.localeCompare(b.name)),
  );
  useEffect(() => { setShuffled(shuffle(REAGENTS)); }, []);
  const picked = state.selectedReagents;

  function toggle(r: Reagent) {
    setLast({ r, action: picked.has(r.id) ? "remove" : "add" });
    dispatch({ type: "toggleReagent", id: r.id, correct: r.correct });
  }

  const requiredCount = REAGENTS.filter(r => r.correct).length;
  const correctSelected = [...picked].filter(id => REAGENTS.find(r => r.id === id)?.correct).length;

  return (
    <PageShell>
      <motion.div key="reaction" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Preparação da reação"
          subtitle="Monte a mistura selecionando apenas os componentes que fazem parte do Sequenciamento de Sanger. O orientador de bancada explica cada escolha; na próxima tela você revisa a reação antes de iniciar."
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel>
            <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span>Bancada · Reagentes disponíveis</span>
              <span className="text-primary">
                {correctSelected} / {requiredCount} obrigatórios
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shuffled.map((r) => {
                const isPicked = picked.has(r.id);
                return (
                  <motion.button
                    key={r.id}
                    onClick={() => toggle(r)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                      "border-border bg-[var(--color-background)]/40 hover:border-primary/60",
                      isPicked && r.correct && "border-primary bg-primary/10 glow-primary",
                      isPicked && !r.correct && "border-destructive/60 bg-destructive/10",
                    )}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">{r.blurb}</div>
                    </div>
                    {isPicked && (
                      <span className={cn(
                        "absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                        r.correct ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground",
                      )}>
                        {r.correct ? "✓" : "!"}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Panel>

          <Panel className="self-start">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Orientador de bancada
            </div>
            <AnimatePresence mode="wait">
              {last ? (
                <motion.div
                  key={last.r.id + last.action}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={cn(
                    "rounded-lg border p-4",
                    last.r.correct
                      ? "border-[var(--color-success)]/50 bg-[var(--color-success)]/10"
                      : "border-destructive/50 bg-destructive/10",
                  )}
                >
                  <div className="text-xs uppercase tracking-wider">
                    {last.r.correct ? (
                      <span className="text-[var(--color-success)]">✓ Faz parte do Sanger</span>
                    ) : (
                      <span className="text-destructive">✗ Não pertence ao Sanger</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{last.r.name}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{last.r.rationale}</p>
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Clique em um reagente para receber uma explicação. Você pode
                  voltar depois para corrigir.
                </p>
              )}
            </AnimatePresence>

            <div className="mt-5 rounded-lg border border-border bg-[var(--color-background)]/40 p-3 text-xs text-muted-foreground">
              <div className="mb-1 font-semibold text-foreground">Componentes do Sanger:</div>
              DNA molde · Primer · DNA Polimerase · dNTPs · ddNTPs fluorescentes · Buffer
            </div>
          </Panel>
        </div>

        <NavBar onBack={back} onNext={next} nextLabel="Conferir reação" />
      </motion.div>
    </PageShell>
  );
}
