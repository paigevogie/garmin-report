#!/usr/bin/env python3

import os
import logging
import datetime
from dotenv import load_dotenv
import json
import sys    
sys.stdout.reconfigure(encoding='utf-8')

# https://github.com/cyberjunky/python-garminconnect
from garminconnect import (
    Garmin,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
    GarminConnectAuthenticationError,
)

# Configure debug logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load Garmin Connect credentials from environment variables
load_dotenv()

try:
    fileName = 'public/garminData.json'
    data = json.load(open(fileName))
    today = datetime.date.today()
    api = None
    
    def login():
      api = Garmin(os.getenv("GARMIN_USERNAME"), os.getenv("GARMIN_PASSWORD"))
      api.login()

    def pullNewData():
      loop=True
      i=0
      while loop:
        date = (today - datetime.timedelta(days=i)).isoformat()
        if not (date) in data:
          print(date, 'not in data')
          if api is None:
            login()
          data[date] = api.get_stats_and_body(date)
          i+=1
        else:
          print(date, 'already in data')
          # should update this to update data for last date added to data
          loop=False

    def pullOldData():
      i=28
      while i < 35:
        if api is None:
            login()
        date = (today - datetime.timedelta(days=i)).isoformat()
        data[date] = api.get_stats_and_body(date)
        i+=1

    def updateJSON():
      global data
      data = dict(sorted(data.items(), key=lambda x: datetime.datetime.strptime(x[0], '%Y-%m-%d'), reverse=True))
      with open(fileName, 'w') as f:
        json.dump(data, f)

    pullNewData()
    updateJSON()

except (
        GarminConnectConnectionError,
        GarminConnectAuthenticationError,
        GarminConnectTooManyRequestsError,
    ) as err:
    print("Error occurred during Garmin Connect communication: %s", err)