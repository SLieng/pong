from flask import Flask, render_template, send_from_directory, request
import sys
import json

app = Flask(__name__)

@app.route("/")
def output():
    return render_template("index.html")

@app.route("/js/<path:path>")
def sendJS(path):
    print("WORLD")
    return send_from_directory("js", path)

@app.route('/transmit', methods=['GET'])
def transmit():
    data = [{"timePassed": 0.5, "cmd": "right"}]
    jsonData = json.dumps(data)
    return jsonData

@app.route('/receiver', methods=['POST'])
def worker():
    print("HELLO")
    data = request.get_json()
    print(data)
    result = ''

    for item in data:
        result += str(item['timePassed']) + '\n'

    #print(result)
    #print("HELLO2", file=sys.stderr)

    return result

if __name__ == "__main__":
    app.run()
