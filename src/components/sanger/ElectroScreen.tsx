import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import { BASE_INFO, type Base } from "@/data/sanger";
import { useExperiment } from "@/components/sanger/state";
import { CONSEQUENCES } from "@/data/concepts";

export function ElectroScreen() {
  const { state, total, back, next, sim, dispatch, activeCase } = useExperiment();
  const peaks = sim.peaks;
  const [sel, setSel] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(0);
  const contaminants = state.purif.committed
    ? state.purif.kept.filter((id) => id !== "frags").length
    : 0;
  const baselineNoise = Math.min(0.6, contaminants * 0.12);
  const isDeletion = activeCase.tipoEletroferograma === "heterozigoto_delecao";

  useEffect(() => {
    if (peaks.length === 0) return;
    if (revealed >= peaks.length) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), 280);
    return () => clearTimeout(t);
  }, [revealed, peaks.length]);

  // Reset reveal when the case changes
  useEffect(() => { setRevealed(0); setSel(null); }, [activeCase.id]);

  if (peaks.length === 0) {
    const cons = CONSEQUENCES[sim.outcome === "no_ddntp" ? "no_ddntp"
      : sim.outcome === "no_dntp" ? "no_dntp"
      : sim.outcome === "no_primer" ? "no_primer" : "no_polymerase"];
    return (
      <PageShell>
        <motion.div key="electro-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <StepHeader
            step={state.stepIndex + 1}
            total={total}
            title="Formação do eletroferograma"
            subtitle="O detector não conseguiu produzir uma leitura interpretável."
          />
          <Panel className="border-destructive/50">
            <div className="text-xs uppercase tracking-wider text-destructive">Resultado da leitura</div>
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
                Seguir para resultado →
              </button>
            </div>
          </Panel>
        </motion.div>
      </PageShell>
    );
  }

  const W = 720;
  const H = 220;
  const padX = 40;
  const padY = 24;
  const stepX = (W - padX * 2) / Math.max(1, peaks.length - 1);

  return (
    <PageShell>
      <motion.div key="electro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Formação do eletroferograma"
          subtitle="Cada pico aparece quando um fragmento chega ao detector. A cor do pico corresponde ao ddNTP fluorescente terminal daquele fragmento, e é a sequência desses picos que vai compor a leitura."
        />

        <Panel>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <span className="uppercase tracking-[0.2em] text-primary">
              {activeCase.gene} · {activeCase.regiao}
            </span>
            <span className="text-muted-foreground">
              Caso: <span className="text-foreground">{activeCase.titulo}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full min-w-[640px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={i} x1={padX} x2={W - padX}
                  y1={padY + (i * (H - padY * 2)) / 5}
                  y2={padY + (i * (H - padY * 2)) / 5}
                  stroke="oklch(0.82 0.16 195 / 0.08)" />
              ))}
              <line x1={padX} x2={W - padX} y1={H - padY} y2={H - padY} stroke="var(--color-border)" />

              {baselineNoise > 0 && (
                <path
                  d={(() => {
                    const baseY = H - padY;
                    const amp = baselineNoise * 18;
                    const pts: string[] = [`M ${padX} ${baseY}`];
                    for (let x = padX + 4; x <= W - padX; x += 6) {
                      const n = Math.sin(x * 0.21) * 0.5 + Math.sin(x * 0.07) * 0.5;
                      pts.push(`L ${x} ${baseY - n * amp}`);
                    }
                    return pts.join(" ");
                  })()}
                  fill="none"
                  stroke="oklch(0.66 0.21 28 / 0.45)"
                  strokeWidth={1}
                />
              )}

              {peaks.map((p, i) => {
                if (i >= revealed) return null;
                const cx = padX + i * stepX;
                const baseY = H - padY;
                const drawables = p.coBases ? p.coBases : [p.base];
                const postDel = p.meta?.postDeletion;
                return (
                  <g key={i} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
                    {postDel && (
                      <rect x={cx - 16} y={padY} width={32} height={H - padY * 2}
                        fill="oklch(0.7 0.18 30 / 0.06)" />
                    )}
                    {drawables.map((b, k) => {
                      const color = BASE_INFO[b as Base].color;
                      const h = (p.height || 0.7) * 120 * (p.coBases ? 0.85 : 1);
                      const topY = baseY - h;
                      const off = drawables.length > 1 ? (k === 0 ? -4 : 4) : 0;
                      const path = `M ${cx - 14 + off} ${baseY} C ${cx - 8 + off} ${baseY}, ${cx - 6 + off} ${topY}, ${cx + off} ${topY} C ${cx + 6 + off} ${topY}, ${cx + 8 + off} ${baseY}, ${cx + 14 + off} ${baseY}`;
                      const selected = sel === i;
                      return (
                        <motion.path
                          key={k}
                          d={path}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          fill="none"
                          stroke={color}
                          strokeWidth={selected ? 3 : 2}
                          style={{ filter: selected ? `drop-shadow(0 0 6px ${color})` : undefined }}
                        />
                      );
                    })}
                    <rect x={cx - 16} y={padY} width={32} height={H - padY * 2} fill="transparent" />
                    <text x={cx} y={baseY + 16} textAnchor="middle"
                      fontFamily="JetBrains Mono, monospace" fontSize="11"
                      fill={sel === i ? BASE_INFO[(p.coBases?.[0] ?? p.base) as Base].color : "var(--color-muted-foreground)"}>
                      {p.coBases ? `${p.coBases[0]}/${p.coBases[1]}` : p.base}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Legenda:</span>
            {(["A","T","C","G"] as const).map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full" style={{ background: BASE_INFO[b].color }} />
                {b}
              </span>
            ))}
            <span className="ml-2 text-muted-foreground/80">Sentido 5' → 3'</span>
            {revealed < peaks.length && (
              <span className="ml-auto text-primary">Lendo... {revealed}/{peaks.length}</span>
            )}
          </div>
        </Panel>

        {isDeletion && revealed >= peaks.length && (
          <Panel className="mt-4 border-primary/40">
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Atenção — deleção heterozigótica</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Após uma deleção heterozigótica, as duas cópias do gene ficam{" "}
              <strong className="text-foreground">fora de fase</strong>. Por isso, os picos podem aparecer sobrepostos a partir do ponto da deleção.
            </p>
          </Panel>
        )}

        <Panel className="mt-4">
          {sel === null ? (
            <p className="text-sm text-muted-foreground">
              Clique em qualquer pico para ver posição, base detectada, fluoróforo, tamanho do fragmento e interpretação.
            </p>
          ) : (
            <PeakDetail index={sel} />
          )}
        </Panel>

        <NavBar onBack={back} onNext={next} nextDisabled={revealed < peaks.length} nextLabel="Interpretar caso clínico" />
      </motion.div>
    </PageShell>
  );
}

