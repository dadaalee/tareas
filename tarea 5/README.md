# Tarea 5: API de ventas con Sequelize ORM

La misma lógica de la Tarea 3, implementada con Node.js, Express,
Sequelize ORM y SQLite. Es exclusivamente backend.

## Instalación

```powershell
npm install
npm run seed
npm start
```

La API estará disponible en `http://localhost:3002`.

## Modelos Sequelize

- `Cliente`: `id_cliente`, `nombre`, `nit`, `fecha_nac`.
- `Producto`: `id_producto`, `producto`, `precio_compra`, `precio_venta`,
  `stock`.
- `Pedido`: `id_pedido`, `id_producto`, `id_cliente`, `cantidad`.
- `Venta`: `id_venta`, `id_pedido`, `id_cliente`, `id_producto`, `fecha`,
  `cantidad`, `precio_unitario`, `total`, `descuento`.

Las asociaciones se definen con `hasMany`, `hasOne` y `belongsTo`.
La base se guarda en `data/ventas-sequelize.db`.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| GET, POST | `/api/clientes` | Listar y crear clientes |
| GET, PUT, DELETE | `/api/clientes/:id` | Consultar, editar y eliminar |
| GET, POST | `/api/productos` | Listar y crear productos |
| GET, PUT, DELETE | `/api/productos/:id` | Consultar, editar y eliminar |
| GET, POST | `/api/pedidos` | Listar y crear pedidos |
| GET, DELETE | `/api/pedidos/:id` | Consultar o cancelar |
| GET, POST | `/api/ventas` | Listar y registrar ventas |
| GET | `/api/ventas/:id` | Consultar una venta |

## Regla de stock

`POST /api/pedidos` abre una transacción Sequelize, bloquea el producto,
verifica que `stock >= cantidad`, descuenta existencias y crea el pedido.
Si algo falla, Sequelize revierte toda la transacción.

Un pedido vendido no puede eliminarse. Al cancelar un pedido todavía no
vendido, las existencias se reponen.

## Ejemplos

Crear un pedido:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/pedidos `
  -ContentType "application/json" `
  -Body '{"id_producto":1,"id_cliente":1,"cantidad":2}'
```

Registrar una venta:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3002/api/ventas `
  -ContentType "application/json" `
  -Body '{"id_pedido":1,"descuento":10}'
```

## Pruebas

```powershell
npm test
```
