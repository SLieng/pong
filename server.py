from flask import Flask, render_template, send_from_directory, request
import sys
import json


import pandas as pd

app = Flask(__name__)


globalData = []

@app.route("/")
def output():
    return render_template("index.html")

@app.route("/js/<path:path>")
def sendJS(path):
    print("WORLD")
    return send_from_directory("js", path)

@app.route('/transmit', methods=['GET'])
def transmit():
    global globalData
    data = globalData

    #print(data)

    #data = [{"timePassed": 0.5, "cmd": "right"}]
    jsonData = json.dumps(data)
    return jsonData

@app.route('/receiver', methods=['POST'])
def worker():
    global globalData
    data = request.get_json()
    #print(data)

    globalData = []

    for entry in data:
        #newEntry = entry['player1'];
        newEntry = {}
        newEntry['cmd'] = entry['player1']['state']
        newEntry['timePassed'] = entry['timePassed']
        globalData.append(newEntry);

    #print(globalData)

    #for item in data:
    #    result += str(item['timePassed']) + '\n'

    #print(result)
    #print("HELLO2", file=sys.stderr)

    return ""

if __name__ == "__main__":
    app.run()
