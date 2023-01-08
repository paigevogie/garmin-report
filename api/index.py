import logging
from http.server import BaseHTTPRequestHandler
from json import loads, dumps
from os import getenv
from datetime import datetime, timedelta, date as datetimedate
from dotenv import load_dotenv
from boto3 import Session
from pytz import timezone
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

  @staticmethod
  def sortData(data):
    return dict(sorted(
      data.items(),
      key = lambda x:datetime.strptime(x[0], '%Y-%m-%d'),
      reverse=True
    ))

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

  def _createSession(self):
    if self.session is None:
      self.session = Session(
        aws_access_key_id=getenv('S3_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=getenv('S3_AWS_SECRET_ACCESS_KEY'),
      )

  def _login(self):
    try:
      if self.api is None:
        self.api = Garmin(getenv('GARMIN_USERNAME'), getenv('GARMIN_PASSWORD'))
      self.api.login()
    except (
      GarminConnectConnectionError,
      GarminConnectAuthenticationError,
      GarminConnectTooManyRequestsError,
    ) as err:
      logger.error('Error on garmin login: %s', err)

  def getS3Data(self):
    self._createSession()
    s3 = self.session.resource('s3')
    obj = s3.Object(getenv('S3_BUCKET_NAME'), 'data.json')
    content = obj.get().get('Body').read().decode('utf-8')
    self.data = loads(content)
    return self.filterData(self.data)

  def pullData(self, dates):
    self.getS3Data()
    self._login()

    for date in dates:
      try:
        datetimedate.fromisoformat(date)
      except TypeError as err:
        logger.error("Invalid isoformat: %s", err)
      try:
        self.data[date] = self.api.get_stats_and_body(date)
      except (
        GarminConnectConnectionError,
        GarminConnectAuthenticationError,
        GarminConnectTooManyRequestsError
      ) as err:
        logger.error('Error pulling todays data from garmin: %s', err)

    self._createSession()
    s3 = self.session.resource('s3')
    obj = s3.Object('garminjsondata', 'data.json')
    self.data = self.sortData(self.data)
    obj.put(
      Body=(dumps(self.data))
    )
    return self.filterData(self.data)

class Handler(BaseHTTPRequestHandler):
  def do_UNAUTHORIZED(self):
    self.send_response(401)
    self.send_header('Content-type', 'text/html')
    self.end_headers()
    self.wfile.write('Unauthorized.'.encode())

  def do_SERVER_ERROR(self):
    self.send_response(500)
    self.send_header('Content-type', 'text/html')
    self.end_headers()
    self.wfile.write('Server Error'.encode())

  def do_GET(self):
    try:
      if self.headers.get('Authorization') != 'Bearer ' + getenv('API_KEY'):
        self.do_UNAUTHORIZED()
        return

      self.send_response(200)
      self.send_header('Content-type', 'application/json')
      self.end_headers()

      data = GarminService().getS3Data()
      self.wfile.write(dumps(data).encode())
    except Exception as err:
      logger.error('Error on do_GET: %s', err)
      self.do_SERVER_ERROR()

  def do_POST(self):
    try:
      if self.headers.get('Authorization') != 'Bearer ' + getenv('API_KEY'):
        self.do_UNAUTHORIZED()
        return

      self.send_response(200)
      self.send_header('Content-type', 'application/json')
      self.end_headers()

      i=0
      dates = []

      # pulling data for last three days
      while i < 3:
        date = (datetime.now(timezone('US/Central')).date() - timedelta(days=i)).isoformat()
        dates.append(date)
        i+=1

      data = GarminService().pullData(dates)
      self.wfile.write(dumps(data).encode())
    except Exception as err:
      logger.error('Error on do_POST: %s', err)
      self.do_SERVER_ERROR()