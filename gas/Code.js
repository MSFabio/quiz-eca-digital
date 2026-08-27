/**
 * Quiz ECA Digital — Defensoria Pública do Estado do Rio de Janeiro (DPRJ)
 * Backend Google Apps Script (GAS) com Google Sheets como Banco de Dados
 */

const SHEET_NAME = 'Ranking';
const CACHE_KEY_RANKING = 'dprj_quiz_ranking_json';
const CACHE_TTL_SECONDS = 15; // 15 segundos de cache para suportar 50+ usuários simultâneos

/**
 * Obtém ou cria a aba de Ranking na Planilha Google
 */
function getOrCreateSheet() {
  let ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // Caso seja script standalone, usa o ID salvo nas propriedades do script se houver
    const propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (propId) {
      ss = SpreadsheetApp.openById(propId);
    } else {
      // Cria uma nova planilha automaticamente se não estiver vinculado
      ss = SpreadsheetApp.create('Quiz ECA Digital - Base de Dados DPRJ');
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
    }
  }

  if (!ss) {
    const propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (propId) {
      ss = SpreadsheetApp.openById(propId);
    } else {
      ss = SpreadsheetApp.create('Quiz ECA Digital - Base de Dados DPRJ');
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
    }
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'ID',
      'Nome',
      'Organizacao',
      'Avatar',
      'Pontos',
      'Acertos',
      'TotalQuestoes',
      'TempoSegundos',
      'DataCriacao'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#004A2F').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Ponto de entrada GET do Web App
 */
function doGet(e) {
  // Rota REST API para consulta via GET
  if (e && e.parameter && e.parameter.action === 'ranking') {
    const rankingData = getRankings();
    return ContentService.createTextOutput(JSON.stringify(rankingData))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Rota REST API para status/health
  if (e && e.parameter && e.parameter.action === 'health') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      service: 'Quiz ECA Digital - DPRJ (Google Apps Script)',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Servir a Aplicação Web (Single-page App)
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Quiz ECA Digital — Defensoria Pública do RJ')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Ponto de entrada POST do Web App (caso chamado via REST externo)
 */
function doPost(e) {
  try {
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    if (payload.action === 'reset') {
      const result = resetAllRankings();
      return ContentService.createTextOutput(JSON.stringify(result))
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

/**
 * Obter ranking consolidado com CacheService
 */
function getRankings() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_RANKING);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {}
  }

  const sheet = getOrCreateSheet();
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
      createdAt: String(row[8] || new Date().toISOString())
    });
  }

  // Ordenação: Maior pontuação DESC -> Menor tempo ASC
  rankings.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSeconds - b.timeSeconds;
  });

  const response = { success: true, total: rankings.length, rankings: rankings };
  cache.put(CACHE_KEY_RANKING, JSON.stringify(response), CACHE_TTL_SECONDS);
  return response;
}

/**
 * Submeter pontuação com LockService para suporte a 50+ usuários simultâneos
 */
function submitGameScore(payload) {
  const lock = LockService.getScriptLock();
  try {
    // Aguarda até 10 segundos para adquirir trava de escrita
    lock.waitLock(10000);

    const cleanName = String(payload.name || 'Participante').replace(/<[^>]*>?/gm, '').trim().substring(0, 40);
    const cleanOrg = payload.organization ? String(payload.organization).replace(/<[^>]*>?/gm, '').trim().substring(0, 50) : 'Geral';
    const numScore = Math.max(0, Math.min(2000, Number(payload.score) || 0));
    const numCorrect = Math.max(0, Math.min(10, Number(payload.correctCount) || 0));
    const numTotal = Math.max(1, Math.min(50, Number(payload.totalQuestions) || 10));
    const numTime = Math.max(0.1, Number(payload.timeSeconds) || 0);
    const entryId = 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const createdAt = new Date().toISOString();

    const sheet = getOrCreateSheet();
    sheet.appendRow([
      entryId,
      cleanName,
      cleanOrg,
      payload.avatar || '⭐',
      numScore,
      numCorrect,
      numTotal,
      numTime,
      createdAt
    ]);

    // Invalida cache
    CacheService.getScriptCache().remove(CACHE_KEY_RANKING);

    const rankingsResult = getRankings();
    const rankPosition = rankingsResult.rankings.findIndex((r) => r.id === entryId) + 1;

    return {
      success: true,
      entry: {
        id: entryId,
        name: cleanName,
        organization: cleanOrg,
        avatar: payload.avatar || '⭐',
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

/**
 * Resetar ranking e limpar a base de dados
 */
function resetAllRankings() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getOrCreateSheet();
    sheet.clearContents();
    sheet.appendRow([
      'ID',
      'Nome',
      'Organizacao',
      'Avatar',
      'Pontos',
      'Acertos',
      'TotalQuestoes',
      'TempoSegundos',
      'DataCriacao'
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#004A2F').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    CacheService.getScriptCache().remove(CACHE_KEY_RANKING);
    return { success: true, message: 'Base de dados resetada com sucesso.' };
  } finally {
    lock.releaseLock();
  }
}
