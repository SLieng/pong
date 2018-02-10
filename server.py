from flask import Flask, render_template, send_from_directory, request
import sys
import json

import numpy as np
import pandas as pd

from sqlalchemy import create_engine
import sqlalchemy
import pymysql

app = Flask(__name__)

globalData = []
numTrials = 0

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

    data = [{"timePassed": 0.5, "cmd": "right"}]
    jsonData = json.dumps(data)
    return jsonData

@app.route('/receiver', methods=['POST'])
def worker():
    global globalData
    global numTrials

    data = request.get_json()
    #print(data)
    
    columns = ["trial", "timePassed", "player1x", "player2x", "ballx", "bally"]
    df = pd.DataFrame(index=range(len(data)), columns=columns)
    totalCurrentRow = 0

    trial = numTrials+1
    for entry in data:
        row = np.array([trial, entry['timePassed'], entry['player1']['pos']['x'], entry['player2']['pos']['x'], entry['ball']['pos']['x'], entry['ball']['pos']['y']]) 
        #print(row)
        df.iloc[totalCurrentRow] = row
        totalCurrentRow += 1

    print(df)

    username = 'simon'
    password = 'password'

    engine = create_engine('mysql+pymysql://'+username+':'+password+'@localhost/pong')
    #conn = pymysql.connect(user='simon', password='password', host='localhost', db='pong')
    df.to_sql("base", engine, if_exists='append')

    numTrials = numTrials + 1
    return ""

if __name__ == "__main__":
    conn = pymysql.connect(user='simon', password='password', host='localhost', db='pong')
    with conn.cursor() as cursor:
        sql = "SELECT max(trial) FROM base"
        cursor.execute(sql)
        result = cursor.fetchone()[0]
        if result is None:
            numTrials = 0
        else:   
            numTrials = int(result)
    print(numTrials)

    conn.close()
    app.run()
