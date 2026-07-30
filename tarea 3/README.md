# Tarea 3: API de ventas con Node.js

Backend REST desarrollado con Node.js, Express y SQLite. No incluye frontend.

## Requisitos

- Node.js 22.5 o superior.

## Instalación y ejecución

```powershell
npm install
npm run seed
npm start
```

La API estará disponible en `http://localhost:3000`.

## Estructura de datos

- `clientes`: `id_cliente`, `nombre`, `nit`, `fecha_nac`.
- `productos`: `id_producto`, `producto`, `precio_compra`, `precio_venta`,
  `stock`.
- `pedidos`: `id_pedido`, `id_producto`, `id_cliente`, `cantidad`.
- `ventas`: `id_venta`, `id_pedido`, `id_cliente`, `id_producto`, `fecha`,
  `cantidad`, `precio_unitario`, `total`, `descuento`.

La base se guarda en `data/ventas.db`.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| GET, POST | `/api/clientes` | Listar y crear clientes |
| GET, PUT, DELETE | `/api/clientes/:id` | Consultar, editar y eliminar |
| GET, POST | `/api/productos` | Listar y crear productos |
| GET, PUT, DELETE | `/api/productos/:id` | Consultar, editar y eliminar |
| GET, POST | `/api/pedidos` | Listar y crear pedidos |
| GET, DELETE | `/api/pedidos/:id` | Consultar o cancelar un pedido |
| GET, POST | `/api/ventas` | Listar y registrar ventas |
| GET | `/api/ventas/:id` | Consultar una venta |

## Control de stock

Al crear un pedido, la API inicia una transacción:

1. Comprueba que existan el cliente y el producto.
2. Verifica que `stock >= cantidad`.
3. Descuenta el stock de forma atómica.
4. Crea el pedido y confirma la transacción.

Si el stock es insuficiente responde `409 Conflict` y no modifica ningún dato.
Al cancelar un pedido que todavía no fue vendido, el stock se repone.

## Ejemplos

Crear un cliente:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/clientes `
  -ContentType "application/json" `
  -Body '{"nombre":"Juan Pérez","nit":"987654321","fecha_nac":"1998-04-10"}'
```

Crear un producto:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/productos `
  -ContentType "application/json" `
  -Body '{"producto":"Mouse","precio_compra":50,"precio_venta":80,"stock":10}'
```

Crear un pedido:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/pedidos `
  -ContentType "application/json" `
  -Body '{"id_producto":1,"id_cliente":1,"cantidad":2}'
```

Registrar la venta del pedido con un descuento porcentual:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/ventas `
  -ContentType "application/json" `
  -Body '{"id_pedido":1,"descuento":10}'
```

## Pruebas

```powershell
npm test
```
