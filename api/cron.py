import logging
from http.server import BaseHTTPRequestHandler
from json import dumps
from os import getenv
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pytz import timezone
from garminservice import GarminService

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

load_dotenv()

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
      if self.headers.get('Authorization') != 'Bearer ' + getenv('CRON_SECRET'):
        logger.debug('Unauthorized: Headers %s does not match Bearer %s', self.headers.get('Authorization'), getenv('CRON_SECRET'))
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

      if data is None:
        self.do_SERVER_ERROR()
        return

      self.wfile.write(dumps(data).encode())
    except Exception as err:
      logger.error('Error on do_POST: %s', err)
      self.do_SERVER_ERROR()