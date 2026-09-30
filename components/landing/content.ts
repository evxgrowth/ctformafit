// Todo o texto da landing fica aqui para facilitar ajustes de copy.

export const IMG = {
  salao: "/images/salao-musculacao.jpg",
  ampla: "/images/estrutura-ampla.jpg",
  noite: "/images/academia-noite.jpg",
  esteiras: "/images/cardio-esteiras.jpg",
  escada: "/images/cardio-escada.jpg",
  supino: "/images/supino.jpg",
  logo: "/images/logo-formafit.png",
};

export const TICKER_A = [
  "Musculação",
  "Cardio gigante",
  "Bioimpedância de última geração",
  "Botão de chamada do professor",
  "Equipamentos novíssimos",
  "Estacionamento com segurança",
];
export const TICKER_B = ["Aqui você não malha", "Você treina", "Aberto até meia-noite", "Natal Moda Shopping", "Bairro Jardins", "BR-406"];

export const PAINS = [
  "Esperar na fila do aparelho",
  "Treinar num lugar abafado",
  "Caçar o professor pela academia",
  "Rodar atrás de vaga pra estacionar",
  "Aparelho velho e “em manutenção”",
];

export const PILLARS = [
  {
    n: "01",
    title: "Espaço gigante",
    text: "Área ampla, pé-direito alto e circulação livre. Tem aparelho para todo mundo, até no horário de pico.",
  },
  {
    n: "02",
    title: "Equipamentos novíssimos",
    text: "Máquinas modernas, com biomecânica precisa e carga de verdade para cada grupo muscular.",
  },
  {
    n: "03",
    title: "Ambiente ventilado",
    text: "Galpão arejado e bem iluminado. Você sente a diferença já na primeira série.",
  },
  {
    n: "04",
    title: "Atendimento impecável",
    text: "Equipe presente no salão, atenta à sua execução e à sua evolução, do primeiro dia em diante.",
  },
];

export const GALLERY = [
  { src: IMG.salao, alt: "Salão de musculação amplo do CT Forma Fit com aparelhos novos", title: "Salão de musculação", text: "Dezenas de aparelhos lado a lado, sem aperto." },
  { src: IMG.esteiras, alt: "Fileira de esteiras no cardio do CT Forma Fit", title: "Cardio gigantesco", text: "Fileiras de esteiras. Nada de esperar a sua vez." },
  { src: IMG.noite, alt: "CT Forma Fit iluminado à noite com alunos treinando", title: "Clima de arena", text: "Iluminação que dá gás do primeiro ao último treino." },
  { src: IMG.supino, alt: "Aluno fazendo supino na área de peso livre do CT Forma Fit", title: "Peso livre", text: "Barras, anilhas e bancos para quem treina pesado." },
  { src: IMG.escada, alt: "Escada, bikes e esteiras na área de cardio do CT Forma Fit", title: "Escada, bike e esteira", text: "Cardio completo para queimar e condicionar." },
  { src: IMG.ampla, alt: "Visão geral da estrutura ampla e ventilada do CT Forma Fit", title: "Ventilado e amplo", text: "Circulação livre e ar correndo pelo galpão." },
];

export const COMFORT = [
  { icon: "shower", title: "Vestiários", text: "Chegue do trabalho, treine e saia pronto." },
  { icon: "pool", title: "Mesa de sinuca", text: "Resenha garantida antes ou depois do treino." },
  { icon: "sofa", title: "Sofá e lounge", text: "Um canto confortável para esperar e descansar." },
  { icon: "coffee", title: "Café", text: "Aquele cafezinho que todo mundo gosta." },
  { icon: "fridge", title: "Energéticos gelados", text: "Geladeira abastecida para o seu gás extra." },
  { icon: "wind", title: "Ambiente ventilado", text: "Treino pesado sem sensação de sufoco." },
] as const;

export const REVIEWS = [
  { name: "Polly C.", text: "Amei a academia! Um ambiente super mega espaçoso, a maior do RN! Sem falar na quantidade de maquinários... simplesmente completíssima!" },
  { name: "Marconi B.", text: "O maior e melhor CT de treinamento do RN. Aqui você não malha, você vai TREINAR." },
  { name: "Jaqueline F.", text: "Ótimo ambiente para prática de musculação, estrutura e aparelhos de qualidade." },
  { name: "Obedis D.", text: "Estou há 4 meses frequentando e só tenho a agradecer! São todos ótimos, até o pessoal que frequenta, são muito de boa!" },
  { name: "Marcos S.", text: "Lugar totalmente confortável, equipamentos novos de alta qualidade. Recomendo a todos irem treinar." },
  { name: "Aluno do CT", text: "Boa localização, espaço amplo, maquinário top, profissionais bem instruídos." },
  { name: "Aluna do CT", text: "Academia nova, equipamentos de qualidade e professores educados." },
  { name: "Aluno do CT", text: "Uma das melhores opções da região do bairro Jardins." },
];

export const FAQ = [
  {
    q: "Onde fica o CT Forma Fit?",
    a: "Dentro do Natal Moda Shopping, na R. Francisco Duarte de Carvalho, 1200, bairro Jardins, em São Gonçalo do Amarante/RN, às margens da BR-406. Fácil de chegar de qualquer ponto da Grande Natal.",
  },
  {
    q: "Qual o horário de funcionamento?",
    a: "De segunda a sexta, das 05h à 00h. Aos sábados, das 08h às 18h. Domingos e feriados, das 09h às 15h. Dá para treinar antes do trabalho, depois da faculdade ou tarde da noite.",
  },
  {
    q: "Tem estacionamento?",
    a: "Tem sim: estacionamento privativo e com segurança particular. Você estaciona perto e treina tranquilo.",
  },
  {
    q: "Posso fazer uma aula experimental?",
    a: "Pode. Chame a nossa equipe no WhatsApp, escolha o melhor dia e venha sentir a estrutura na prática antes de decidir.",
  },
  {
    q: "Quais modalidades o CT oferece?",
    a: "Nosso foco é musculação e cardio, com uma estrutura completa: salão amplo de musculação, área de peso livre e um cardio gigante com esteiras, escadas e bikes.",
  },
  {
    q: "Como funciona o botão de chamada do professor?",
    a: "Os aparelhos têm um botão de chamada. Ficou em dúvida sobre a execução ou a carga? Aperte o botão e o professor vem até você.",
  },
  {
    q: "O que é a avaliação de bioimpedância?",
    a: "É uma avaliação corporal feita em uma das máquinas mais modernas do mercado. Em poucos minutos ela mostra dados como percentual de gordura e massa muscular, para você acompanhar a sua evolução com números.",
  },
  {
    q: "Sou iniciante. O CT é para mim?",
    a: "Com certeza. A equipe acompanha você desde o primeiro treino, corrige a execução e ajusta as cargas. O ambiente é acolhedor para quem está começando e desafiador para quem já treina pesado.",
  },
  {
    q: "Quais são os planos e valores?",
    a: "Temos planos para diferentes objetivos e rotinas. Fale com a nossa equipe no WhatsApp para receber os valores atualizados e as condições da semana.",
  },
];
