import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Panel, PageShell } from "@/components/sanger/ui";
import { BASE_INFO } from "@/data/sanger";
import { useExperiment } from "@/components/sanger/state";

export function IntroScreen() {
  const { next } = useExperiment();
  return (
    <PageShell>
      <motion.div
        key="intro"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-[80vh] items-center"
      >
        <div className="grid w-full gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />
              Laboratório Virtual
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              Aprenda <span className="text-glow text-primary">Sequenciamento de Sanger</span> passo a passo.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              Você vai executar a técnica virtualmente: montar a reação,
              programar o termociclador (Cycle Sequencing), acompanhar a
              síntese da nova fita com incorporação de ddNTPs, purificar a
              amostra, separar os fragmentos por eletroforese capilar, ler o
              eletroferograma e interpretar um caso clínico.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" onClick={next} className="px-7 text-base glow-primary">
                Entrar no laboratório →
              </Button>
              <span className="text-xs text-muted-foreground">
                ~10 min · 13 etapas · interativo
              </span>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-4 gap-3">
              {(["A","T","C","G"] as const).map((b) => (
                <div key={b} className="rounded-lg border border-border bg-[var(--color-panel)]/60 p-3 text-center">
                  <div
                    className="mx-auto h-2 w-8 rounded-full"
                    style={{ background: BASE_INFO[b].color, boxShadow: `0 0 18px ${BASE_INFO[b].color}` }}
                  />
                  <div className="mt-2 font-mono text-sm font-bold">{b}</div>
                  <div className="text-[10px] text-muted-foreground">{BASE_INFO[b].name}</div>
                </div>
              ))}
            </div>
          </div>

          <Panel className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 lab-grid" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>Bancada virtual</span>
                <span className="text-primary">Pronto para iniciar</span>
              </div>
              <DnaPreview />
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
                <Stat label="Método" value="Sanger" />
                <Stat label="Leitura" value="Fluor." />
                <Stat label="Etapas" value="13" />
              </div>
            </div>
          </Panel>
        </div>
      </motion.div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--color-background)]/40 px-2 py-3">
      <div className="font-display text-lg text-foreground">{value}</div>
      <div>{label}</div>
    </div>
  );
}

function DnaPreview() {
  return (
    <div className="relative h-56 w-full">
      <svg viewBox="0 0 600 220" className="h-full w-full">
        <defs>
          <linearGradient id="strand" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.16 195)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 170)" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i / 59) * 600;
          const y1 = 110 + Math.sin(i / 3) * 40;
          const y2 = 110 - Math.sin(i / 3) * 40;
          return (
            <line key={i} x1={x} y1={y1} x2={x} y2={y2}
              stroke="oklch(0.82 0.16 195 / 0.25)" strokeWidth="1" />
          );
        })}
        <motion.path
          d={Array.from({ length: 121 }).map((_, i) => {
            const x = (i / 120) * 600;
            const y = 110 + Math.sin(i / 6) * 40;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ")}
          fill="none" stroke="url(#strand)" strokeWidth="3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6 }}
        />
        <motion.path
          d={Array.from({ length: 121 }).map((_, i) => {
            const x = (i / 120) * 600;
            const y = 110 - Math.sin(i / 6) * 40;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ")}
          fill="none" stroke="url(#strand)" strokeWidth="3" strokeOpacity="0.55"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.15 }}
        />
      </svg>
    </div>
  );
}
