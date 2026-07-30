from flask import Flask, render_template


app = Flask(__name__)


@app.route("/")
def inicio():
    lista_tareas = [
        "Estudiar Flask",
        "Practicar Jinja2",
        "Completar la tarea 1",
    ]
    return render_template("index.html", tareas=lista_tareas)


@app.route("/acerca")
def acerca():
    return render_template("acerca.html")


if __name__ == "__main__":
    app.run(debug=True)
