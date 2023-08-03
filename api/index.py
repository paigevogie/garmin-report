import logging
from http.server import BaseHTTPRequestHandler
from json import dumps
from os import getenv
from dotenv import load_dotenv
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