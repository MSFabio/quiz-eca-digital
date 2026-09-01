const BASE_URL = 'http://127.0.0.1:3000';

async function testLiveRankingAndRegistration() {
  console.log('🧪 TESTANDO REGISTRO IMEDIATO NO RANKING E ATUALIZAÇÃO EM TEMPO REAL\n');

  const email = `aluno_${Date.now()}@escola.com`;

  // 1. Cadastrar novo aluno
  console.log(`1. Cadastrando participante (${email})...`);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aluno Teste Ao Vivo',
      email,
      password: 'senhaForte123',
      organization: 'Colégio Estadual DPRJ',
      avatar: '👩‍🎓',
    }),
  });
  const regData = await regRes.json();
  if (!regData.success || !regData.user) {
    throw new Error('Falha no cadastro do usuário: ' + JSON.stringify(regData));
  }
  const userId = regData.user.id;
  console.log('Usuário cadastrado com sucesso:', { id: userId, name: regData.user.name });

  // 2. Verificar se o participante JÁ APARECE no ranking com 0 pontos
  console.log('\n2. Verificando presença imediata na tabela de ranking...');
  const rankRes = await fetch(`${BASE_URL}/api/ranking`);
  const rankData = await rankRes.json();
  const entry = rankData.rankings.find((r) => r.userId === userId);

  if (!entry) {
    throw new Error('❌ ERRO: Participante recém-cadastrado não apareceu no ranking!');
  }
  console.log('✅ SUCESSO: Participante já consta no ranking imediatamente:', {
    name: entry.name,
    score: entry.score,
    organization: entry.organization,
  });

  // 3. Simular resposta de questão durante o jogo (atualização ao vivo)
  console.log('\n3. Simulando resposta de questão correta (+135 pts)...');
  const updateRes = await fetch(`${BASE_URL}/api/ranking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: entry.name,
      organization: entry.organization,
      avatar: entry.avatar,
      score: 135,
      correctCount: 1,
      totalQuestions: 10,
      timeSeconds: 4.2,
      userId,
    }),
  });
  const updateData = await updateRes.json();
  if (!updateData.success) {
    throw new Error('Erro ao atualizar pontuação ao vivo: ' + JSON.stringify(updateData));
  }

  // 4. Verificar se a entrada foi ATUALIZADA e não duplicada
  const rankRes2 = await fetch(`${BASE_URL}/api/ranking`);
  const rankData2 = await rankRes2.json();
  const userEntries = rankData2.rankings.filter((r) => r.userId === userId);

  if (userEntries.length !== 1) {
    throw new Error(`❌ ERRO: Esperado 1 registro para o usuário, mas encontrados ${userEntries.length}!`);
  }

  if (userEntries[0].score !== 135) {
    throw new Error(`❌ ERRO: Pontuação não foi atualizada para 135! Valor atual: ${userEntries[0].score}`);
  }

  console.log('✅ SUCESSO: Pontuação atualizada em tempo real sem duplicar registro no ranking:', {
    name: userEntries[0].name,
    score: userEntries[0].score,
    posicao: updateData.rankPosition,
  });

  console.log('\n🎉 TODOS OS TESTES DE PERSISTÊNCIA E RANKING FORAM APROVADOS!');
}

testLiveRankingAndRegistration().catch((err) => {
  console.error('❌ Falha:', err);
  process.exit(1);
});
