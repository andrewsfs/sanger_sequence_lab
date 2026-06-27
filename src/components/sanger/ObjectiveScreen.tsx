import { motion } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import { useExperiment } from "@/components/sanger/state";

export function ObjectiveScreen() {
  const { state, total, back, next } = useExperiment();
  return (
    <PageShell>
      <motion.div key="obj" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Objetivo do experimento"
          subtitle="Antes de começar, entenda o que você vai fazer e por quê."
        />

        <Panel>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">O que você vai aprender</div>
          <p className="mt-2 text-sm text-foreground">
            O Sequenciamento de Sanger é o método clássico para descobrir a
            ordem dos nucleotídeos (A, T, C, G) em um fragmento de DNA. Nesta
            atividade você acompanha a técnica do começo ao fim, desde a
            montagem da reação até a leitura do eletroferograma, e aplica o
            que aprendeu em um caso clínico ao final.
          </p>
        </Panel>

        <Panel className="mt-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Visão geral do que vamos fazer
          </div>
          <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Selecionar os reagentes corretos",
              "Conferir a reação montada",
              "Programar o termociclador (Cycle Sequencing)",
              "Iniciar a síntese da nova fita",
              "Incorporar ddNTPs e gerar terminações",
              "Observar a população de fragmentos de DNA",
              "Purificar a amostra",
              "Separar por eletroforese capilar",
              "Ler o eletroferograma",
              "Interpretar um caso clínico",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-[var(--color-background)]/40 p-3">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Panel>

        <NavBar onBack={back} onNext={next} nextLabel="Ir para a bancada" />
      </motion.div>
    </PageShell>
  );
}
