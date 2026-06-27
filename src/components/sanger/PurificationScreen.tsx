import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import { Button } from "@/components/ui/button";
import {
  PURIF_COMPONENTS,
  PURIF_SUMMARY,
  type PurifComponent,
  type PurifId,
} from "@/data/purification";
import {
  useExperiment,
  purifIsClean,
  purifContaminants,
  purifHasFrags,
} from "@/components/sanger/state";
import { cn } from "@/lib/utils";

type Phase = "select" | "running" | "done";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PurificationScreen() {
  const { state, total, back, next, dispatch } = useExperiment();
  const [last, setLast] = useState<{ c: PurifComponent; kept: boolean } | null>(null);
  const [phase, setPhase] = useState<Phase>(state.purif.committed ? "done" : "select");
  const [components, setComponents] = useState<PurifComponent[]>(PURIF_COMPONENTS);
  const tubeRef = useRef<HTMLDivElement | null>(null);

  // Shuffle client-side after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    setComponents(shuffle(PURIF_COMPONENTS));
  }, [state.caseId]);

  const kept = useMemo(() => new Set(state.purif.kept), [state.purif.kept]);
  const clean = purifIsClean(state.purif);
  const contam = purifContaminants(state.purif);
  const hasFrags = purifHasFrags(state.purif);

  function toggle(c: PurifComponent) {
    dispatch({ type: "togglePurif", id: c.id });
    setLast({ c, kept: !kept.has(c.id) });
  }

  function execute() {
    setPhase("running");
    // Garante que a animação fique visível, especialmente em mobile
    // onde o tubo aparece abaixo dos componentes.
    requestAnimationFrame(() => {
      tubeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setTimeout(() => {
      dispatch({ type: "commitPurif" });
      setPhase("done");
    }, 3200);
  }

  const summary = !hasFrags
    ? PURIF_SUMMARY.empty
    : clean
      ? PURIF_SUMMARY.clean
      : PURIF_SUMMARY.dirty;

  return (
    <PageShell>
      <motion.div
        key="purif"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
      >
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Purificação da reação de sequenciamento"
          subtitle="Antes da eletroforese capilar, mantenha apenas os fragmentos de DNA fluorescentes. Remova o DNA molde, primers livres, DNA polimerase, dNTPs/ddNTPs livres e sais do tampão."
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div ref={tubeRef} className="order-2 lg:order-1 scroll-mt-24">
            <Panel>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Amostra
              </div>
              <TubeView
                components={PURIF_COMPONENTS}
                kept={kept}
                phase={phase}
              />
              <div className="mt-3 text-xs text-muted-foreground">
                {phase === "select" &&
                  "A mistura ainda contém todos os componentes. Decida o que remover."}
                {phase === "running" &&
                  "Passando pela coluna de purificação..."}
                {phase === "done" && summary}
              </div>
            </Panel>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <Panel>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Componentes da mistura
                </div>
                <span className="text-[10px] uppercase tracking-wider text-primary">
                  Manter / Remover
                </span>
              </div>
              <ul className="space-y-2">
                {components.map((c) => {
                  const isKept = kept.has(c.id);
                  const correct = isKept === c.keep;
                  return (
                    <li
                      key={c.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border p-2.5 text-sm transition-colors",
                        "border-border bg-[var(--color-background)]/40",
                        phase === "done" && correct && "border-[var(--color-success)]/50 bg-[var(--color-success)]/10",
                        phase === "done" && !correct && "border-destructive/50 bg-destructive/10",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{c.icon}</span>
                        <span className="font-medium">{c.label}</span>
                      </span>
                      <div className="flex items-center gap-1 rounded-md border border-border bg-[var(--color-background)]/60 p-0.5">
                        <button
                          disabled={phase !== "select"}
                          onClick={() => {
                            if (!isKept) toggle(c);
                            else setLast({ c, kept: true });
                          }}
                          className={cn(
                            "rounded px-2 py-1 text-[11px] uppercase tracking-wider transition",
                            isKept
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Manter
                        </button>
                        <button
                          disabled={phase !== "select"}
                          onClick={() => {
                            if (isKept) toggle(c);
                            else setLast({ c, kept: false });
                          }}
                          className={cn(
                            "rounded px-2 py-1 text-[11px] uppercase tracking-wider transition",
                            !isKept
                              ? "bg-destructive text-destructive-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Remover
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Orientador
              </div>
              <AnimatePresence mode="wait">
                {last ? (
                  <motion.div
                    key={last.c.id + String(last.kept)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={cn(
                      "mt-3 rounded-lg border p-3 text-sm",
                      last.kept === last.c.keep
                        ? "border-[var(--color-success)]/50 bg-[var(--color-success)]/10"
                        : "border-destructive/50 bg-destructive/10",
                    )}
                  >
                    <div className="text-[11px] uppercase tracking-wider">
                      {last.c.label} · {last.kept ? "manter" : "remover"}
                    </div>
                    <p className="mt-1">
                      {last.kept ? last.c.keepFeedback : last.c.removeFeedback}
                    </p>
                  </motion.div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Decida manter ou remover cada componente. O sistema permite
                    seguir mesmo com erros — você verá a consequência na
                    leitura.
                  </p>
                )}
              </AnimatePresence>
            </Panel>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={back}
            className="text-sm text-muted-foreground hover:text-foreground"
            disabled={phase === "running"}
          >
            ← Voltar
          </button>

          <div className="flex items-center gap-2">
            {phase !== "done" ? (
              <Button
                size="lg"
                disabled={phase === "running"}
                onClick={execute}
              >
                {phase === "running" ? "Purificando..." : "Executar purificação"}
              </Button>
            ) : (
              <>
                <span className="mr-2 text-xs text-muted-foreground">
                  {clean
                    ? "✓ Amostra limpa"
                    : `${contam} contaminante(s) mantido(s)`}
                </span>
                <Button size="lg" onClick={next}>
                  Ir para eletroforese →
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}

// ------------------------------------------------------------
// Tube visual
// ------------------------------------------------------------

function TubeView({
  components,
  kept,
  phase,
}: {
  components: PurifComponent[];
  kept: Set<PurifId>;
  phase: Phase;
}) {
  // Stable positions for each component's particles (deterministic — no SSR mismatch).
  const particles = useMemo(() => {
    const out: { id: PurifId; x: number; y: number; color: string; icon: string; keep: boolean }[] = [];
    components.forEach((c, ci) => {
      const n = c.id === "frags" ? 6 : 3;
      for (let i = 0; i < n; i++) {
        const x = 18 + ((ci * 17 + i * 31) % 70);
        const y = 28 + ((ci * 23 + i * 19) % 50);
        out.push({
          id: c.id,
          x,
          y,
          color: c.color ?? "var(--color-muted-foreground)",
          icon: c.icon,
          keep: c.keep,
        });
      }
    });
    return out;
  }, [components]);

  return (
    <div className="relative mx-auto mt-3 h-72 w-full max-w-[260px]">
      {/* Column / beads visual that appears during "running" */}
      <AnimatePresence>
        {phase === "running" && (
          <motion.div
            key="col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -right-2 top-4 h-64 w-10 rounded-b-full border border-primary/40 bg-[var(--color-background)]/70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 25%, oklch(0.82 0.16 195 / 0.4) 0 3px, transparent 4px), radial-gradient(circle at 30% 55%, oklch(0.78 0.18 170 / 0.4) 0 3px, transparent 4px), radial-gradient(circle at 70% 75%, oklch(0.82 0.16 195 / 0.4) 0 3px, transparent 4px)",
              backgroundSize: "20px 20px",
            }}
          >
            <motion.div
              className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
              style={{ background: "var(--color-primary)" }}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eppendorf-like tube */}
      <svg viewBox="0 0 120 240" className="absolute inset-0 mx-auto h-full">
        <defs>
          <linearGradient id="tubeGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.30 0.03 220 / 0.3)" />
            <stop offset="100%" stopColor="oklch(0.20 0.03 220 / 0.5)" />
          </linearGradient>
        </defs>
        {/* Cap */}
        <rect x="20" y="6" width="80" height="14" rx="3" fill="oklch(0.32 0.04 220)" stroke="var(--color-border)" />
        {/* Body */}
        <path
          d="M 24 22 L 96 22 L 88 200 Q 60 230 32 200 Z"
          fill="url(#tubeGrad)"
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        {/* Liquid level shimmer */}
        <path
          d="M 28 90 L 92 90 L 86 200 Q 60 222 34 200 Z"
          fill="oklch(0.82 0.16 195 / 0.08)"
        />
      </svg>

      {/* Floating component tokens inside the tube */}
      <div className="absolute inset-0">
        {particles.map((p, i) => {
          const stillThere =
            phase === "select"
              ? true
              : phase === "running"
                ? kept.has(p.id)
                : kept.has(p.id);
          const leaving = phase !== "select" && !kept.has(p.id);
          return (
            <motion.div
              key={p.id + "_" + i}
              initial={false}
              animate={
                leaving
                  ? { x: 90, y: -20, opacity: 0, scale: 0.6 }
                  : { x: 0, y: 0, opacity: 1, scale: 1 }
              }
              transition={{
                duration: 1.2,
                delay: leaving ? 0.2 + (i % 5) * 0.15 : 0,
                ease: "easeInOut",
              }}
              className="absolute flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow-md"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: p.color,
                color: "var(--color-background)",
                opacity: stillThere ? 1 : undefined,
                boxShadow: p.id === "frags" ? `0 0 12px ${p.color}` : undefined,
              }}
            >
              {p.icon}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
