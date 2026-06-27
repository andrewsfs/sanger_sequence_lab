import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Panel, PageShell, StepHeader, NavBar } from "@/components/sanger/ui";
import { BASE_INFO, type Base } from "@/data/sanger";
import { Button } from "@/components/ui/button";
import { useExperiment } from "@/components/sanger/state";

type Band = { size: number; terminal: Base; count: number };

const SPEEDS = [1, 2, 4] as const;
type Speed = (typeof SPEEDS)[number];

export function SeparationScreen() {
  const { state, total, back, next, sim } = useExperiment();
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const [flash, setFlash] = useState<{ color: string; id: number } | null>(null);
  const [speed, setSpeed] = useState<Speed>(1);
  const [trace, setTrace] = useState<{ x: number; color: string }[]>([]);

  const bands: Band[] = useMemo(() => {
    const map = new Map<number, Band>();
    for (const f of sim.fragments) {
      const b = map.get(f.size);
      if (b) b.count += 1;
      else map.set(f.size, { size: f.size, terminal: f.terminal, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => a.size - b.size);
  }, [sim.fragments]);

  const empty = bands.length === 0;
  const done = !empty && readCount >= bands.length;

  const reset = () => {
    setRunning(false);
    setReadCount(0);
    setFlash(null);
    setTrace([]);
    setRunId((i) => i + 1);
  };

  useEffect(() => { reset(); /* eslint-disable-next-line */ }, [sim.fragments]);

  return (
    <PageShell>
      <motion.div key="sep" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
        <StepHeader
          step={state.stepIndex + 1}
          total={total}
          title="Eletroforese capilar"
          subtitle="Os fragmentos de DNA fluorescentes migram pelo capilar: os menores chegam primeiro ao detector e os maiores depois, formando o eletroferograma."
        />

        <Panel className="overflow-hidden">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Capilar · laser ao final
            </div>
            <div className="flex items-center gap-2">
              {!empty && (
                <div className="flex items-center gap-1 rounded-md border border-border bg-[var(--color-background)]/60 p-0.5">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`rounded px-2 py-0.5 text-[11px] font-mono transition ${
                        speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
              {!running && !done ? (
                <Button size="sm" onClick={() => { reset(); setRunning(true); }} disabled={empty}>
                  ▶ Iniciar migração
                </Button>
              ) : done ? (
                <Button size="sm" variant="outline" onClick={reset}>↻ Reiniciar</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={reset}>↻ Reiniciar</Button>
              )}
              <span className="text-xs text-primary min-w-[110px] text-right">
                {empty ? "—" : done ? "Leitura concluída" : running ? `Lidos ${readCount}/${bands.length}` : "Pronto"}
              </span>
            </div>
          </div>

          <Capillary
            key={runId}
            bands={bands}
            running={running}
            speed={speed}
            onRead={(b, x) => {
              setReadCount((c) => c + 1);
              setFlash({ color: BASE_INFO[b.terminal].color, id: b.size });
              setTrace((prev) => [...prev, { x, color: BASE_INFO[b.terminal].color }]);
            }}
            flash={flash}
            empty={empty}
          />

          {/* Mini electropherogram trace forming in real time */}
          <div className="mt-3 rounded-lg border border-border bg-[var(--color-background)]/40 p-2">
            <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Eletroferograma sendo formado</span>
              <span>{trace.length} pico(s)</span>
            </div>
            <TraceMini trace={trace} totalExpected={bands.length} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
            <div className="rounded-lg border border-border bg-[var(--color-background)]/40 p-3">
              <div className="font-semibold text-foreground">Menores primeiro</div>
              <p className="mt-1">Migram mais rápido porque encontram menos resistência no polímero do capilar.</p>
            </div>
            <div className="rounded-lg border border-border bg-[var(--color-background)]/40 p-3">
              <div className="font-semibold text-foreground">Laser excita o fluoróforo</div>
              <p className="mt-1">Cada base (A,T,C,G) tem uma cor distinta de emissão.</p>
            </div>
            <div className="rounded-lg border border-border bg-[var(--color-background)]/40 p-3">
              <div className="font-semibold text-foreground">Detector registra</div>
              <p className="mt-1">A cor lida em cada instante vira um pico no eletroferograma.</p>
            </div>
          </div>
        </Panel>

        <NavBar
          onBack={back}
          onNext={next}
          nextDisabled={!done && !empty}
          nextLabel={empty ? "Ver eletroferograma" : done ? "Abrir eletroferograma" : "Aguarde a migração..."}
        />
      </motion.div>
    </PageShell>
  );
}

// ----------------- Capillary -----------------

const DETECTOR_PX = 64;

function Capillary({
  bands, running, speed, onRead, flash, empty,
}: {
  bands: Band[];
  running: boolean;
  speed: Speed;
  onRead: (b: Band, x: number) => void;
  flash: { color: string; id: number } | null;
  empty: boolean;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackW, setTrackW] = useState(720);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTrackW(el.clientWidth));
    ro.observe(el);
    setTrackW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const maxSize = bands.length ? bands[bands.length - 1].size : 1;
  const minSize = bands.length ? bands[0].size : 1;
  const rowH = Math.max(18, Math.min(28, Math.floor((240 - 40) / Math.max(1, bands.length))));
  const trackH = Math.max(200, 40 + bands.length * rowH);

  return (
    <div
      ref={trackRef}
      className="relative w-full overflow-hidden rounded-xl border border-border bg-[var(--color-background)]/60"
      style={{ height: trackH }}
    >
      <div className="absolute left-0 top-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        ➜ Direção da migração — detector
      </div>

      <div
        className="absolute right-0 top-0 h-full bg-gradient-to-l from-primary/25 to-transparent"
        style={{ width: DETECTOR_PX }}
      />
      <div
        className="absolute top-0 h-full w-[2px] bg-primary/70"
        style={{ right: DETECTOR_PX, boxShadow: "0 0 12px var(--color-primary)" }}
      />
      {flash && (
        <motion.div
          key={flash.id}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute top-0 h-full"
          style={{
            right: DETECTOR_PX - 6,
            width: 12,
            background: flash.color,
            boxShadow: `0 0 24px ${flash.color}, 0 0 48px ${flash.color}`,
            filter: "blur(2px)",
          }}
        />
      )}

      {empty ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Capilar vazio — não há fragmentos para separar.
        </div>
      ) : (
        bands.map((b, i) => (
          <FragmentRow
            key={b.size}
            band={b}
            row={i}
            rowH={rowH}
            trackW={trackW}
            maxSize={maxSize}
            minSize={minSize}
            running={running}
            speed={speed}
            onRead={onRead}
          />
        ))
      )}
    </div>
  );
}

function FragmentRow({
  band, row, rowH, trackW, maxSize, minSize, running, speed, onRead,
}: {
  band: Band; row: number; rowH: number; trackW: number; maxSize: number; minSize: number;
  running: boolean; speed: Speed; onRead: (b: Band, x: number) => void;
}) {
  const color = BASE_INFO[band.terminal].color;

  // Visual width proportional to fragment size — larger = bigger blob.
  const sizeRatio = (band.size - minSize) / Math.max(1, maxSize - minSize);
  const visualW = Math.round(18 + sizeRatio * 38); // 18..56 px

  // Duration: smaller fragments migrate faster.
  const t = (band.size - minSize) / Math.max(1, maxSize - minSize); // 0..1
  const baseDur = 2.4 + t * 7.6; // 2.4s .. 10s
  const duration = baseDur / speed;

  const startX = 8;
  const endX = Math.max(startX + 40, trackW - DETECTOR_PX - 18 - visualW);

  const firedRef = useRef(false);
  useEffect(() => { firedRef.current = false; }, [running]);

  return (
    <motion.div
      initial={{ x: startX }}
      animate={running ? { x: endX } : { x: startX }}
      transition={running ? { duration, ease: "linear" } : { duration: 0 }}
      onUpdate={(latest) => {
        if (!running) return;
        const x = typeof latest.x === "number" ? latest.x : parseFloat(String(latest.x));
        if (!firedRef.current && x >= endX - 2) {
          firedRef.current = true;
          // x position normalized to detector arrival timeline (0..1) by size
          onRead(band, t);
        }
      }}
      className="absolute flex items-center gap-2"
      style={{ top: 28 + row * rowH, left: 0 }}
      title={`${band.size} nt · base terminadora ${band.terminal}`}
    >
      <span className="font-mono text-[10px] text-muted-foreground w-8 text-right">
        {band.size}
      </span>
      <div
        className="rounded-full"
        style={{
          width: visualW,
          height: Math.max(8, Math.round(6 + sizeRatio * 8)),
          background: color,
          boxShadow: `0 0 10px ${color}`,
          opacity: firedRef.current ? 0.3 : 1,
        }}
      />
      <span className="font-mono text-[10px]" style={{ color }}>
        {band.terminal}
      </span>
    </motion.div>
  );
}

// ----------------- Mini trace -----------------

function TraceMini({ trace, totalExpected }: { trace: { x: number; color: string }[]; totalExpected: number }) {
  const W = 600;
  const H = 60;
  const slots = Math.max(1, totalExpected);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-full">
      <line x1={0} y1={H - 8} x2={W} y2={H - 8} stroke="currentColor" strokeOpacity={0.2} />
      {trace.map((p, i) => {
        const cx = ((i + 0.5) / slots) * W;
        return (
          <g key={i}>
            <path
              d={`M ${cx - 14} ${H - 8} Q ${cx} 6 ${cx + 14} ${H - 8}`}
              fill="none"
              stroke={p.color}
              strokeWidth={2}
              opacity={0.95}
            />
          </g>
        );
      })}
    </svg>
  );
}
