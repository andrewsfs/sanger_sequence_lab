import { createFileRoute } from "@tanstack/react-router";
import { ExperimentProvider, useExperiment } from "@/components/sanger/state";
import { IntroScreen } from "@/components/sanger/IntroScreen";
import { ObjectiveScreen } from "@/components/sanger/ObjectiveScreen";
import { ReactionScreen } from "@/components/sanger/ReactionScreen";
import { ChecklistScreen } from "@/components/sanger/ChecklistScreen";
import { SequencingStartScreen } from "@/components/sanger/SequencingStartScreen";
import { IncorporationScreen } from "@/components/sanger/IncorporationScreen";
import { FragmentsScreen } from "@/components/sanger/FragmentsScreen";
import { SeparationScreen } from "@/components/sanger/SeparationScreen";
import { ElectroScreen } from "@/components/sanger/ElectroScreen";
import { InterpretationScreen } from "@/components/sanger/InterpretationScreen";
import { ThermocyclerScreen } from "@/components/sanger/ThermocyclerScreen";
import { PurificationScreen } from "@/components/sanger/PurificationScreen";
import { ResultScreen } from "@/components/sanger/ResultScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulador de Sequenciamento de Sanger — Lab Virtual" },
      {
        name: "description",
        content:
          "Aprenda Sequenciamento de Sanger executando um experimento virtual passo a passo: monte a reação, gere fragmentos, leia o eletroferograma e interprete um caso clínico.",
      },
      { property: "og:title", content: "Simulador de Sequenciamento de Sanger" },
      {
        property: "og:description",
        content:
          "Laboratório virtual interativo de 11 etapas para estudantes de Biomedicina aprenderem o método de Sanger e interpretar casos clínicos reais.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ExperimentProvider>
      <Router />
    </ExperimentProvider>
  );
}

function Router() {
  const { step } = useExperiment();
  switch (step) {
    case "intro":          return <IntroScreen />;
    case "objective":      return <ObjectiveScreen />;
    case "reaction":       return <ReactionScreen />;
    case "checklist":      return <ChecklistScreen />;
    case "thermocycler":   return <ThermocyclerScreen />;
    case "seq-start":      return <SequencingStartScreen />;
    case "incorporation":  return <IncorporationScreen />;
    case "fragments":      return <FragmentsScreen />;
    case "purification":   return <PurificationScreen />;
    case "separation":     return <SeparationScreen />;
    case "electro":        return <ElectroScreen />;
    case "interpretation": return <InterpretationScreen />;
    case "result":         return <ResultScreen />;
  }
}
