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
    console.error('Arguments!!!!!');
    process.exit(1);
}

const {host, port, cache} = options;

const server = http.createServer(async (req, res) => {
  const urlParts = req.url ? req.url.split('/') : [];
  const statusCode = urlParts[1];

  if (!statusCode) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Param!!!!!!!!!\n');
      return;
  }

  const imagePath = `${cache}/${statusCode}.jpg`;

 if (req.method === 'get') {
  const image = await fs.readFile(imagePath);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/jpeg');
  res.end(image);
 } else if (req.method === 'put') {
  let body = [];
  req.on('data', chunk => body.push (chunk));
  req.on('end', async () => {
      const image2 = Buffer.concat (body);
      try { 
        await fs.writeFile(imagePath, image2);
        res.statusCode = 201;
        res.setHeader('Content-Type','text/plain');
        res.end('Image saved successfully')
      } catch (error) {
        console.error('Error writing file:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error saving image');
      }
  }); 
} else if (req.metod === 'delete') {
  try {
    await fs.unlink(imagePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Image saved successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Image not found')
  }
 } else {
  res.statusCode = 405;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Method not allowed')
 }
});

server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});
