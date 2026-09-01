/**
 * Quiz ECA Digital — Defensoria Pública do Estado do Rio de Janeiro (DPRJ)
 * Backend Google Apps Script (GAS) com Google Sheets como Banco de Dados
 * Suporte a Autenticação (Login/Senha) e Painel Administrativo de Gestão
 */

const SHEET_RANKING = 'Ranking';
const SHEET_USERS = 'Usuarios';
const CACHE_KEY_RANKING = 'dprj_quiz_ranking_json';
const CACHE_TTL_SECONDS = 15;

/**
 * Função de Inicialização e Autorização
 * Selecione esta função no menu superior do Google Apps Script e clique em "Executar".
 * Isso solicitará as permissões necessárias e criará as abas automaticamente.
 */
function setup() {
  const ss = getSpreadsheet();
  const rankSheet = getOrCreateRankingSheet();
  const usersSheet = getOrCreateUsersSheet();
  Logger.log('=======================================================');
  Logger.log('✅ BASE DE DADOS DPRJ INICIALIZADA COM SUCESSO!');
  Logger.log('📄 Planilha Google: ' + ss.getUrl());
  Logger.log('📊 Aba Ranking: ' + rankSheet.getName());
  Logger.log('👥 Aba Usuários: ' + usersSheet.getName());
  Logger.log('=======================================================');
}

/**
 * Obtém ou cria a Planilha Google para armazenamento de dados
 */
function getSpreadsheet() {
  let ss = null;

  // 1. Tenta obter a planilha ativa (caso o script tenha sido aberto via Google Sheets > Extensões > Apps Script)
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }

  if (ss) {
    return ss;
  }

  // 2. Se for script standalone, verifica se já há um ID de planilha salvo nas propriedades
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('SPREADSHEET_ID');

  if (savedId) {
    try {
      ss = SpreadsheetApp.openById(savedId);
      if (ss) return ss;
    } catch (err) {
      Logger.log('Aviso: ID salvo inacessível, gerando nova planilha... ' + err.message);
      props.deleteProperty('SPREADSHEET_ID');
    }
  }

  // 3. Cria uma nova planilha no Google Drive do usuário
  try {
    ss = SpreadsheetApp.create('Quiz ECA Digital - Base de Dados DPRJ');
    props.setProperty('SPREADSHEET_ID', ss.getId());
    return ss;
  } catch (err) {
    throw new Error(
      'Erro de permissão ao acessar/criar a Planilha Google. ' +
      'Por favor, selecione a função "setup" no topo do editor e clique em "Executar" para autorizar o acesso ao Google Sheets/Drive. ' +
      'Detalhes: ' + err.message
    );
  }
}

function getOrCreateRankingSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_RANKING);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RANKING);
    sheet.appendRow([
      'ID', 'Nome', 'Organizacao', 'Avatar', 'Pontos',
      'Acertos', 'TotalQuestoes', 'TempoSegundos', 'UserID', 'DataCriacao'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#004A2F').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateUsersSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_USERS);
    sheet.appendRow([
      'ID', 'Nome', 'Email', 'SenhaHash', 'Salt',
      'Organizacao', 'Avatar', 'Role', 'DataCriacao'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#003823').setFontColor('#C8A355');
    sheet.setFrozenRows(1);

    // Inicializa Administrador padrão
    const salt = 'dprj_salt_' + Math.random().toString(36).substring(2, 8);
    const passHash = hashPasswordGAS('Dprj@2026', salt);
    sheet.appendRow([
      'usr-admin-01',
      'Coordenação DPRJ (Admin)',
      'admin@defensoria.rj.def.br',
      passHash,
      salt,
      'Defensoria Pública do Estado do RJ',
      '🛡️',
      'admin',
      new Date().toISOString()
    ]);
  }
  return sheet;
}

function hashPasswordGAS(password, salt) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + salt, Utilities.Charset.UTF_8);
  let hex = '';
  for (let i = 0; i < rawHash.length; i++) {
    const byte = (rawHash[i] + 256) % 256;
    const byteHex = byte.toString(16);
    hex += byteHex.length === 1 ? '0' + byteHex : byteHex;
  }
  return hex;
}

