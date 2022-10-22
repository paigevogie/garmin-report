from http.server import HTTPServer
import logging
from api.index import Handler

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def run(server_class=HTTPServer, handler_class=Handler, port=8008):
  server_address = ('', port)
  httpd = server_class(server_address, handler_class)
  
  logger.debug('Starting httpd on port %d...' % port)
  httpd.serve_forever()

run() 