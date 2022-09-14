const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const requestListener = (req, res) => {
  
}

const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Access-Control-Allow-Origin', '*') // since only local allow any client

  const responseData = {
    gleitzeitkonto: '1h 20min',
  }

  const jsonContent = JSON.stringify(responseData);

  response.end(jsonContent);
});

server.listen(port, hostname, (error) => {
  if(!error) console.log(`Server running at http://${hostname}:${port}`);
  else console.log("Error Occured");
});