import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BASE_INFO, type Base } from "@/data/sanger";

export function BaseToken({
  base,
  size = 36,
  glow = false,
  dd = false,
  label,
}: {
  base: Base;
  size?: number;
  glow?: boolean;
  dd?: boolean;
  label?: string;
}) {
  const info = BASE_INFO[base];
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        layout
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
        className={cn(
          "flex items-center justify-center rounded-md font-mono font-bold text-[var(--color-background)]",
          glow && "ring-2 ring-offset-2 ring-offset-[var(--color-background)]",
        )}
        style={{
          width: size,
          height: size,
          background: info.color,
          boxShadow: glow ? `0 0 24px ${info.color}` : undefined,
        }}
      >
        {dd ? `dd${base}` : base}
      </motion.div>
      {label ? (
        <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function StepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
}) {
  const pct = (step / total) * 100;
  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Etapa {step} / {total}</span>
        <span className="text-primary">Sanger · Lab Virtual</span>
      </div>
      <Progress value={pct} className="h-1 bg-[var(--color-secondary)]" />
      <h1 className="mt-5 text-2xl font-semibold sm:text-3xl">{title}</h1>
      {subtitle ? (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel rounded-2xl p-5 sm:p-7", className)}>{children}</div>
  );
}

export function NavBar({
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled,
  backDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={backDisabled || !onBack}
        className="text-muted-foreground hover:text-foreground"
      >
        ← Voltar
      </Button>
      {onNext ? (
        <Button onClick={onNext} disabled={nextDisabled} size="lg" className="px-6">
          {nextLabel} →
        </Button>
      ) : null}
    </div>
  );
}

export function useTypewriter(items: string[], delayMs = 70) {
  const [i, setI] = useState(0);
  useMemo(() => setI(0), [items.length, delayMs]);
  return { i, max: items.length };
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </div>
    </div>
  );
}
