import { initDb } from '../src/db/index.js';

console.log('🚀 Iniciando script de migração e sementes do MySQL...');

initDb()
  .then(() => {
    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Falha na migração do MySQL:', err);
    process.exit(1);
  });
