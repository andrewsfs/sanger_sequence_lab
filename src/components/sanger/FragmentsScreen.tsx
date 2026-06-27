import { motion } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar, BaseToken } from "@/components/sanger/ui";
import { useExperiment } from "@/components/sanger/state";

const PRIMER_LEN = 3;

export function FragmentsScreen() {
  const { state, total, back, next, sim } = useExperiment();
  const frags = sim.fragments;

  return (
    <PageShell>
      <motion.div key="frags" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="População de fragmentos de DNA"
          subtitle="Cada ddNTP incorporado em uma posição diferente origina um fragmento de tamanho único. Todos eles partem do mesmo primer e terminam em uma base fluorescente."
        />

        <Panel>
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Tamanhos gerados</span>
            <span className="text-primary">{frags.length} fragmento(s) de DNA</span>
          </div>

          {frags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum fragmento utilizável foi gerado nesta reação. Veja a
              etapa seguinte para entender por quê.
            </p>
          ) : (
            <div className="space-y-2">
              {frags.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    Frag. {i + 1} · {f.size + PRIMER_LEN} nt
                  </span>
                  <div className="flex flex-1 flex-wrap items-center gap-1">
                    <PrimerBlock />
                    {Array.from({ length: f.size }).map((_, j) => {
                      const isLast = j === f.size - 1;
                      const b = isLast ? f.terminal : (["A","T","C","G"] as const)[(i + j) % 4];
                      return (
                        <BaseToken
                          key={j}
                          base={b}
                          size={22}
                          dd={isLast}
                          glow={isLast}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="mt-4 text-sm">
          <p>
            Todos os fragmentos começam pelo mesmo <strong className="text-foreground">primer</strong> (mostrado em cinza).
            O último nucleotídeo de cada fragmento é um{" "}
            <strong className="text-primary">ddNTP fluorescente</strong>. É a cor
            dessa base terminal que será lida pelo detector na próxima etapa.
          </p>
        </Panel>

        <NavBar onBack={back} onNext={next} nextLabel="Purificar amostra" />
      </motion.div>
    </PageShell>
  );
}

export function PrimerBlock({ len = PRIMER_LEN, size = 22 }: { len?: number; size?: number }) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-muted-foreground/40 bg-muted-foreground/15 px-1.5 py-0.5"
      title="Primer — ponto de partida da síntese"
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        primer
      </span>
      {Array.from({ length: len }).map((_, i) => (
        <span
          key={i}
          className="rounded-sm bg-muted-foreground/40"
          style={{ width: size * 0.55, height: size * 0.55 }}
        />
      ))}
    </div>
  );
}
