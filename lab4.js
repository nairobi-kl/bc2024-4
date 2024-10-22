const {Command} = require('commander');
const superagent = require('superagent');
const nodemon = require('nodemon');
const http = require('http')

const program = new Command();

program
  .option('-h, --host <host>', 'Server host')
  .option('-p, --port <port>', 'Server port')
  .option('-c, --cache <path>', 'Path to cache');

program.parse(process.argv);

const options = program.opts();

if (!options.host || !options.port || !options.cache){
    console.error('Input all arguments!!!!!');
    process.exit(1);
}

const server = http.createServer((req, res) => {
   res.statusCode = 200;
}
);

server.listen(port, host, () => {
    console.log(`Server running on http://${host},${port}`);
});
