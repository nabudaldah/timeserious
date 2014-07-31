var spawn    = require('child_process').spawn;
var express  = require('express');
var app      = express();
//var url      = require('url');
var mongo    = require('mongojs');
var io       = require('socket.io').listen(app);

// MongoDB connection details
var dbhost = 'localhost',
    dbport = 27017,
    dbname = 'tsdms';

// MongoDB connection
var db = mongo.connect("tsdms", ["timeseries", "models", "triggers"]);

// Express app
app.use(express.errorHandler());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/static'));

// Socket.io app
var io = require('socket.io').listen(app.listen(3000));
  
// REST api for app
app.get('/timeseries', function(req, res){
  var limit = parseInt(req.param("limit")) || 25;
  var skip  = parseInt(req.param("skip"))  || 0;
  var regex = new RegExp(req.param("q"), 'i');
  db.timeseries.find({ _id: regex }, { _id: 1 }).limit(limit).skip(skip, function(err, data){ res.send(data); });
});  

app.get('/timeseries/:id', function(req, res){
  db.timeseries.find({ _id: req.param("id") }, { _id: 1, data: { $slice: [0, 96]} }, function(err, data){
    if(err || !data) res.send(null);
    else res.send(data);
  });
});

app.get('/timeseries/:id/data', function(req, res){
  db.timeseries.findOne({ _id: req.param("id") }, { _id: 0, data: 1 }, function(err, timeseries){
    if(err || !timeseries) res.send(null);
    else res.send(timeseries.data.slice(0,96));
  });
});

app.get('/timeseries/:id/_id', function(req, res){
  db.timeseries.findOne({ _id: req.param("id") }, { _id: 1 }, function(err, data){
    if(err || !data) res.send(null);
    else res.send(data);
  });
});

app.put('/timeseries/:id', function(req, res){
  db.timeseries.update({ _id: req.param("id") }, { $set: req.body }, { upsert: true }, function(err, data){ res.send(200); } );
});

app.put('/models/:id', function(req, res){
  db.models.update({ _id: req.param("id") }, { $set: req.body }, { upsert: true });
  res.send(200);
});

app.get('/models/:id/compute', function(req, res){
  Rexecute('compute("' + req.param('id') + '")');
  res.send(200);
});

/* MongoDB triggers */ 
var mubsub = require('mubsub');
var client = mubsub('mongodb://' + dbhost + ':'+ dbport +'/' + dbname);
  client.on('error', console.error);
var channel = client.channel('triggers');  
  channel.on('error', console.error);
  
channel.subscribe('identifier', function(message) {
  console.log('mubsub message coming in: ' + message);
  io.sockets.emit('message', message );
});

/* R computational engine */
var Rprocess = spawn('c:/Program\ Files/R/R-3.0.3/bin/x64/R.exe', ['--vanilla', '--quiet', '--slave']);
  Rprocess.on('exit', function (code) {
    if(code) console.log('R child process died (' + code + ')');
    process.exit(code);
  });
  Rprocess.stdout.on('data', function (data) {
    var buf = new Buffer(data);
    console.log('R exec: ' + buf.toString('utf8'));
  });
  Rprocess.stderr.on('data', function (data) {
    var buf = new Buffer(data);
    console.log('R exec:' + buf.toString('utf8'));
  });

var Rexecute = function(line){
  console.log('R exec: ' + line);
  Rprocess.stdin.write(line + '\n');
};

Rexecute('source(\'C:/Users/nabi.abudaldah.GENGROUP/Documents/Node/TSDMS/R/tsdms.R\');');
Rexecute('source(\'C:/Users/nabi.abudaldah.GENGROUP/Documents/Node/TSDMS/R/compute.R\');');

app.get('/api/R', function(req, res){
  Rexecute('tsdms.setvector("nabi", "data", runif(96));');
  console.log('worker: ' + process.pid);
  Rexecute('Sys.getpid();');
  res.send('ok');
});

/* Javascript general purpose engine */   
var JSexecute = require('vm');
app.get('/api/JS', function(req, res){
  JSexecute.runInNewContext('count += 1; name = "kitty"', sandbox, 'myfile.vm');
});

var topcube = require('topcube');
topcube({ url: 'http://localhost:3000',
          name: 'Timeseries Data Management System',
          width: 1200, height: 600, ico: 'icon.ico' });