// ==========================================
// HTTP ENDPOINTS
// ==========================================

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'ranking') {
    return ContentService.createTextOutput(JSON.stringify(getRankings()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (e && e.parameter && e.parameter.action === 'health') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      service: 'Quiz ECA Digital - DPRJ (Google Apps Script)',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  let htmlOutput;
  try {
    htmlOutput = HtmlService.createHtmlOutputFromFile('index');
  } catch (err1) {
    try {
      htmlOutput = HtmlService.createHtmlOutputFromFile('index.html');
    } catch (err2) {
      return HtmlService.createHtmlOutput(
        '<div style="font-family:sans-serif;padding:24px;text-align:center;">' +
        '<h2 style="color:#004A2F;">Quiz ECA Digital — DPRJ</h2>' +
        '<p style="color:#c00;font-weight:bold;">Arquivo HTML não encontrado no projeto Google Apps Script.</p>' +
        '<p style="color:#555;font-size:14px;">Certifique-se de que o arquivo HTML no menu lateral esquerdo se chama <code>index</code>.</p>' +
        '</div>'
      );
    }
  }

  return htmlOutput
    .setTitle('Quiz ECA Digital — Defensoria Pública do RJ')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
}

function doPost(e) {
  try {
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    if (payload.action === 'login') {
      return ContentService.createTextOutput(JSON.stringify(loginUser(payload)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (payload.action === 'register') {
      return ContentService.createTextOutput(JSON.stringify(registerUser(payload)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (payload.action === 'reset') {
      return ContentService.createTextOutput(JSON.stringify(resetAllRankings(payload)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const result = submitGameScore(payload);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// AUTHENTICATION (LOGIN & REGISTRATION)
// ==========================================

function parsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (e) {
      return {};
    }
  }
  return payload;
}

function registerUser(payload) {
  const p = parsePayload(payload);
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getOrCreateUsersSheet();
    const data = sheet.getDataRange().getValues();

    const cleanEmail = String(p.email || '').trim().toLowerCase();
    const cleanName = String(p.name || '').replace(/<[^>]*>?/gm, '').trim().substring(0, 50);
    const cleanOrg = p.organization ? String(p.organization).replace(/<[^>]*>?/gm, '').trim().substring(0, 50) : 'Geral';
    const password = String(p.password || '');

    if (!cleanName || !cleanEmail || !password) {
      return { success: false, error: 'Nome, e-mail e senha são obrigatórios.' };
    }

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][2]).toLowerCase() === cleanEmail) {
        return { success: false, error: 'Este e-mail já está cadastrado. Faça login para continuar.' };
      }
    }

    const salt = 'dprj_' + Math.random().toString(36).substring(2, 10);
    const passHash = hashPasswordGAS(password, salt);
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const role = cleanEmail.includes('admin') ? 'admin' : 'participant';
    const createdAt = new Date().toISOString();

    sheet.appendRow([
      userId,
      cleanName,
      cleanEmail,
      passHash,
      salt,
      cleanOrg,
      p.avatar || '👩‍⚖️',
      role,
      createdAt
    ]);

    // Initialize in ranking sheet immediately
    if (role === 'participant') {
      const rankSheet = getOrCreateRankingSheet();
      rankSheet.appendRow([
        'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        cleanName,
        cleanOrg,
        p.avatar || '👩‍⚖️',
        0,
        0,
        10,
        0,
        userId,
        createdAt
      ]);
      CacheService.getScriptCache().remove(CACHE_KEY_RANKING);
    }

    return {
      success: true,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        organization: cleanOrg,
        avatar: p.avatar || '👩‍⚖️',
        role: role,
        createdAt: createdAt
      }
    };
  } finally {
    lock.releaseLock();
  }
}

function loginUser(payload) {
  const p = parsePayload(payload);
  const sheet = getOrCreateUsersSheet();
  const data = sheet.getDataRange().getValues();

  const cleanEmail = String(p.email || '').trim().toLowerCase();
  const candidatePass = String(p.password || '');

  if (!cleanEmail || !candidatePass) {
    return { success: false, error: 'E-mail e senha são obrigatórios.' };
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[2]).toLowerCase() === cleanEmail) {
      const storedHash = String(row[3]);
      const storedSalt = String(row[4]);
      const candidateHash = hashPasswordGAS(candidatePass, storedSalt);

      if (candidateHash === storedHash) {
        return {
          success: true,
          user: {
            id: String(row[0]),
            name: String(row[1]),
            email: String(row[2]),
            organization: String(row[5] || 'Geral'),
            avatar: String(row[6] || '👩‍⚖️'),
            role: String(row[7] || 'participant'),
            createdAt: String(row[8] || new Date().toISOString())
          }
        };
      }
    }
  }

  return { success: false, error: 'E-mail ou senha incorretos.' };
}

// ==========================================
// RANKINGS & GAME SCORES
// ==========================================

function getRankings() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_RANKING);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {}
  }

  const sheet = getOrCreateRankingSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    const emptyResult = { success: true, total: 0, rankings: [] };
    cache.put(CACHE_KEY_RANKING, JSON.stringify(emptyResult), CACHE_TTL_SECONDS);
    return emptyResult;
  }

  const rankings = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    rankings.push({
      id: String(row[0]),
      name: String(row[1] || 'Participante'),
      organization: String(row[2] || 'Geral'),
      avatar: String(row[3] || '⭐'),
      score: Number(row[4] || 0),
      correctCount: Number(row[5] || 0),
      totalQuestions: Number(row[6] || 10),
      timeSeconds: Number(row[7] || 0),
      userId: row[8] ? String(row[8]) : undefined,
      createdAt: String(row[9] || new Date().toISOString())
    });
  }

  rankings.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });

  const response = { success: true, total: rankings.length, rankings: rankings };
  cache.put(CACHE_KEY_RANKING, JSON.stringify(response), CACHE_TTL_SECONDS);
  return response;
}

