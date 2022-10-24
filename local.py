import logging
from http.server import HTTPServer
from datetime import datetime
from api.index import Handler, GarminService

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

def startServer(server_class=HTTPServer, handler_class=Handler, port=8008):
  server_address = ('', port)
  httpd = server_class(server_address, handler_class)

  logger.debug('Starting httpd on port %s', port)
  httpd.serve_forever()

# startServer()

def pullData():
  GarminService().pullData([
    datetime(2022, 10, 24).date().isoformat(),
  ])

# pullData()