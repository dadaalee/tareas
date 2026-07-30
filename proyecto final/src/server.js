const { createApp } = require("./app");


async function main() {
  const port = Number(process.env.PORT) || 3003;
  const app = await createApp();

  const server = app.listen(port, () => {
    console.log("Modelos Sequelize sincronizados correctamente.");
    console.log(`Cine Los Patitos disponible en http://localhost:${port}`);
  });

  function closeServer() {
    server.close(async () => {
      await app.locals.sequelize.close();
      process.exit(0);
    });
  }

  process.on("SIGINT", closeServer);
  process.on("SIGTERM", closeServer);
}


main().catch((error) => {
  console.error("No se pudo iniciar el backend:", error);
  process.exit(1);
});
