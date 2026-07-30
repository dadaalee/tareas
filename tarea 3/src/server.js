const { createApp } = require("./app");


const port = Number(process.env.PORT) || 3000;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Servidor disponible en http://localhost:${port}`);
});


function closeServer() {
  server.close(() => {
    app.locals.db.close();
    process.exit(0);
  });
}


process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