function submitGameScore(payload) {
  const p = parsePayload(payload);
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const cleanName = String(p.name || 'Participante').replace(/<[^>]*>?/gm, '').trim().substring(0, 50);
    const cleanOrg = p.organization ? String(p.organization).replace(/<[^>]*>?/gm, '').trim().substring(0, 50) : 'Geral';
    const numScore = Math.max(0, Math.min(2000, Number(p.score) || 0));
    const numCorrect = Math.max(0, Math.min(10, Number(p.correctCount) || 0));
    const numTotal = Math.max(1, Math.min(50, Number(p.totalQuestions) || 10));
    const numTime = Math.max(0.1, Number(p.timeSeconds) || 0);
    const createdAt = new Date().toISOString();

    const sheet = getOrCreateRankingSheet();
    const data = sheet.getDataRange().getValues();
    let entryId = 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    let rowIndex = -1;

    if (p.userId) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][8]) === String(p.userId)) {
          rowIndex = i + 1;
          entryId = String(data[i][0]);
          break;
        }
      }
    }

    if (rowIndex !== -1) {
      sheet.getRange(rowIndex, 2, 1, 7).setValues([[
        cleanName,
        cleanOrg,
        p.avatar || '⭐',
        numScore,
        numCorrect,
        numTotal,
        numTime
      ]]);
    } else {
      sheet.appendRow([
        entryId,
        cleanName,
        cleanOrg,
        p.avatar || '⭐',
        numScore,
        numCorrect,
        numTotal,
        numTime,
        p.userId || '',
        createdAt
      ]);
    }

    CacheService.getScriptCache().remove(CACHE_KEY_RANKING);

    const rankingsResult = getRankings();
    const rankPosition = rankingsResult.rankings.findIndex((r) => r.id === entryId) + 1;

    return {
      success: true,
      entry: {
        id: entryId,
        name: cleanName,
        organization: cleanOrg,
        avatar: p.avatar || '⭐',
        score: numScore,
        correctCount: numCorrect,
        totalQuestions: numTotal,
        timeSeconds: numTime,
        createdAt: createdAt
      },
      rankPosition: rankPosition > 0 ? rankPosition : 1,
      totalParticipants: rankingsResult.total
    };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// ADMIN DASHBOARD & CONTROLS
