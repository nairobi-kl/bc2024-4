const {Command} = require('commander');
const superagent = require('superagent');
const nodemon = require('nodemon');
const http = require('http')

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

const server = http.createServer((req, res) => {
   res.statusCode = 200;
   res.setHeader('Content-Type', 'text/plain');
   res.end('Server is running\n');
}
);

server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});
