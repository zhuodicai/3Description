const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// var http = require('http'),
//     fs = require('fs');

// fs.readFile('./src/index.html', function (err, html) {
//   if (err) {
//       throw err; 
//   }       
//   http.createServer(function(request, response) {  
//       response.writeHeader(200);  
//       response.write(html);  
//       response.end();  
//   }).listen(3000);
// });
