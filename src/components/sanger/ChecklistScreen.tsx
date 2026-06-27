import { motion } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import { REAGENTS } from "@/data/sanger";
import { useExperiment } from "@/components/sanger/state";
import { missingRequired, extraWrong } from "@/lib/sanger-engine";
import { cn } from "@/lib/utils";

export function ChecklistScreen() {
  const { state, total, back, next, dispatch } = useExperiment();
  const picked = state.selectedReagents;
  const missing = missingRequired(picked);
  const extras = extraWrong(picked);
  const required = REAGENTS.filter(r => r.correct);

  return (
    <PageShell>
      <motion.div key="check" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Conferência da reação"
          subtitle="Revise a mistura antes de levá-la ao termociclador. Itens irrelevantes não impedem a reação, mas componentes essenciais ausentes farão a reação falhar mais adiante."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Componentes obrigatórios
            </div>
            <ul className="mt-3 space-y-2">
              {required.map((r) => {
                const has = picked.has(r.id);
                return (
                  <li key={r.id} className={cn(
                    "flex items-center justify-between rounded-lg border p-3 text-sm",
                    has
                      ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10"
                      : "border-destructive/50 bg-destructive/10",
                  )}>
                    <span className="flex items-center gap-2">
                      <span>{r.icon}</span>
                      <span className="font-semibold">{r.name}</span>
                    </span>
                    <span className={cn(
                      "text-[11px] uppercase tracking-wider",
                      has ? "text-[var(--color-success)]" : "text-destructive",
                    )}>
                      {has ? "✓ Presente" : "✗ Ausente"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Itens irrelevantes detectados
            </div>
            {extras.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum item fora do escopo do Sanger na mistura. 👏
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {extras.map((id) => {
                  const r = REAGENTS.find((x) => x.id === id)!;
                  return (
                    <li key={id} className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                      <div className="font-semibold">{r.icon} {r.name}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{r.rationale}</p>
                    </li>
                  );
                })}
              </ul>
            )}

            {missing.length > 0 && (
              <div className="mt-4 rounded-lg border border-[oklch(0.78_0.15_70)]/50 bg-[oklch(0.78_0.15_70)]/10 p-3 text-sm">
                <div className="text-xs uppercase tracking-wider text-[oklch(0.85_0.16_75)]">
                  ⚠ Componentes obrigatórios ausentes
                </div>
                <p className="mt-1 text-muted-foreground">
                  Faltam {missing.length} componente(s) essencial(is). Se você
                  iniciar assim, a reação falhará em alguma etapa adiante
                  (sem síntese, sem terminação ou sem leitura) — e o motivo
                  ficará visível no laboratório.
                </p>
              </div>
            )}
          </Panel>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={back}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar e corrigir
          </button>
          <div className="flex items-center gap-2">
            {missing.length > 0 && (
              <button
                onClick={() => dispatch({ type: "goto", step: "reaction" })}
                className="rounded-md border border-border px-4 py-2 text-sm hover:border-primary/60"
              >
                Refazer mistura
              </button>
            )}
            <button
              onClick={next}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              {missing.length > 0 ? "Iniciar mesmo assim →" : "Iniciar reação →"}
            </button>
          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}
