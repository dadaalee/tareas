const express = require('express');
const { ready } = require('./database/database');
const clientesRoutes = require('./routes/clientes.routes');
const productosRoutes = require('./routes/productos.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const ventasRoutes = require('./routes/ventas.routes');

const app = express();

app.use(express.json());
app.use(async (req, res, next) => {
  await ready;
  next();
});

const informacionApi = (req, res) => {
  res.json({
    estado: 'activo',
    mensaje: 'API de pedidos y ventas',
    base_de_datos: 'SQLite',
    recursos: ['/api/clientes', '/api/productos', '/api/pedidos', '/api/ventas']
  });
};

app.get('/', informacionApi);
app.get('/api', informacionApi);

app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ventas', ventasRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'El cuerpo JSON no es válido' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
