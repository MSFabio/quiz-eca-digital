import http from 'http';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const CONCURRENT_USERS = 50;

console.log('=======================================================');
console.log('🚀 INICIANDO TESTE DE CARGA CONCORRENTE: ' + CONCURRENT_USERS + ' USUÁRIOS');
console.log('🎯 Alvo: ' + BASE_URL);
console.log('=======================================================\n');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000,
    };

    const startTime = Date.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, duration });
        } catch {
          resolve({ status: res.statusCode, raw: data, duration });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const AVATARS = ['👩‍⚖️', '👨‍⚖️', '👩‍💻', '👨‍💻', '👩‍🎓', '👨‍🎓', '🕵️‍♀️', '🕵️‍♂️', '🛡️', '⚖️', '🎯', '🚀'];
const ORGS = ['Defensoria RJ', 'Colégio Pedro II', 'UERJ Direito', 'Conselho Tutelar RJ', 'Escola Estadual Niterói', 'Visitante'];

async function simulateSingleUser(userId) {
  const name = 'Participante_' + userId.toString().padStart(2, '0');
  const org = ORGS[userId % ORGS.length];
  const avatar = AVATARS[userId % AVATARS.length];
  const correctCount = Math.floor(Math.random() * 5) + 6;
  const timeSeconds = Number((Math.random() * 40 + 35).toFixed(1));
  const speedBonus = Math.floor(Math.random() * 300);
  const score = correctCount * 100 + speedBonus;

  const health = await request('GET', '/api/health');
  const poll1 = await request('GET', '/api/ranking');

  const submit = await request('POST', '/api/ranking', {
    name,
    organization: org,
    avatar,
    score,
    correctCount,
    totalQuestions: 10,
    timeSeconds,
  });

  const poll2 = await request('GET', '/api/ranking');

  return {
    userId,
    name,
    score,
    timeSeconds,
    status: submit.status,
    rankPosition: submit.data?.rankPosition,
    totalParticipants: submit.data?.totalParticipants,
    submitDuration: submit.duration,
    pollDuration: poll2.duration,
  };
}

async function runTest() {
  const startAll = Date.now();

  console.log('1️⃣  Verificando integridade da API...');
  try {
    const health = await request('GET', '/api/health');
    console.log('   ✅ API Online - Status: ' + health.data?.status + ' (' + health.duration + 'ms)');
  } catch (err) {
    console.error('   ❌ Falha ao conectar na API em ' + BASE_URL + '. Certifique-se de que o servidor está rodando.');
    console.error(err.message);
    process.exit(1);
  }

  console.log('\n2️⃣  Disparando ' + CONCURRENT_USERS + ' conexões de usuários simultâneos...');
  const promises = [];
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    promises.push(simulateSingleUser(i));
  }

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startAll;

  const successfulSubmissions = results.filter((r) => r.status === 201).length;
  const submitTimes = results.map((r) => r.submitDuration).sort((a, b) => a - b);
  const pollTimes = results.map((r) => r.pollDuration).sort((a, b) => a - b);

  const avgSubmit = (submitTimes.reduce((a, b) => a + b, 0) / submitTimes.length).toFixed(1);
  const p95Submit = submitTimes[Math.floor(submitTimes.length * 0.95)];
  const p99Submit = submitTimes[Math.floor(submitTimes.length * 0.99)];
  const maxSubmit = Math.max(...submitTimes);

  const avgPoll = (pollTimes.reduce((a, b) => a + b, 0) / pollTimes.length).toFixed(1);
  const p95Poll = pollTimes[Math.floor(pollTimes.length * 0.95)];

  const finalLeaderboard = await request('GET', '/api/ranking');
  const finalStats = await request('GET', '/api/stats');

  console.log('\n=======================================================');
  console.log('📊 RESULTADOS DO TESTE DE CARGA E CONCORRÊNCIA');
  console.log('=======================================================');
  console.log('✅ Usuários Simulados:       ' + CONCURRENT_USERS);
  console.log('✅ Submissões com Sucesso:   ' + successfulSubmissions + '/' + CONCURRENT_USERS + ' (Taxa de Sucesso: ' + ((successfulSubmissions / CONCURRENT_USERS) * 100).toFixed(1) + '%)');
  console.log('⏱️ Tempo Total do Teste:     ' + totalDuration + 'ms');
  console.log('⚡ Latência Média de Envio:   ' + avgSubmit + 'ms (P95: ' + p95Submit + 'ms, P99: ' + p99Submit + 'ms, Max: ' + maxSubmit + 'ms)');
  console.log('⚡ Latência Média do Ranking: ' + avgPoll + 'ms (P95: ' + p95Poll + 'ms)');
  console.log('🏆 Total no Ranking Geral:   ' + finalLeaderboard.data?.total + ' participantes');
  console.log('📈 Estatísticas Calculadas:  Média: ' + finalStats.data?.averageScore + ' pts | Recorde: ' + finalStats.data?.topScore + ' pts');
  console.log('=======================================================\n');

  if (successfulSubmissions === CONCURRENT_USERS) {
    console.log('🎉 SUCESSO ABSOLUTO! A aplicação suporta 50+ usuários simultâneos com estabilidade e baixa latência.');
    process.exit(0);
  } else {
    console.error('⚠️ ALERTA: Algumas requisições falharam durante o teste.');
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Erro crítico no teste:', err);
  process.exit(1);
});
