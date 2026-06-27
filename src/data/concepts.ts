// Textos pedagógicos reutilizáveis — separados da UI para facilitar revisão científica.

export const CONCEPTS = {
  primer:
    "O primer é um pequeno oligonucleotídeo que pareia com o molde e fornece o 3'-OH livre a partir do qual a DNA polimerase começa a sintetizar a nova fita.",
  polymerase:
    "A DNA polimerase percorre a fita molde no sentido 3'→5' e adiciona nucleotídeos complementares à nova fita no sentido 5'→3'.",
  dntp:
    "Os dNTPs (dATP, dTTP, dCTP, dGTP) são os nucleotídeos normais que constituem a nova fita.",
  ddntp:
    "Os ddNTPs são análogos sem o grupo 3'-OH. Quando incorporados, impedem a ligação fosfodiéster com o próximo nucleotídeo — a cadeia termina ali. Cada base (A,T,C,G) tem um fluoróforo distinto.",
  buffer:
    "O tampão mantém o pH e a concentração de Mg²⁺ ideais para a atividade da DNA polimerase.",
  fragments:
    "Como cada fragmento de DNA incorpora o ddNTP em uma posição diferente, geram-se milhares de fragmentos de tamanhos distintos — cada um terminado por uma base fluorescente.",
  electrophoresis:
    "Na eletroforese capilar, fragmentos menores migram mais rápido. Ao final do capilar, um laser excita o fluoróforo e um detector registra a cor — ou seja, a base terminal — de cada fragmento.",
  electropherogram:
    "Cada pico do eletroferograma corresponde à base terminal de um fragmento. Lendo os picos em ordem (do menor ao maior fragmento) obtemos a sequência 5'→3' da nova fita.",
  heterozygous:
    "Em uma posição heterozigota há dois alelos diferentes. O eletroferograma mostra DOIS picos sobrepostos na mesma posição — um para cada alelo.",
  homozygous:
    "Em uma posição homozigota os dois alelos são iguais. O eletroferograma mostra um ÚNICO pico nítido naquela posição.",
} as const;

export const CONSEQUENCES = {
  no_primer: {
    title: "Sem primer, a polimerase não tem onde começar",
    body:
      "Sem o 3'-OH livre fornecido pelo primer, a DNA polimerase não consegue iniciar a síntese. Nenhuma nova fita é produzida e o eletroferograma fica vazio.",
  },
  no_polymerase: {
    title: "Sem DNA polimerase, não há síntese",
    body:
      "Sem a enzima, os nucleotídeos não são ligados ao primer. Não há fragmentos para separar e nada é detectado.",
  },
  no_ddntp: {
    title: "Sem ddNTPs, a cadeia não termina e nada é marcado",
    body:
      "A polimerase continua sintetizando até o final do molde, produzindo poucos e longos fragmentos de DNA — todos do mesmo tamanho e sem fluorescência. O detector não consegue distinguir bases.",
  },
  no_dntp: {
    title: "Sem dNTPs, a elongação para imediatamente",
    body:
      "Sem nucleotídeos normais, a polimerase incorpora um ddNTP logo no início e a cadeia termina com 1 ou 2 bases. Os fragmentos são curtíssimos e a leitura é inconclusiva.",
  },
  wrong_reagent: {
    title: "Reagente irrelevante presente na mistura",
    body:
      "Componentes que não participam do Sanger (anticorpos, hemácias, ribossomos, tRNAs) não impedem a reação, mas indicam má compreensão do método e prejudicam a pontuação.",
  },
} as const;
