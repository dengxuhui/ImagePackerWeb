// console.log(__filename);
// console.log(__dirname.split("\\"));
var http = require("http");
http.createServer((request,response)=>{
    response.writeHead(200,{'Content-Type':'text/plain'});
    response.end('Hello World\n');
}).listen(8080);

console.log("Server Running");