function PeakDetail({ index }: { index: number }) {
  const { sim } = useExperiment();
  const p = sim.peaks[index];
  const isMulti = !!p.coBases && p.coBases.length > 1;
  const displayBase = isMulti ? p.coBases!.join(" / ") : p.base;
  const primaryColor = BASE_INFO[(p.coBases?.[0] ?? p.base) as Base].color;
  const meta = p.meta;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Posição">
          <span className="font-mono text-lg">{p.position} / {sim.peaks.length}</span>
        </Field>
        <Field label={isMulti ? "Bases detectadas" : "Base detectada"}>
          <span className="font-mono text-2xl font-bold" style={{ color: primaryColor }}>
            {displayBase}
          </span>
        </Field>
        <Field label="Fluoróforo">
          <span className="inline-flex items-center gap-2 text-xs">
            <span className="h-3 w-8 rounded-full" style={{ background: primaryColor }} />
            {meta?.fluorophore ?? "ddNTP marcado"}
          </span>
        </Field>
        <Field label="Fragmento">
          <span className="font-mono text-xs text-muted-foreground">{p.position} nt após o primer</span>
        </Field>
      </div>

      <div className="rounded-lg border border-border bg-[var(--color-background)]/40 p-3 text-sm">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Interpretação</div>
        <p className="mt-1">{meta?.interpretation ?? (isMulti ? "Sobreposição compatível com heterozigose." : "Pico único e nítido.")}</p>
        <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Sentido da leitura</div>
        <p className="mt-1 font-mono text-xs">5' → 3'</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--color-background)]/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
