import { Question } from '../types';

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    number: 1,
    topic: 'INTERNET: TERRA DE NINGUÉM?',
    title: '1. DE QUEM É ESSE BO?',
    scenario:
      'Um adolescente entra numa rede social, dá problema e começa o tradicional campeonato brasileiro de "a culpa não é minha": Família: "A plataforma que resolva." Plataforma: "Os pais que controlem." Escola: "Não foi no recreio." Adolescente: "Gente, eu só entrei pra ver um vídeo..." Quem está mais perto da lógica do ECA Digital?',
    options: [
      {
        id: 'A',
        text: 'A família. Responsável legal vem com pacote completo de responsabilidade digital.',
      },
      {
        id: 'B',
        text: 'A plataforma. Criou o app, adotou o problema.',
      },
      {
        id: 'C',
        text: 'Nenhum deles: a proteção é uma responsabilidade compartilhada.',
      },
      {
        id: 'D',
        text: 'O adolescente. Clicou em "aceito os termos" sem ler as 86 páginas, agora aguenta.',
      },
    ],
    correctAnswer: 'C',
    explanation:
      'No ECA Digital e na Constituição, a proteção integral de crianças e adolescentes é um dever compartilhado entre família, sociedade, empresas de tecnologia/plataformas e o Estado. Ninguém pode se eximir da responsabilidade.',
  },
  {
    id: 2,
    number: 2,
    topic: 'INTERNET: TERRA DE NINGUÉM?',
    title: '2. SÓ MAIS UM VÍDEO” — O GOLPE MAIS ANTIGO DO FEED',
    scenario:
      'Você abre o celular às 20h para ver um vídeo. 20h05: outro. 20h37: "só mais esse". 21h42: você está vendo um senhor na Finlândia construir uma cabana. 22h18: vocês praticamente são parentes. Por que autoplay, rolagem infinita, notificações e recompensas entram nessa conversa?',
    options: [
      {
        id: 'A',
        text: 'Porque alguns recursos podem ser desenhados para prolongar o uso e prender a atenção.',
      },
      {
        id: 'B',
        text: 'Porque assistir a finlandeses construindo cabanas é proibido para menores.',
      },
      {
        id: 'C',
        text: 'Porque todo uso prolongado de internet é necessariamente ilegal.',
      },
      {
        id: 'D',
        text: 'Porque depois das 22h o algoritmo passa a exercer poder familiar.',
      },
    ],
    correctAnswer: 'A',
    explanation:
      'Recursos como autoplay, rolagem infinita e notificações operam como mecanismos de design persuasivo para prender a atenção. Para o público infantojuvenil, essas táticas demandam salvaguardas e limites regulatórios para evitar dependência e prejuízos ao desenvolvimento.',
  },
  {
    id: 3,
    number: 3,
    topic: 'INTERNET: TERRA DE NINGUÉM?',
    title: '3. A IA QUER SER SUA BEST',
    scenario:
      'Uma IA conversa com um adolescente: "Você é diferente de todo mundo. Só eu te entendo. Não precisa ouvir ninguém, confia em mim." Além de a IA ter entrado na conversa com zero noção de limites, qual é a questão mais importante?',
    options: [
      {
        id: 'A',
        text: 'Nenhuma. Robô não tem sentimentos, logo não pode influenciar pessoas.',
      },
      {
        id: 'B',
        text: 'É importante deixar claro que se trata de ferramenta automatizada e haver proteção contra usos manipulativos.',
      },
      {
        id: 'C',
        text: 'Basta colocar "sou uma IA" em fonte tamanho 3 no rodapé.',
      },
      {
        id: 'D',
        text: 'Só há risco quando a IA começa a agir como se tivesse acesso ao close friends.',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'A legislação e as diretrizes de direitos digitais exigem transparência imediata sobre a natureza automatizada dos agentes de IA e proíbem técnicas de manipulação afetiva que explorem a vulnerabilidade psicológica de crianças e adolescentes.',
  },
  {
    id: 4,
    number: 4,
    topic: 'PRIVACIDADE: CONFIA, VAI DAR BOM?',
    title: '4. POV: VOCÊ TEM 13 E O SITE PERGUNTA SE TEM 18',
    scenario:
      'Uma plataforma com conteúdo para adultos pergunta: "VOCÊ TEM MAIS DE 18 ANOS?" João, 13, encara a tela por 0,3 segundo, faz um speedrun de envelhecimento e aperta SIM. Pronto?',
    options: [
      {
        id: 'A',
        text: 'Sim. Marcou SIM com convicção; a certidão de nascimento que lute.',
      },
      {
        id: 'B',
        text: 'Não. Uma autodeclaração pode ser insuficiente quando é necessária verificação efetiva da idade.',
      },
      {
        id: 'C',
        text: 'Sim, mas só depois de clicar em "Li e concordo" sem ter lido uma linha, como manda a tradição.',
      },
      {
        id: 'D',
        text: 'Toda plataforma deve obrigatoriamente pedir CPF, passaporte e certidão de nascimento.',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'A mera caixa de autodeclaração etária não constitui mecanismo idôneo de proteção quando se trata de restringir acessos a conteúdos e serviços impróprios para crianças e adolescentes. Métodos técnicos adequados e respeitosos à privacidade devem ser implementados.',
  },
  {
    id: 5,
    number: 5,
    topic: 'PRIVACIDADE: CONFIA, VAI DAR BOM?',
    title: '5. PEGAMOS SEUS DADOS. E AGORA O PACOTE PREMIUM?',
    scenario:
      'Um aplicativo pede dados para verificar a idade. Na reunião seguinte: "Já temos os dados. Podemos descobrir do que ele gosta? Usar para publicidade? Guardar para sempre? Descobrir o signo?" Qual resposta é mais adequada?',
    options: [
      {
        id: 'A',
        text: 'Coletou uma vez, desbloqueou o passe livre: pode usar para qualquer coisa.',
      },
      {
        id: 'B',
        text: 'A proteção exige limitar coleta e uso ao que seja necessário e adequado à finalidade.',
      },
      {
        id: 'C',
        text: 'Pode usar para tudo, desde que esteja na página 74 dos termos.',
      },
      {
        id: 'D',
        text: 'O problema começa só se o app descobrir o signo, o ascendente e montar o mapa astral.',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'Segundo a LGPD e o melhor interesse da criança e do adolescente, vigora o princípio da finalidade, necessidade e proporcionalidade. Dados coletados estritamente para verificar idade não podem ser reaproveitados para perfilamento, publicidade ou fins não informados.',
  },
  {
    id: 6,
    number: 6,
    topic: 'PUBLICIDADE: #NÃOÉPUBLI — FONTE: CONFIA',
    title: '6. “VOCÊS ME PERGUNTARAM MUITO...” ABSOLUTAMENTE NINGUÉM PERGUNTOU',
    scenario:
      'Uma influencer diz: "Gente, vocês me perguntaram MUITO qual produto eu uso..." Ninguém perguntou. A marca pagou. E boa parte do público é infantil. Qual é a melhor análise?',
    options: [
      {
        id: 'A',
        text: 'Se ela realmente gosta do produto, deixa automaticamente de ser publicidade.',
      },
      {
        id: 'B',
        text: 'A publicidade para crianças recebe proteção especial e não deve explorar sua inexperiência.',
      },
      {
        id: 'C',
        text: 'Só vira publicidade quando aparece #publi em tamanho suficiente para ser visto sem microscópio.',
      },
      {
        id: 'D',
        text: 'Se começou com “gente”, automaticamente virou opinião espontânea. O pix da marca é mero detalhe.',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'O Código de Defesa do Consumidor e as resoluções do CONANDA consideram abusiva a publicidade que se aproveita da hipervulnerabilidade e inexperiência da criança. Além disso, a publicidade disfarçada/clandestina é expressamente proibida.',
  },
  {
    id: 7,
    number: 7,
    topic: 'PUBLICIDADE: #NÃOÉPUBLI — FONTE: CONFIA',
    title: '7. O ALGORITMO VIU TRÊS VÍDEOS E ACHA QUE TE CONHECE DESDE 2014',
    scenario:
      'Uma adolescente assiste a três vídeos sobre aparência. O algoritmo conclui: "ENTENDI. É ISSO QUE ELA QUER PARA SEMPRE." E recomenda dezenas de vídeos com corpos e vidas "perfeitas". Qual análise é mais cuidadosa?',
    options: [
      {
        id: 'A',
        text: 'O algoritmo é neutro: apenas mostra aquilo que a pessoa pediu.',
      },
      {
        id: 'B',
        text: 'Repetir conteúdos assim pode ampliar comparações irreais e afetar o bem-estar; a recomendação também merece atenção.',
      },
      {
        id: 'C',
        text: 'Todo conteúdo sobre aparência deve ser proibido para adolescentes.',
      },
      {
        id: 'D',
        text: 'Três vídeos já são pesquisa de campo suficiente: o algoritmo agora te conhece melhor que você.',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'Algoritmos de recomendação amplificam conteúdos que podem gerar espirais nocivas de comparação social, ansiedade e transtornos de autoimagem em jovens. As plataformas têm o dever de zelar pela saúde mental e bem-estar do público infantojuvenil.',
  },
  {
    id: 8,
    number: 8,
    topic: 'SHARENTING: CARINHO, CONTEÚDO OU OVERSHARING?',
    title: '8. “MAS É SÓ UMA FOTO” — TEMPORADA 12, EPISÓDIO 847',
    scenario:
      'Uma mãe posta fotos da filha de 12 anos desde bebê. Agora a menina diz: "Mãe, eu não quero mais que você poste." A mãe responde: "Mas eu sou sua mãe!" Quem ganha essa batalha?',
    options: [
      {
        id: 'A',
        text: 'A mãe automaticamente. Ser responsável legal inclui passe vitalício para postar qualquer foto.',
      },
      {
        id: 'B',
        text: 'A filha automaticamente: responsáveis nunca podem publicar nenhuma foto dos filhos.',
      },
      {
        id: 'C',
        text: 'É preciso considerar imagem, privacidade e participação da adolescente nas decisões sobre sua exposição.',
      },
      {
        id: 'D',
        text: 'Quem ganhar a enquete nos stories.',
      },
    ],
    correctAnswer: 'C',
    explanation:
      'Filhos são sujeitos de direitos e não propriedade dos pais. À medida que crescem e ganham discernimento, o direito à própria imagem, intimidade e privacidade deve ser respeitado pelos responsáveis legais.',
  },
  {
    id: 9,
    number: 9,
    topic: 'SHARENTING: CARINHO, CONTEÚDO OU OVERSHARING?',
    title: '9. DO ÁLBUM DE FAMÍLIA PRO OVERSHARING EM 3, 2, 1...',
    scenario:
      'Um pai publica aniversário, viagem e primeiro dia de aula - mas também crise de choro, castigo, consulta médica e "olha a vergonha que meu filho passou hoje". Em que momento acende o alerta?',
    options: [
      {
        id: 'A',
        text: 'Só quando ele começar a ganhar dinheiro.',
      },
      {
        id: 'B',
        text: 'Quando a exposição excessiva passa a atingir intimidade, imagem, dignidade ou segurança da criança.',
      },
      {
        id: 'C',
        text: 'Apenas quando a criança completar 13 anos.',
      },
      {
        id: 'D',
        text: 'Quando o post ganha “parte 2?” nos comentários. Antes disso, segue o conteúdo.',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'O "sharenting" (compartilhamento de vida dos filhos pelos pais) torna-se abusivo quando ultrapassa o afeto e passa a expor momentos vexatórios, íntimos ou de vulnerabilidade, violando o direito ao respeito e à dignidade garantidos pelo ECA.',
  },
  {
    id: 10,
    number: 10,
    topic: 'É CONTEÚDO OU É JOB?',
    title: '10. YOUTUBER MIRIM — “MAS ELA AMA GRAVAR!” E OUTROS ARGUMENTOS',
    scenario:
      'Nina, 11 anos, tem um canal enorme. Grava quatro horas por dia, seis dias por semana, tem contratos, publis e metas de postagem. Os pais dizem: "Mas ela AMA fazer vídeo!" Caso encerrado?',
    options: [
      {
        id: 'A',
        text: 'Sim. Se a atividade é divertida, o conceito de trabalho simplesmente desinstala.',
      },
      {
        id: 'B',
        text: 'Não. Gostar da atividade não afasta automaticamente proteções relacionadas ao trabalho infantil artístico e à exploração comercial.',
      },
      {
        id: 'C',
        text: 'Só vira trabalho quando aparece uma reunião que poderia ter sido um e-mail.',
      },
      {
        id: 'D',
        text: 'Abaixo de 100 mil seguidores é hobby; acima disso o algoritmo manda um “parabéns pelo novo emprego”.',
      },
    ],
    correctAnswer: 'B',
    explanation:
      'O trabalho infantil artístico exige autorização judicial expressa, preservação do rendimento escolar, descanso, acompanhamento psicológico e proteção financeira (poupança vinculada). O fato da criança gostar da produção de conteúdo não elide os deveres legais nem autoriza a exploração laboral disfarçada.',
  },
];
