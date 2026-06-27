import { useState } from "react";
import { Info, Heart, Code2, FlaskConical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AboutButton({ variant = "icon" }: { variant?: "icon" | "link" }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sobre o projeto"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
          >
            <Info className="h-4 w-4" />
          </Button>
        ) : (
          <button
            type="button"
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
          >
            Sobre o projeto
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto glass-panel border-[var(--color-border)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Sobre o Projeto
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Simulador Interativo de Sequenciamento de Sanger
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-2 text-sm leading-relaxed">
          <section className="space-y-2">
            <p>
              O Simulador Interativo de Sequenciamento de Sanger é um projeto
              educacional desenvolvido para tornar um dos métodos mais
              importantes da Biologia Molecular mais visual, intuitivo e
              acessível para estudantes em formação.
            </p>
            <p className="text-muted-foreground">
              Mais do que apresentar conceitos isolados, o projeto permite que
              o aluno acompanhe cada etapa do processo experimental, compreenda
              a função dos reagentes, visualize as consequências das decisões
              tomadas durante o experimento e interprete os resultados — uma
              experiência digital próxima da realidade de um laboratório de
              diagnóstico molecular.
            </p>
          </section>

          <section className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-secondary)]/40 p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <FlaskConical className="h-4 w-4 text-primary" />
              Origem do projeto
            </h3>
            <p className="text-muted-foreground">
              Iniciativa de iniciação científica desenvolvida para apresentação
              na <strong className="text-foreground">Feira Maker 2026</strong>,
              unindo conhecimentos das áreas biomédicas e tecnológicas para
              aproximar ciência, educação e tecnologia por meio de experiências
              interativas de aprendizagem.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold">Autoria e colaboração</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Heart className="h-4 w-4 text-rose-400" />
                  Linda Sales
                </div>
                <p className="text-xs text-muted-foreground">
                  Graduanda em Biomedicina e idealizadora do projeto.
                  Responsável pela concepção científica, construção da
                  experiência pedagógica, definição do fluxo laboratorial e
                  validação dos conteúdos biomédicos.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Code2 className="h-4 w-4 text-primary" />
                  Andrews Souza
                </div>
                <p className="text-xs text-muted-foreground">
                  Arquiteto de Soluções responsável pela arquitetura da
                  plataforma, experiência do usuário, engenharia da aplicação
                  e implementação técnica.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold">
              Uma construção interdisciplinar
            </h3>
            <p className="text-muted-foreground">
              Este projeto representa a colaboração entre diferentes áreas do
              conhecimento com um objetivo comum: tornar conceitos complexos da
              Biologia Molecular mais compreensíveis, acessíveis e visualmente
              intuitivos para estudantes e futuros profissionais da área da
              saúde.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold">Filosofia pedagógica</h3>
            <ul className="grid gap-1.5 text-muted-foreground sm:grid-cols-2">
              <li>• Compreensão visual</li>
              <li>• Raciocínio causal</li>
              <li>• Aprendizagem pela experimentação</li>
              <li>• Interpretação de resultados</li>
              <li>• Entendimento do processo laboratorial</li>
            </ul>
          </section>

          <p className="border-t border-[var(--color-border)] pt-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Feira Maker 2026
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
