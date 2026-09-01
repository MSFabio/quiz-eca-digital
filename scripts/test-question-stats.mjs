const BASE_URL = 'http://127.0.0.1:3000';

async function runTest() {
  console.log('🧪 TESTE AUTOMATIZADO: MENSURAÇÃO DE DESEMPENHO POR QUESTÃO E ALTERNATIVA');

  // Limpar dados antes de testar
  await fetch(`${BASE_URL}/api/admin/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPin: '1234', clearUsers: true }),
  });

  // Simular 10 participantes respondendo à Questão 1:
  // 2 marcaram A
  // 1 marcou B
  // 7 marcaram C (correta)
  // 0 marcaram D
  const distribution = ['A', 'A', 'B', 'C', 'C', 'C', 'C', 'C', 'C', 'C'];

  console.log('1. Cadastrando 10 participantes e enviando respostas da Questão 1...');
  for (let i = 0; i < distribution.length; i++) {
    const selectedOption = distribution[i];
    const isCorrect = selectedOption === 'C';
    const email = `aluno_${i + 1}_${Date.now()}@teste.com`;

    const reg = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Participante ${i + 1}`,
        email,
        password: 'senha12345',
        organization: 'DPRJ Evento',
        avatar: '👩‍🎓',
      }),
    });
    const regData = await reg.json();
    const userId = regData.user.id;

    // Enviar resposta da questão 1
    await fetch(`${BASE_URL}/api/ranking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Participante ${i + 1}`,
        organization: 'DPRJ Evento',
        avatar: '👩‍🎓',
        score: isCorrect ? 100 : 0,
        correctCount: isCorrect ? 1 : 0,
        totalQuestions: 10,
        timeSeconds: 5 + i,
        userId,
        answers: [
          {
            questionId: 1,
            selectedOption,
            isCorrect,
            timeSpentSeconds: 5,
            pointsEarned: isCorrect ? 100 : 0,
          },
        ],
      }),
    });
  }

  console.log('\n2. Consultando /api/ranking e validando estatísticas da Questão 1...');
  const res = await fetch(`${BASE_URL}/api/ranking`);
  const data = await res.json();

  if (!data.questionStats || data.questionStats.length === 0) {
    throw new Error('❌ questionStats ausente na resposta da API!');
  }

  const q1 = data.questionStats.find((q) => q.questionId === 1);
  if (!q1) throw new Error('❌ Questão 1 não encontrada em questionStats!');

  console.log('Dados recebidos da Questão 1:', {
    totalResponses: q1.totalResponses,
    accuracyPercentage: `${q1.accuracyPercentage}%`,
    options: q1.options.map((o) => `${o.optionId}: ${o.count} votos (${o.percentage}%)`),
  });

  const optA = q1.options.find((o) => o.optionId === 'A');
  const optB = q1.options.find((o) => o.optionId === 'B');
  const optC = q1.options.find((o) => o.optionId === 'C');
  const optD = q1.options.find((o) => o.optionId === 'D');

  if (q1.totalResponses !== 10) {
    throw new Error(`❌ Esperado total de 10 respostas, obtido: ${q1.totalResponses}`);
  }
  if (optA.count !== 2 || optA.percentage !== 20) {
    throw new Error(`❌ Alternativa A incorreta: esperado 2 (20%), obtido ${optA.count} (${optA.percentage}%)`);
  }
  if (optB.count !== 1 || optB.percentage !== 10) {
    throw new Error(`❌ Alternativa B incorreta: esperado 1 (10%), obtido ${optB.count} (${optB.percentage}%)`);
  }
  if (optC.count !== 7 || optC.percentage !== 70 || !optC.isCorrect) {
    throw new Error(`❌ Alternativa C incorreta: esperado 7 (70%) e isCorrect=true`);
  }
  if (optD.count !== 0 || optD.percentage !== 0) {
    throw new Error(`❌ Alternativa D incorreta: esperado 0 (0%), obtido ${optD.count} (${optD.percentage}%)`);
  }
  if (q1.accuracyPercentage !== 70) {
    throw new Error(`❌ Taxa de acerto incorreta: esperado 70%, obtido ${q1.accuracyPercentage}%`);
  }

  console.log('\n✅ SUCESSO ABSOLUTO: Todas as asserções estatísticas por questão foram confirmadas!');
  console.log('• Alternativa A: 20% dos participantes (2 votos)');
  console.log('• Alternativa B: 10% dos participantes (1 voto)');
  console.log('• Alternativa C: 70% dos participantes (7 votos) [Gabarito Oficial]');
  console.log('• Alternativa D: 0% dos participantes (0 votos)');
  console.log('\n🎉 TESTE CONCLUÍDO COM 100% DE APROVAÇÃO!');
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
