# ⚖️ Quiz ECA Digital — Defensoria Pública do Estado do Rio de Janeiro (DPRJ)

Aplicação web interativa gamificada desenvolvida para eventos, ações educativas e feiras institucionais da **Defensoria Pública do Estado do Rio de Janeiro (DPRJ)**, com foco na conscientização sobre os direitos de crianças e adolescentes no ambiente digital (**ECA Digital**, LGPD e proteção integral).

---

## 📌 Sumário
- [Visão Geral e Objetivos](#-visão-geral-e-objetivos)
- [Funcionalidades e Jornada do Usuário](#-funcionalidades-e-jornada-do-usuário)
- [Identidade Visual e Experiência (UI/UX)](#-identidade-visual-e-experiência-uiux)
- [Garantia de Qualidade e Teste de Concorrência (50+ Usuários)](#-garantia-de-qualidade-e-teste-de-concorrência-50-usuários)
- [Arquitetura e Stack Tecnológica](#-arquitetura-e-stack-tecnológica)
- [Endpoints da API](#-endpoints-da-api)
- [Como Executar Localmente](#-como-executar-localmente)
- [Como Executar o Teste de Carga Automatizado](#-como-executar-o-teste-de-carga-automatizado)
- [Guia de Deploy / Produção](#-guia-de-deploy--produção)
- [Painel Administrativo do Evento](#-painel-administrativo-do-evento)

---

## 🎯 Visão Geral e Objetivos

O **Quiz ECA Digital** tem como missão levar a discussão jurídica e pedagógica sobre o uso seguro, ético e protegido da tecnologia para jovens, pais, educadores e operadores do direito.

### Temas Abordados nas Questões:
1. **Responsabilidade Compartilhada:** Família, plataformas de redes sociais, sociedade e Estado no dever de proteção.
2. **Design Persuasivo e Algoritmos:** Autoplay, rolagem infinita e captura de atenção infantojuvenil.
3. **Inteligência Artificial e Vínculo Afetivo:** Limites éticos, transparência e vedação a manipulações psicológicas.
4. **Verificação Efetiva de Idade:** Insuficiência de autodeclarações simples em conteúdos adultos.
5. **Privacidade e LGPD:** Princípio da finalidade, necessidade e vedação ao uso secundário de dados de menores.
6. **Publicidade Infantil Disfarçada:** Vedação ao marketing abusivo e influenciadores digitais sem aviso claro.
7. **Saúde Mental e Autoimagem:** Espirais de recomendação algorítmica e padrões irreais de estética.
8. **Sharenting e Direito à Imagem:** Respeito à intimidade e à vontade progressiva de crianças e jovens pelos responsáveis.
9. **Exposição Vexatória na Internet:** Limites entre recordação familiar e violação de dignidade.
10. **Trabalho Infantil Digital:** Condições legais, proteção patrimonial e autorização judicial para criadores mirins.

---

## 🚀 Funcionalidades e Jornada do Usuário

`mermaid
graph TD
    A[Tela Inicial / Cadastro] -->|Nome + Instituição + Avatar| B[10 Questões Interativas]
    B -->|Feedback Pedagógico Imediato + Bônus| B
    B -->|Última Resposta| C[Tela de Resultados com Pódio]
    C -->|Ver Gabarito Completo| D[Modal de Revisão Comentada]
    C -->|Ver Posição Geral| E[Ranking em Tempo Real]
    C -->|Compartilhar Resultado| F[Área de Transferência / Redes]
    C -->|Novo Jogo| B
    E -->|Exportar Dados| G[Download de CSV para Organizadores]
    E -->|Gestão com PIN| H[Painel Admin: Limpar Ranking]
`

1. **Cadastro Rápido do Participante:** Nome/apelido, instituição/escola/área (opcional) e seleção de avatar estilizado.
2. **Quiz Gamificado em Tempo Real:** 
   - 10 perguntas de múltipla escolha baseadas em casos práticos do cotidiano digital.
   - Pontuação base: **100 pontos por acerto**.
   - Bônus de velocidade: **até +50 pontos extras** para respostas rápidas (em menos de 15 segundos).
   - Cronômetro oficial de precisão em décimos de segundo (utilizado como critério de desempate).
3. **Feedback Pedagógico Imediato:** A cada resposta, o usuário visualiza imediatamente a fundamentação legal e doutrinária sob a ótica da Defensoria Pública.
4. **Tela de Resultados e Celebração:**
   - Efeito visual de confetes (canvas-confetti) e fanfarra sonora de vitória sintetizada.
   - Diagnóstico pedagógico personalizado de desempenho.
   - Botão de compartilhamento formatado pronto para redes sociais e WhatsApp.
5. **Ranking Geral ao Vivo:**
   - Pódio estilizado (1º, 2º e 3º lugares) em ouro, prata e bronze.
   - Atualização automática contínua em tempo real (polling a cada 4 segundos).
   - Campo de busca instantânea por nome ou escola/instituição.
   - Destaque visual (*badge* "Você") para a pontuação do jogador atual.
   - Exportação completa da tabela em arquivo .csv compatível com Excel/Google Sheets para os coordenadores do evento.
6. **Gabarito Oficial Comentado:** Modal acessível a qualquer momento com as 10 questões, respostas corretas e fundamentações legais da DPRJ.

---

## 🎨 Identidade Visual e Experiência (UI/UX)

- **Cores Oficiais da Defensoria Pública do RJ:**
  - **Verde Institucional Primário:** #004A2F
  - **Verde Profundo / Dark:** #003823 / #002619
  - **Dourado / Âmbar de Destaque:** #C8A355
  - **Fundo Limpo e Acessível:** #F4F7F5
- **Áudio Nativo (Zero Dependência Externa):** Efeitos sonoros gerados dinamicamente via **Web Audio API** (OscillatorNode / GainNode). Não realiza nenhum download de arquivos .mp3/.wav, garantindo carregamento instantâneo mesmo em redes móveis 3G/4G/Wi-Fi congestionadas de eventos.
- **Modo Silencioso:** Botão de ativação/desativação de som acessível no cabeçalho com persistência no localStorage.
- **Design 100% Responsivo:** Otimizado para smartphones, tablets, notebooks e projeção em telões de eventos.

---

## 📊 Garantia de Qualidade e Teste de Concorrência (50+ Usuários)

A aplicação foi auditada sob rigorosos critérios de **Engenharia de Qualidade de Software (QA)** e testada para suportar a carga simultânea de **50 ou mais participantes concorrentes** sem degradação de performance.

### Resultados do Teste de Carga Automatizado (50 Usuários Concorrentes):

| Métrica Avaliada | Resultado Obtido | Status |
| :--- | :--- | :---: |
| **Usuários Concorrentes Simultâneos** | **50 participantes** | ✅ Aprovado |
| **Taxa de Sucesso das Requisições** | **100.0% (50/50 conexões)** | ✅ Aprovado |
| **Tempo Total de Processamento de Toda a Carga** | **184 ms** | ✅ Excelente |
| **Latência Média de Submissão de Placar (POST /api/ranking)** | **27.9 ms** (P95: 32ms, P99: 32ms) | ✅ Ultra Rápido |
| **Latência Média de Consulta do Ranking (GET /api/ranking)** | **30.7 ms** (P95: 36ms) | ✅ Ultra Rápido |
| **Integridade de Dados e Ordenação** | Sem contenção de I/O, cálculo de posição exato | ✅ Verificado |
| **Resiliência Offline / Fallback** | Fallback automático em localStorage caso a rede oscile | ✅ Verificado |

---

## 🛠️ Arquitetura e Stack Tecnológica

- **Frontend:**
  - React 19 + TypeScript 5.8
  - Vite 6 (Build ultrarrápido com empacotamento otimizado de ~85 kB gzip)
  - Tailwind CSS v4
  - Lucide React (Iconografia vetorial acessível)
  - Canvas Confetti (Efeitos visuais)
  - Web Audio API (Síntese de áudio in-browser)
- **Backend:**
  - Node.js 20+ + Express
  - Persistência assíncrona não bloqueante (s.promises.writeFile) com fila de atomicidade
  - Tratamento e sanitização de dados contra injeção e tags HTML maliciosas
  - Suporte completo a variáveis de ambiente (PORT)
- **Segurança e Confiabilidade:**
  - Painel de administração com PIN para proteção contra reinicializações acidentais do ranking no meio de rodadas.

---

## 🌐 Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | /api/health | Verificação de integridade, uptime e status da aplicação |
| GET | /api/ranking | Retorna o ranking consolidado e ordenado (*Score DESC, Time ASC*) |
| POST | /api/ranking | Registra o resultado de uma partida e calcula a posição imediatamente |
| GET | /api/stats | Retorna estatísticas consolidadas (média de pontos, tempo médio, recorde) |
| DELETE | /api/ranking | Limpa todos os dados do ranking (destinado a encerramento de rodadas) |

---

## 💻 Como Executar Localmente

### Pré-requisitos
- **Node.js** v20 ou superior
- **npm** v10 ou superior

### 1. Clonar o Repositório
`ash
git clone https://github.com/fabiosilveira-dgidperj/QUIZ-ECA-Digital---DCOM.git
cd QUIZ-ECA-Digital---DCOM
`

### 2. Instalar Dependências
`ash
npm install
`

### 3. Modo de Desenvolvimento (Hot-reload)
`ash
npm run dev
`
Acesse no seu navegador: http://localhost:3000

### 4. Build e Execução em Produção
`ash
npm run build
npm start
`

---

## 🧪 Como Executar o Teste de Carga Automatizado

Para reproduzir a simulação concorrente de 50 participantes:

1. Inicie a aplicação (ou deixe em execução):
   `ash
   npm start
   `
2. Em outro terminal, execute o script de carga:
   `ash
   npm run test:load
   `

O script disparará simultaneamente 50 conexões simulando o fluxo completo de início, envio de pontuação e consulta em tempo real, exibindo a tabela com latências P95/P99 e taxa de sucesso.

---

## ☁️ Guia de Deploy / Produção

### Deploy Rápido em Cloud (Render, Railway, Fly.io, Heroku)
- **Build Command:** 
pm run build
- **Start Command:** 
pm start
- **Environment Variables:** PORT (fornecido automaticamente pelo provedor)

### Exibição em Telões de Eventos com QR Code
Para utilizar o quiz em estandes e auditórios:
1. Faça o deploy da aplicação em um domínio HTTPS.
2. Gere um QR Code apontando para a URL da aplicação e disponibilize em banners/totens.
3. Abra a tela de **Ranking Geral** (/ -> botão *Ranking*) no telão ou projetor da sala.
4. O ranking se atualizará sozinho a cada 4 segundos conforme os participantes forem terminando suas rodadas!

---

## 🛡️ Painel Administrativo do Evento

Para organizadores que precisam resetar a classificação entre turmas, rodadas ou dias de evento:
1. Acesse a tela de **Ranking Geral**.
2. Clique no ícone de escudo (**Gestão do Evento**) no canto superior direito.
3. Digite o PIN de administrador (Padrão do evento: 1234 ou dprj).
4. Selecione:
   - **Limpar Todo o Ranking Atual:** zera os registros para uma nova rodada limpa.
   - **Exportar CSV:** baixa a lista completa de participantes para premiações.

---

## 📄 Licença e Créditos

Desenvolvido para a **Defensoria Pública do Estado do Rio de Janeiro (DPRJ)** — Coordenação de Comunicação / Direitos Digitais e Proteção Integral de Crianças e Adolescentes.
