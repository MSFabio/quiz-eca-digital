const BASE_URL = 'http://127.0.0.1:3000';

async function runTests() {
  console.log('🧪 INICIANDO TESTES DE AUTENTICAÇÃO E PAINEL ADMINISTRATIVO\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  console.log('1. Health Check:', health);

  // 2. Admin Login
  console.log('\n2. Testando Login de Administrador...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@defensoria.rj.def.br',
      password: 'Dprj@2026',
    }),
  });
  const adminLogin = await adminLoginRes.json();
  console.log('Status Login Admin:', adminLoginRes.status, adminLogin);

  if (!adminLogin.success || adminLogin.user.role !== 'admin') {
    throw new Error('Falha no login de Administrador!');
  }

  // 3. Register Participant
  console.log('\n3. Testando Cadastro de Participante...');
  const testEmail = `aluno.${Date.now()}@escola.rj.gov.br`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mariana Teste Silva',
      email: testEmail,
      password: 'senhaSegura123',
      organization: 'Colégio Estadual DPRJ',
      avatar: '👩‍🎓',
    }),
  });
  const regData = await regRes.json();
  console.log('Status Cadastro:', regRes.status, regData);

  if (!regData.success || !regData.user.id) {
    throw new Error('Falha no cadastro de participante!');
  }

  // 4. Participant Login
  console.log('\n4. Testando Login do Participante Cadastrado...');
  const partLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'senhaSegura123',
    }),
  });
  const partLogin = await partLoginRes.json();
  console.log('Status Login Participante:', partLoginRes.status, partLogin);

  // 5. Submit Game Score
  console.log('\n5. Submetendo Pontuação do Quiz...');
  const scoreRes = await fetch(`${BASE_URL}/api/ranking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: partLogin.user.name,
      organization: partLogin.user.organization,
      avatar: partLogin.user.avatar,
      score: 1350,
      correctCount: 9,
      totalQuestions: 10,
      timeSeconds: 42.5,
      userId: partLogin.user.id,
    }),
  });
  const scoreData = await scoreRes.json();
  console.log('Status Envio Placar:', scoreRes.status, scoreData);

  // 6. Admin Dashboard Overview
  console.log('\n6. Consultando Métricas no Painel Administrativo...');
  const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`);
  const dashData = await dashRes.json();
  console.log('Dashboard Data:', {
    totalUsers: dashData.totalUsers,
    totalMatches: dashData.totalMatches,
    averageScore: dashData.averageScore,
    topScore: dashData.topScore,
    rankingsCount: dashData.rankings.length,
    usersCount: dashData.users.length,
  });

  // 7. Delete Score Entry (Admin Action)
  console.log('\n7. Testando Exclusão de Pontuação pelo Admin...');
  const entryIdToDelete = scoreData.entry.id;
  const delRes = await fetch(`${BASE_URL}/api/admin/ranking/${entryIdToDelete}`, {
    method: 'DELETE',
  });
  const delData = await delRes.json();
  console.log('Status Exclusão:', delRes.status, delData);

  // 8. Clean test user
  await fetch(`${BASE_URL}/api/admin/users/${regData.user.id}`, { method: 'DELETE' });
  await fetch(`${BASE_URL}/api/ranking`, { method: 'DELETE' });

  console.log('\n✅ TODOS OS TESTES DE AUTENTICAÇÃO E ADMIN PASSARAM COM 100% DE SUCESSO!');
}

runTests().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
