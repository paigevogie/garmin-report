from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import logging
import datetime
from dotenv import load_dotenv
import boto3
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

class handler(BaseHTTPRequestHandler):
  api = None
  today = datetime.date.today()
  data = {}

  def do_GET(self):
    self.send_response(200)
    self.send_header('Content-type', 'application/json')
    self.end_headers()

    def getFile():
      session = boto3.Session(
        aws_access_key_id=os.getenv('S3_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('S3_AWS_SECRET_ACCESS_KEY'),
      )
      s3 = session.resource('s3')
      object = s3.Object('garminjsondata', 'data.json')
      self.data = object.get().get('Body').read().decode('utf-8')
    
    def login():
      if self.api is None:
        self.api = Garmin(os.getenv('GARMIN_USERNAME'), os.getenv('GARMIN_PASSWORD'))
      self.api.login()

    def pullNewData():
      loop=True
      i=0
      while loop:
        date = (self.today - datetime.timedelta(days=i)).isoformat()
        if not (date) in self.data:
          print(date, 'not in self.data')
          login()
          self.data[date] = self.api.get_stats(date)
          i+=1
        else:
          print(date, 'already in data')
          # should update this to update data for last date added to data
          loop=False

    def pullOldData():
      i=0
      while i < 3:
        date = (self.today - datetime.timedelta(days=i)).isoformat()
        if not (date) in self.data:
          login()
          self.data[date] = self.api.get_stats_and_body(date)
          print('DATA PULLED', date, self.data[date])
        i+=1

    def pullTodaysData():
      date = self.today.isoformat()
      if not (date) in self.data:
        login()
        self.data[date] = self.api.get_stats_and_body(date)
        print('Todays data pulled:', date)
      else:
        print('Date already in self.data')

    # def updateJSON():
    #   print('Updating json')
    #   if not os.path.exists('tmp'):
    #     os.makedirs('tmp')
    #   self.data = dict(sorted(self.data.items(), key=lambda x: datetime.datetime.strptime(x[0], '%Y-%m-%d'), reverse=True))
    #   with open(self.filePath, 'w') as f:
    #     json.dump(self.data, f)
    #   print('Json updated!')

    try: 
      getFile()
      # pullNewData()
      # pullOldData()
      # pullTodaysData()
      # updateJSON()
    except (
        GarminConnectConnectionError,
        GarminConnectAuthenticationError,
        GarminConnectTooManyRequestsError,
    ) as err:
      print('Error occurred during Garmin Connect communication:', err)

    self.wfile.write(json.dumps(self.data).encode())

# def run(server_class=HTTPServer, handler_class=handler, port=8008):
#   server_address = ('', port)
#   httpd = server_class(server_address, handler_class)
  
#   print('Starting httpd on port %d...' % port)
#   httpd.serve_forever()

# run() 