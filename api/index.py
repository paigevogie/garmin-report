from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import logging
from dotenv import load_dotenv
import os
import boto3
from pytz import timezone
import datetime
import json
# https://github.com/cyberjunky/python-garminconnect
from garminconnect import (
    Garmin,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
    GarminConnectAuthenticationError,
)

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

load_dotenv()


class GarminService():
  def __init__(self):
    self.api = None
    self.session = None
    self.data = {}

  def createSession(self):
    if self.session is None:
      self.session = boto3.Session(
        aws_access_key_id=os.getenv('S3_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('S3_AWS_SECRET_ACCESS_KEY'),
      )
  
  @staticmethod
  def sortData(data):
    return dict(sorted(data.items(), key = lambda x:datetime.datetime.strptime(x[0], '%Y-%m-%d'), reverse=True))

  @staticmethod
  def filterData(data):
    filteredData = {}
    for date in data:
      filteredData[date] = {}
      filteredData[date]['moderateIntensityMinutes'] = data[date]['moderateIntensityMinutes']
      filteredData[date]['vigorousIntensityMinutes'] = data[date]['vigorousIntensityMinutes']
      filteredData[date]['activeKilocalories'] = data[date]['activeKilocalories']
      filteredData[date]['totalSteps'] = data[date]['totalSteps']
    return filteredData

  def getS3Data(self):
    self.createSession()
    s3 = self.session.resource('s3')
    object = s3.Object('garminjsondata', 'data.json')
    content = object.get().get('Body').read().decode('utf-8')
    self.data = json.loads(content)
    return self.filterData(self.data)
  
  def login(self):
    try:
      if self.api is None:
        self.api = Garmin(os.getenv('GARMIN_USERNAME'), os.getenv('GARMIN_PASSWORD'))
      self.api.login()
    except (
      GarminConnectConnectionError,
      GarminConnectAuthenticationError,
      GarminConnectTooManyRequestsError,
    ) as err:
      logger.error('Error on garmin login', err)

  def pullTodaysData(self):
    self.getS3Data()

    try:
      self.login()
      today = datetime.datetime.now(timezone('US/Central')).date().isoformat()
      self.data[today] = self.api.get_stats_and_body(today)
      yesterday = (datetime.datetime.now(timezone('US/Central')).date() - datetime.timedelta(days=1)).isoformat()
      self.data[yesterday] = self.api.get_stats_and_body(yesterday)
    except (
      GarminConnectConnectionError,
      GarminConnectAuthenticationError,
      GarminConnectTooManyRequestsError,
    ) as err:
      logger.error('Error pulling todays data from garmin', err)
    
    self.createSession()
    s3 = self.session.resource('s3')
    object = s3.Object('garminjsondata', 'data.json')
    self.data = self.sortData(self.data)
    object.put(
      Body=(json.dumps(self.data))
    )
    return self.filterData(self.data)


class Handler(BaseHTTPRequestHandler):
  def do_GET(self):
    self.send_response(200)
    self.send_header('Content-type', 'application/json')
    self.end_headers()

    data = GarminService().getS3Data()
    self.wfile.write(json.dumps(data).encode())

  def do_POST(self):
    self.send_response(200)
    self.send_header('Content-type', 'application/json')
    self.end_headers()

    data = GarminService().pullTodaysData()
    self.wfile.write(json.dumps(data).encode())

# def run(server_class=HTTPServer, handler_class=Handler, port=8008):
#   server_address = ('', port)
#   httpd = server_class(server_address, handler_class)
  
#   logger.debug('Starting httpd on port %d...' % port)
#   httpd.serve_forever()

# run() 