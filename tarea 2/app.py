from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

# Configuración de la base de datos SQLite.
# Flask guarda las rutas SQLite relativas dentro de la carpeta "instance".
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tareas.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class Tarea(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    completa = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Tarea {self.id}>"


with app.app_context():
    db.create_all()


@app.route("/")
def inicio():
    lista_tareas = Tarea.query.all()
    return render_template("index.html", tareas=lista_tareas)


@app.route("/acerca")
def acerca():
    return render_template("acerca.html")


if __name__ == "__main__":
    app.run(debug=True)
