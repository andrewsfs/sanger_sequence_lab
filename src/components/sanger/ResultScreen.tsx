import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Panel, PageShell, StepHeader } from "@/components/sanger/ui";
import { Button } from "@/components/ui/button";
import { useExperiment } from "@/components/sanger/state";
import { computeScore } from "@/lib/scoring";
import { BASE_INFO, type Base } from "@/data/sanger";
import { CONCEPTS } from "@/data/concepts";

export function ResultScreen() {
  const { state, total, dispatch, activeCase, sim } = useExperiment();

  useEffect(() => {
    dispatch({ type: "finish" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elapsedMs = (state.finishedAt ?? Date.now()) - state.startedAt;
  const score = useMemo(
    () =>
      computeScore({
        selectedReagents: state.selectedReagents,
        interpretationAttempts: state.interpretationAttempts,
        interpretationCorrect: state.interpretationCorrect,
        elapsedMs,
        thermo: state.thermo,
        purif: state.purif,
      }),
    [state, elapsedMs],
  );

  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, "0");

  // Classificação de desempenho — relativo ao máximo possível (~110).
  const MAX = 110;
  const pct = Math.min(100, Math.round((score.total / MAX) * 100));
  const classification =
    pct >= 90 ? { label: "Excelente domínio", tone: "var(--color-success)" }
    : pct >= 70 ? { label: "Bom desempenho", tone: "var(--color-primary)" }
    : { label: "Precisa revisar", tone: "var(--color-destructive)" };

  const rm = activeCase.resultadoMolecular;

  return (
    <PageShell>
      <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Resultado final"
          subtitle="Resumo da análise, desempenho e conceitos consolidados."
        />

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Sequência lida (5' → 3')</div>
            <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-2xl font-bold">
              {sim.readDisplay.length === 0 ? (
                <span className="text-sm font-normal text-muted-foreground">
                  Nenhuma sequência interpretável foi obtida.
                </span>
              ) : (
                sim.readDisplay.map((label, i) => {
                  const isMulti = label.includes("/");
                  const primary = (isMulti ? label.split("/")[0] : label) as Base;
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        color: BASE_INFO[primary].color,
                        textShadow: `0 0 16px ${BASE_INFO[primary].color}`,
                      }}
                      className={isMulti ? "text-lg" : ""}
                    >
                      {label}
                    </motion.span>
                  );
                })
              )}
            </div>

            <div className="mt-6 text-xs uppercase tracking-[0.2em] text-primary">Resultado molecular</div>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <Row label="Gene analisado" value={rm.gene} />
              <Row label="Região analisada" value={rm.regiao} />
              <Row label="Sequência obtida" value={rm.sequenciaObtida} mono />
              <Row label="Variante investigada" value={rm.varianteInvestigada} />
              <Row label="Alteração detectada" value={rm.alteracaoDetectada} mono />
              <Row label="Interpretação molecular" value={rm.interpretacaoMolecular} />
              <Row label="Conclusão clínica" value={rm.conclusaoClinica} full />
            </div>

            <div className="mt-6 rounded-lg border border-border bg-[var(--color-background)]/40 p-4 text-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-primary">Conclusão da análise</div>
              <p className="mt-2">{activeCase.conclusaoFinal}</p>
            </div>
          </Panel>

          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Desempenho</div>
            <div className="mt-3 flex items-end gap-3">
              <div className="font-display text-5xl text-primary text-glow">{score.total}</div>
              <div className="pb-2 text-xs text-muted-foreground">pontos · {pct}%</div>
            </div>
            <div
              className="mt-2 inline-block rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider"
              style={{ color: classification.tone, borderColor: classification.tone }}
            >
              {classification.label}
            </div>

            <div className="mt-5 space-y-1.5 text-xs">
              <ScoreRow label="Reagentes corretos" value={`+${score.reagents}`} />
              <ScoreRow label="Reagentes irrelevantes" value={`${score.wrongReagents}`} />
              <ScoreRow label="Componentes ausentes" value={`${score.missing}`} />
              <ScoreRow label="Termociclador" value={`${score.thermo >= 0 ? "+" : ""}${score.thermo}`} />
              <ScoreRow label="Purificação" value={`${score.purif >= 0 ? "+" : ""}${score.purif}`} />
              <ScoreRow label="Interpretação" value={`+${score.interpretation}`} />
              <ScoreRow label="Bônus de tempo" value={`+${score.timeBonus}`} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <Stat label="Tempo" value={`${minutes}:${seconds}`} />
              <Stat label="Tentativas (interp.)" value={String(state.interpretationAttempts)} />
            </div>

            {score.notes.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {score.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            )}
          </Panel>
        </div>

        <Panel className="mt-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Conceitos consolidados
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {([
              ["Função do primer", CONCEPTS.primer],
              ["Papel dos ddNTPs", CONCEPTS.ddntp],
              ["Por que a cadeia para", "Sem o 3'-OH do ddNTP, a polimerase não forma a próxima ligação fosfodiéster."],
              ["Leitura do eletroferograma", CONCEPTS.electropherogram],
            ] as const).map(([t, body]) => (
              <div key={t} className="rounded-lg border border-border bg-[var(--color-background)]/40 p-3 text-xs">
                <div className="font-semibold text-foreground">{t}</div>
                <p className="mt-1 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => dispatch({ type: "goto", step: "electro" })}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Revisar eletroferograma
          </button>
          <Button size="lg" onClick={() => dispatch({ type: "reset" })}>
            ↻ Novo caso clínico
          </Button>
        </div>
      </motion.div>
    </PageShell>
  );
}

function Row({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={`rounded-md border border-border bg-[var(--color-background)]/40 px-3 py-2 ${full ? "sm:col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--color-background)]/40 px-3 py-2 text-center">
      <div className="font-mono text-lg">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
