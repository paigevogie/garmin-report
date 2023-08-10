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
        # Authorization header is getting stripped by Vercel so using x-authorization instead
        # https://stackoverflow.com/questions/70996838/vercel-production-branch-is-stripping-authorization-header-on-post-to-serverless
      if self.headers.get('x_authorization') != 'Bearer ' + getenv('API_KEY'):
        logger.debug('Unauthorized: Headers %s does not match Bearer %s', self.headers.get('x_authorization'), getenv('API_KEY'))
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