from flask import Flask, render_template, send_from_directory, request
import sys

app = Flask(__name__)

@app.route("/")
def output():
    return render_template("index.html")

@app.route("/js/<path:path>")
def sendJS(path):
    print("WORLD")
    return send_from_directory("js", path)

@app.route('/receiver', methods=['POST'])
def worker():
    print("HELLO")
    data = request.get_json()
    result = ''

    for item in data:
        result += str(item['make']) + '\n'

    print(result)
    print("HELLO2", file=sys.stderr)

    return result

if __name__ == "__main__":
    app.run()
