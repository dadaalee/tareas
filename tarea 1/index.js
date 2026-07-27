const app = require('./src/app');
const { ready, databasePath } = require('./src/database/database');

const PORT = process.env.PORT || 3000;

const iniciar = async () => {
  await ready;
  const server = app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Endpoints disponibles en http://localhost:${PORT}/api`);
    console.log(`Base de datos SQLite: ${databasePath}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`El puerto ${PORT} ya está ocupado. Cierre el otro servidor o use otro puerto.`);
      process.exit(1);
    }
    throw error;
  });
};

iniciar().catch((error) => {
  console.error('No se pudo iniciar la base de datos:', error.message);
  process.exit(1);
});
