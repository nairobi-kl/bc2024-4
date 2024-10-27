const {Command} = require('commander');
const superagent = require('superagent');
const nodemon = require('nodemon');
const http = require('http')
const fs = require('fs').promises
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Path to cache');

program.parse(process.argv);

const options = program.opts();

if (!options.host || !options.port || !options.cache){
    console.error('Input all arguments!!!!!');
    process.exit(1);
}

const {host, port, cache} = options;

const server = http.createServer(async (req, res) => {
  const urlParts = req.url ? req.url.split('/') : [];
  const statusCode = urlParts[1];

  if (!statusCode) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Status code is required\n');
      return;
  }

  const imagePath = `${cache}/${statusCode}.jpg`;

  if (req.method === 'GET') {
      try {
          const image = await fs.readFile(imagePath);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'image/jpeg');
          res.end(image);
      } catch (error) {
          console.error('Image not found in cache, trying to fetch from http.cat:', error);
          try {
              const response = await superagent.get(`https://http.cat/${statusCode}`);
              await fs.writeFile(imagePath, response.body);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'image/jpeg');
              res.end(response.body);
          } catch (fetchError) {
              console.error('Error fetching image from http.cat:', fetchError);
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Image not found\n');
          }
      }
  } else if (req.method === 'PUT') {
      let body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', async () => {
          const imageBuffer = Buffer.concat(body);
          try {
              await fs.writeFile(imagePath, imageBuffer);
              res.statusCode = 201;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Image saved successfully\n');
          } catch (error) {
              console.error('Error writing file:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Error saving image\n');
          }
      });
  } else if (req.method === 'DELETE') {
      try {
          await fs.unlink(imagePath);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Image deleted successfully\n');
      } catch (error) {
          console.error('Error deleting file:', error);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('Image not found\n');
      }
  } else {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Method not allowed\n');
  }
});

server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});
