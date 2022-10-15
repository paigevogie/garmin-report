#!/usr/bin/env python3

import os
import logging
import datetime
from dotenv import load_dotenv
import json

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
    api = Garmin(os.getenv("GARMIN_USERNAME"), os.getenv("GARMIN_PASSWORD"))
    api.login()

    today = datetime.date.today()
    directory = 'public';
    
    data={}
    i=0
    while i < 7:
      date = (today - datetime.timedelta(days=i)).isoformat()
      data[date] = api.get_stats_and_body(date)
      i+=1

    with open(directory + '/garminData.json', 'w') as f:
      json.dump(data, f)

except (
        GarminConnectConnectionError,
        GarminConnectAuthenticationError,
        GarminConnectTooManyRequestsError,
    ) as err:
    logger.error("Error occurred during Garmin Connect communication: %s", err)