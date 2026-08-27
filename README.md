# ⚖️ Quiz ECA Digital — Defensoria Pública do Estado do Rio de Janeiro (DPRJ)

Aplicação web interativa gamificada desenvolvida para eventos, ações educativas e feiras institucionais da **Defensoria Pública do Estado do Rio de Janeiro (DPRJ)**, com foco na conscientização sobre os direitos de crianças e adolescentes no ambiente digital (**ECA Digital**, LGPD e proteção integral).

Suporta execução local (Node.js/Express), deploy em Cloud (Render/Railway/Vercel) e **Deploy como Web App no Google Apps Script (GAS)** com **Google Sheets** como banco de dados em tempo real.

---

## 📌 Sumário
- [Visão Geral e Objetivos](#-visão-geral-e-objetivos)
- [Funcionalidades e Jornada do Usuário](#-funcionalidades-e-jornada-do-usuário)
- [Identidade Visual e Experiência (UI/UX)](#-identidade-visual-e-experiência-uiux)
- [Garantia de Qualidade e Teste de Concorrência (50+ Usuários)](#-garantia-de-qualidade-e-teste-de-concorrência-50-usuários)
- [Arquitetura e Stack Tecnológica](#-arquitetura-e-stack-tecnológica)
- [Deploy no Google Apps Script (Guia Passo a Passo)](#-deploy-no-google-apps-script-guia-passo-a-passo)
- [Como Executar Localmente](#-como-executar-localmente)
- [Como Executar o Teste de Carga Automatizado](#-como-executar-o-teste-de-carga-automatizado)
- [Painel Administrativo e Reset da Base de Dados](#-painel-administrativo-e-reset-da-base-de-dados)

---

## 🎯 Visão Geral e Objetivos

O **Quiz ECA Digital** tem como missão levar a discussão jurídica e pedagógica sobre o uso seguro, ético e protegido da tecnologia para jovens, pais, educadores e operadores do direito.

### Temas Abordados nas 10 Questões:
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
    E -->|Zerar Base no Front| H[Modal de Reset com PIN: 1234]
`

---

## 📑 Deploy no Google Apps Script (Guia Passo a Passo)

A pasta [gas/](./gas) já contém todos os arquivos necessários para implantar o Quiz no **Google Apps Script**:
- [gas/Code.js](./gas/Code.js): Backend em Apps Script com doGet, getRankings, submitGameScore, esetAllRankings, LockService (concorrência) e CacheService.
- [gas/index.html](./gas/index.html): Bundle compilado único com todo o React 19, Tailwind CSS e áudio nativo inlined.
- [gas/appsscript.json](./gas/appsscript.json): Manifesto de configuração do Web App.

### 🛠️ Passo a Passo para Implantar no script.google.com:

1. **Acesse o Google Apps Script:**
   - Abra o link: **[https://script.google.com/home/?hl=pt-br](https://script.google.com/home/?hl=pt-br)**
   - Clique em **+ Novo projeto** (canto superior esquerdo) e renomeie o projeto para: Quiz ECA Digital - DPRJ.

2. **Inserir o Código Backend (Code.gs):**
   - Clique no arquivo Código.gs (ou Code.gs) que já vem criado.
   - Apague o conteúdo existente e cole todo o conteúdo do arquivo [gas/Code.js](./gas/Code.js).
   - Clique no ícone de **Salvar (Ctrl+S)**.

3. **Inserir o Frontend Compilado (index.html):**
   - No menu lateral esquerdo, clique no botão **+** (ao lado de *Arquivos*) ➔ escolha **HTML**.
   - Digite o nome: index (o Google adiciona automaticamente o .html).
   - Apague o conteúdo padrão e cole todo o conteúdo do arquivo [gas/index.html](./gas/index.html).
   - Clique no ícone de **Salvar (Ctrl+S)**.

4. **Publicar e Implantar o Web App:**
   - No canto superior direito, clique no botão azul **Implantar (Deploy)** ➔ **Nova implantação**.
   - Clique no ícone de engrenagem (⚙️) ao lado de *Selecionar tipo* ➔ selecione **App da Web**.
   - Preencha as opções:
     - **Descrição:** Quiz ECA Digital v1.0 - DPRJ
     - **Executar como:** Eu (seu e-mail)
     - **Quem pode acessar:** Qualquer pessoa *(imprescindível para permitir acesso público nos eventos sem login)*.
   - Clique em **Implantar**.
   - Na primeira vez, clique em **Autorizar acesso** (concedendo permissão para criar/ler a planilha de ranking do Google).
   - **Copie a URL do App da Web** fornecida!

5. **Pronto!** A aplicação estará no ar na nuvem do Google, gravando pontuações em tempo real em uma Planilha Google vinculada automaticamente, com cache e suporte a alta concorrência.

---

## 📊 Garantia de Qualidade e Teste de Concorrência (50+ Usuários)

| Métrica Avaliada | Resultado Obtido | Status |
| :--- | :--- | :---: |
| **Usuários Concorrentes Simultâneos** | **50 participantes** | ✅ Aprovado |
| **Taxa de Sucesso das Requisições** | **100.0% (50/50 conexões)** | ✅ Aprovado |
| **Tempo Total de Processamento** | **184 ms** | ✅ Ultra Rápido |
| **Latência Média de Envio de Placar** | **27.9 ms** (P95: 32ms) | ✅ Excelente |
| **Latência Média de Consulta do Ranking** | **30.7 ms** (P95: 36ms) | ✅ Excelente |
| **Prevenção de Conflitos / Race Conditions** | LockService (GAS) / Fila Assíncrona (Node) | ✅ Verificado |

---

## 💻 Como Executar Localmente

### Pré-requisitos
- **Node.js** v20 ou superior
- **npm** v10 ou superior

`ash
# 1. Instalar dependências
npm install

# 2. Modo Desenvolvimento
npm run dev

# 3. Gerar novo bundle para Google Apps Script
npm run build:gas

# 4. Executar Teste de Carga de 50 Usuários
npm run test:load
`

---

## 🛡️ Painel Administrativo e Reset da Base de Dados

- **Reset pelo Front-End:** Acesse a tela de **Ranking Geral** e clique no botão **"Zerar Base"** no topo da página.
- **PIN de Segurança:** Digite 1234 ou dprj para confirmar a limpeza.
- **Efeito:** Limpa simultaneamente o servidor (Planilha Google / Node.js) e o armazenamento local (localStorage), exibindo notificação visual de confirmação.
- **Exportação CSV:** Botão **"Exportar CSV"** na tela de ranking para download imediato da tabela formatada para Excel.

---

## 📄 Licença e Créditos

Desenvolvido para a **Defensoria Pública do Estado do Rio de Janeiro (DPRJ)** — Direitos Digitais e Proteção Integral de Crianças e Adolescentes.
