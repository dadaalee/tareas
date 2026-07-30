# Tarea 2: Persistencia con Flask-SQLAlchemy

## Instalación

```powershell
pip install -r requirements.txt
```

## Ejecución

```powershell
python app.py
```

La aplicación estará disponible en `http://127.0.0.1:5000`.

La configuración `sqlite:///tareas.db` crea la base de datos en
`instance/tareas.db`.

## Insertar una tarea desde la consola

Abre Python desde esta carpeta:

```powershell
python
```

Luego ejecuta:

```python
from app import app, db, Tarea

with app.app_context():
    nueva_tarea = Tarea(titulo="Mi primera tarea en Base de Datos")
    db.session.add(nueva_tarea)
    db.session.commit()
```
