export type Base = "A" | "T" | "C" | "G";

export const TARGET_SEQUENCE: Base[] = [
  "A","T","G","C","G","T","A","C","C","G","T","A",
];

export const BASE_INFO: Record<Base, { name: string; color: string; pair: Base }> = {
  A: { name: "Adenina",  color: "var(--color-base-a)", pair: "T" },
  T: { name: "Timina",   color: "var(--color-base-t)", pair: "A" },
  C: { name: "Citosina", color: "var(--color-base-c)", pair: "G" },
  G: { name: "Guanina",  color: "var(--color-base-g)", pair: "C" },
};

export type Reagent = {
  id: string;
  name: string;
  icon: string;
  correct: boolean;
  blurb: string;
  rationale: string;
};

export const REAGENTS: Reagent[] = [
  { id: "dna",   name: "DNA molde",            icon: "🧬", correct: true,
    blurb: "Fita a ser sequenciada.",
    rationale: "Serve como molde para a síntese da nova fita." },
  { id: "primer", name: "Primer",              icon: "➰", correct: true,
    blurb: "Oligonucleotídeo iniciador.",
    rationale: "Fornece o ponto 3'-OH onde a polimerase começa a sintetizar." },
  { id: "pol",   name: "DNA Polimerase",       icon: "⚙️", correct: true,
    blurb: "Enzima de síntese.",
    rationale: "Adiciona nucleotídeos complementares ao molde." },
  { id: "dntp",  name: "dNTPs",                icon: "🔹", correct: true,
    blurb: "Nucleotídeos normais.",
    rationale: "Constroem a nova fita: dATP, dTTP, dCTP, dGTP." },
  { id: "ddntp", name: "ddNTPs fluorescentes", icon: "✨", correct: true,
    blurb: "Terminadores marcados.",
    rationale: "Sem 3'-OH: interrompem a cadeia e emitem fluorescência específica por base." },
  { id: "buffer",name: "Buffer",               icon: "🧪", correct: true,
    blurb: "Tampão da reação.",
    rationale: "Mantém pH e íons (Mg²⁺) ideais para a polimerase." },
  { id: "ribo",  name: "Ribossomo",            icon: "🟠", correct: false,
    blurb: "Organela citoplasmática.",
    rationale: "Atua na síntese de proteínas — não participa do Sanger." },
  { id: "rbc",   name: "Hemácia",              icon: "🔴", correct: false,
    blurb: "Célula sanguínea.",
    rationale: "Transporta gases; nada a ver com sequenciamento de DNA." },
  { id: "ab",    name: "Anticorpo",            icon: "🜲", correct: false,
    blurb: "Proteína imunológica.",
    rationale: "Reconhece antígenos — usada em imunoensaios, não no Sanger." },
  { id: "trna",  name: "RNA transportador",    icon: "🧷", correct: false,
    blurb: "tRNA.",
    rationale: "Carrega aminoácidos durante a tradução — não atua no Sanger." },
];

export type QuizQuestion = {
  q: string;
  options: { text: string; correct: boolean; feedback: string }[];
};

export const QUIZ: QuizQuestion[] = [
  {
    q: "Por que a cadeia de DNA é interrompida no Sequenciamento de Sanger?",
    options: [
      { text: "Porque a polimerase se desnatura.", correct: false,
        feedback: "Não. A polimerase continua ativa — a interrupção é química, pelo ddNTP." },
      { text: "Porque o ddNTP incorporado não tem o grupo 3'-OH.", correct: true,
        feedback: "Exato! Sem 3'-OH, não há ligação fosfodiéster com o próximo nucleotídeo." },
      { text: "Porque o primer se solta.", correct: false,
        feedback: "Não. O primer permanece pareado; a parada ocorre pela incorporação do ddNTP." },
    ],
  },
  {
    q: "Qual é a função dos ddNTPs marcados com fluorescência?",
    options: [
      { text: "Iniciar a síntese de DNA.", correct: false,
        feedback: "Quem inicia é o primer. O ddNTP TERMINA a síntese." },
      { text: "Terminar a cadeia e identificar a base na qual parou.", correct: true,
        feedback: "Isso! Cada base (A,T,C,G) tem uma cor diferente, lida no detector." },
      { text: "Cortar o DNA molde em fragmentos.", correct: false,
        feedback: "Quem corta DNA são enzimas de restrição — não os ddNTPs." },
    ],
  },
  {
    q: "Por que fragmentos menores aparecem primeiro na separação?",
    options: [
      { text: "Porque migram mais rápido no capilar.", correct: true,
        feedback: "Correto: a separação é por tamanho — menores migram mais rápido." },
      { text: "Porque têm mais carga elétrica.", correct: false,
        feedback: "A carga por nucleotídeo é similar; o que muda é o tamanho." },
      { text: "Porque a polimerase os sintetiza primeiro.", correct: false,
        feedback: "A ordem de síntese não define a ordem de leitura — o tamanho sim." },
    ],
  },
  {
    q: "Como é obtida a sequência final a partir do eletroferograma?",
    options: [
      { text: "Lendo as cores dos picos na ordem em que aparecem.", correct: true,
        feedback: "Sim! Cada pico = uma base. A ordem dos picos = a sequência." },
      { text: "Somando as alturas dos picos.", correct: false,
        feedback: "A altura indica intensidade do sinal, não a base." },
      { text: "Comparando com um gene de referência.", correct: false,
        feedback: "Isso é alinhamento posterior — a leitura em si vem dos picos." },
    ],
  },
];
