import numpy as np
import pandas as pd

from sqlalchemy import create_engine
import sqlalchemy
import pymysql

import matplotlib.pyplot as plt

from pandas.plotting import scatter_matrix

username = 'simon'
password = 'password'

engine = create_engine('mysql+pymysql://'+username+':'+password+'@localhost/pong')

#df = pd.read_sql("SELECT * from base", engine)
#scatter_matrix(df, alpha=0.005, figsize=(6, 6))
#plt.show()

fig, axes = plt.subplots(5, 5)

df = pd.read_sql("SELECT * from base", engine)

for i in range(0, 5):
    for j in range(0,5):
        dfTrial = df.loc[df['trial'] == i*5+j+1]
        dfTrial['size'] = 50/(0.01*dfTrial['index'] + 1)+5
        axes[i, j].scatter(dfTrial.ballx, dfTrial.bally, s=dfTrial['size'], alpha=0.5)
    #scatter_matrix(dfTrial, alpha=0.05, figsize=(6, 6))

plt.show()
