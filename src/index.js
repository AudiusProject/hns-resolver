var dns = require('native-dns');
const publicIp = require('public-ip');
const express = require('express');


/* nameserver */

var dnsServer = dns.createServer();

// get our public IP to resolve DNS requests to ourself
var ip = null  // filled in in async block below

// resolve all DNS requests to ourself, regardless of what they ask for
dnsServer.on('request', function (request, response) {
  // console.log(request)
  response.answer.push(dns.A({
    name: request.question[0].name,
    address: ip,
    ttl: 1,
  }));
  response.send();
});

dnsServer.on('error', function (err, buff, req, res) {
  console.log(err.stack);
});

(async () => {
  ip = await publicIp.v4()
  console.log('Public IP: ', ip);
  console.log('DNS server listening at port 53...')
  dnsServer.serve(53);
})()

/* soft redirect webserver */

const app = express();
app.get('/', function(req, res) {
  console.log(req.headers.host)
  const chunks = req.headers.host.split('.')
  if (chunks.length == 2) {
    // assume chunk 0 is artist
    res.redirect(302, 'https://audius.co/' + chunks[0])
  } else {
    // time to nope out
    res.redirect(302, 'https://audius.co/feed')
  }
})

console.log('App server listening at port 80...')
app.listen(80)
