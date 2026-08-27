const BASE_URL = 'http://127.0.0.1:3000';

async function runResetTest() {
  console.log('🧪 TESTANDO COMPORTAMENTO DO RESET DA BASE DE DADOS (ZERAR TUDO)\n');

  // 1. Cadastrar 2 participantes
  console.log('1. Cadastrando 2 novos participantes...');
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Participante 1',
      email: 'part1@escola.com',
      password: 'senhaValida123',
      organization: 'Escola A',
      avatar: '👩‍🎓',
    }),
  });

  await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Participante 2',
      email: 'part2@escola.com',
      password: 'senhaValida123',
      organization: 'Escola B',
      avatar: '👨‍🎓',
    }),
  });

  // 2. Submeter pontuações
  console.log('2. Submetendo pontuações de jogo...');
  await fetch(`${BASE_URL}/api/ranking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Participante 1',
      organization: 'Escola A',
      avatar: '👩‍🎓',
      score: 800,
      correctCount: 7,
      totalQuestions: 10,
      timeSeconds: 50,
    }),
  });

  // 3. Checar antes do reset
  const beforeRes = await fetch(`${BASE_URL}/api/admin/dashboard`);
  const beforeData = await beforeRes.json();
  console.log('Estado ANTES do Reset:', {
    totalUsers: beforeData.totalUsers,
    totalMatches: beforeData.totalMatches,
  });

  // 4. Executar Reset Completo (Zerar Base)
  console.log('\n3. Executando Reset da Base (Zerar Base com clearUsers=true)...');
  const resetRes = await fetch(`${BASE_URL}/api/ranking?clearUsers=true`, {
    method: 'DELETE',
  });
  const resetData = await resetRes.json();
  console.log('Resposta do Reset:', resetData);

  // 5. Checar depois do reset
  const afterRes = await fetch(`${BASE_URL}/api/admin/dashboard`);
  const afterData = await afterRes.json();
  console.log('\nEstado DEPOIS do Reset:', {
    totalUsers: afterData.totalUsers,
    totalMatches: afterData.totalMatches,
    users: afterData.users.map((u) => ({ name: u.name, email: u.email, role: u.role })),
  });

  // Validações
  if (afterData.totalMatches !== 0) {
    throw new Error('Erro: O ranking não foi zerado!');
  }
  if (afterData.totalUsers !== 1 || afterData.users[0].email !== 'admin@defensoria.rj.def.br') {
    throw new Error('Erro: Usuários participantes não foram limpos ou o Administrador foi corrompido!');
  }

  console.log('\n✅ TESTE DE RESET APROVADO: Todos os participantes e pontuações foram removidos com sucesso, mantendo apenas a conta de Administrador DPRJ.');
}

runResetTest().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