// ==========================================

function getAdminDashboardData() {
  const rankingRes = getRankings();
  const rankings = rankingRes.rankings || [];

  const usersSheet = getOrCreateUsersSheet();
  const usersData = usersSheet.getDataRange().getValues();
  const users = [];

  for (let i = 1; i < usersData.length; i++) {
    const row = usersData[i];
    if (!row[0]) continue;
    users.push({
      id: String(row[0]),
      name: String(row[1]),
      email: String(row[2]),
      organization: String(row[5] || 'Geral'),
      avatar: String(row[6] || '👩‍⚖️'),
      role: String(row[7] || 'participant'),
      createdAt: String(row[8] || new Date().toISOString())
    });
  }

  const sumScore = rankings.reduce((acc, curr) => acc + curr.score, 0);
  const sumTime = rankings.reduce((acc, curr) => acc + curr.timeSeconds, 0);
  const topScore = rankings.length > 0 ? Math.max(...rankings.map((r) => r.score)) : 0;

  return {
    totalUsers: users.length,
    totalMatches: rankings.length,
    averageScore: rankings.length > 0 ? Math.round(sumScore / rankings.length) : 0,
    averageTimeSeconds: rankings.length > 0 ? Number((sumTime / rankings.length).toFixed(1)) : 0,
    topScore: topScore,
    rankings: rankings,
    users: users
  };
}

function deleteRankingEntry(id) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getOrCreateRankingSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        CacheService.getScriptCache().remove(CACHE_KEY_RANKING);
        return { success: true };
      }
    }
    return { success: false, error: 'Registro não encontrado.' };
  } finally {
    lock.releaseLock();
  }
}

function resetAllRankings(options) {
  const clearUsers = !options || options.clearUsers !== false;
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    // 1. Reset Ranking Sheet
    const rankSheet = getOrCreateRankingSheet();
    rankSheet.clearContents();
    rankSheet.appendRow([
      'ID', 'Nome', 'Organizacao', 'Avatar', 'Pontos',
      'Acertos', 'TotalQuestoes', 'TempoSegundos', 'UserID', 'DataCriacao'
    ]);
    rankSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#004A2F').setFontColor('#FFFFFF');
    rankSheet.setFrozenRows(1);

    // 2. Reset Users Sheet (Clear all participants, re-initialize default Admin)
    if (clearUsers) {
      const usersSheet = getOrCreateUsersSheet();
      usersSheet.clearContents();
      usersSheet.appendRow([
        'ID', 'Nome', 'Email', 'SenhaHash', 'Salt',
        'Organizacao', 'Avatar', 'Role', 'DataCriacao'
      ]);
      usersSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#003823').setFontColor('#C8A355');
      usersSheet.setFrozenRows(1);

      const salt = 'dprj_salt_' + Math.random().toString(36).substring(2, 8);
      const passHash = hashPasswordGAS('Dprj@2026', salt);
      usersSheet.appendRow([
        'usr-admin-01',
        'Coordenação DPRJ (Admin)',
        'admin@defensoria.rj.def.br',
        passHash,
        salt,
        'Defensoria Pública do Estado do RJ',
        '🛡️',
        'admin',
        new Date().toISOString()
      ]);
    }

    CacheService.getScriptCache().remove(CACHE_KEY_RANKING);
    return {
      success: true,
      message: clearUsers
        ? 'Toda a base de dados (ranking e contas de participantes) foi resetada com sucesso.'
        : 'Tabela de ranking limpa com sucesso.'
    };
  } finally {
    lock.releaseLock();
  }
}
