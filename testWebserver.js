const http = require('http');

const hostname = 'localhost';
const port = 3000;

const requestListener = (req, res) => {
  
}

const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Access-Control-Allow-Origin', '*') // since only local allow any client
  response.setHeader('Content-Type', 'application/json');

  if (request.url.toLocaleLowerCase() == '/downloadworkingtimes') {
    response.end(JSON.stringify('0'));
    return;
  }

  const responseData = {
    kontoString: '+1h 20min',
    kontoInMin: 80,
    lasteDate: '07.03.2023'
  }

  const jsonContent = JSON.stringify(responseData);

  response.end(jsonContent);
});

server.listen(port, hostname, (error) => {
  if(!error) console.log(`Server running at http://${hostname}:${port}`);
  else console.log("Error Occured");
});