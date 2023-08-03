import logging
from json import loads, dumps
from os import getenv
from datetime import datetime
from dotenv import load_dotenv
from boto3 import Session
# https://github.com/cyberjunky/python-garminconnect
from garminconnect import (
    Garmin,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
    GarminConnectAuthenticationError,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

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
      filteredData[date]['calendarDate'] = data[date]['calendarDate']
      filteredData[date]['moderateIntensityMinutes'] = data[date]['moderateIntensityMinutes']
      filteredData[date]['vigorousIntensityMinutes'] = data[date]['vigorousIntensityMinutes']
      filteredData[date]['activeKilocalories'] = data[date]['activeKilocalories']
      filteredData[date]['totalSteps'] = data[date]['totalSteps']
      filteredData[date]['weight'] = data[date]['weight']
    return filteredData

  def _createSession(self):
    if self.session is None:
      self.session = Session(
        aws_access_key_id=getenv('S3_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=getenv('S3_AWS_SECRET_ACCESS_KEY'),
      )

  def login(self):
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
    self.login()

    for date in dates:
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