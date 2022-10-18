#!/usr/bin/env python3

import os
import logging
import datetime
from dotenv import load_dotenv
import json
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
    try:
      data = json.load(open(fileName))
    except FileNotFoundError as err:
      print("File not found", fileName, err) 
      data = {}

    today = datetime.date.today()
    api = None
    
    def login():
      global api
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
      i=350
      while i < 400:
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

    # pullNewData()
    # pullOldData()
    updateJSON()

except (
        GarminConnectConnectionError,
        GarminConnectAuthenticationError,
        GarminConnectTooManyRequestsError,
    ) as err:
    print("Error occurred during Garmin Connect communication: %s", err)