//import dependencies
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const axios = require('axios');
const pino = require('express-pino-logger')();

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const AUTH = process.env.AUTH;

//const AUTH = "Bearer RvRO6h55szQAAAAAAAH2txU3jqcMgYHn-zdktTsTEKrHG39t0xdEjuUk-MxXr7Fy";

// define the Express app
const app = express();

// the database
const database = [];

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));

app.use(pino);
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Request-Method', 'GET, POST, DELETE, PUT, OPTIONS');
  res.header("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
  next();
});

// retrieve all folders
app.get('/', (req, res) => {	
  const db = database.map(d => ({
	  id:d.id,
	  saveTo:d.saveTo,
	  getFrom:d.getFrom,
	  noFolder:d.noFolder,
  }));
  res.send(db);
});

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-fm2wv99w.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: '7oOamgAhmy2W0XAq3wRnHgCmbagollKO',
  issuer: `https://dev-fm2wv99w.auth0.com/`,
  algorithms: ['RS256']
});

app.get('/protected',
  jwt({ secret: '8and8ga191ii1kp' }),
  function(req, res) {
    if (!req.user.admin) return res.sendStatus(401);
    res.sendStatus(200);
  });

app.post('/getFolders', (req, res) => 
{
	console.log('getFolders');
	let folderPath = req.query.getFrom;
	
	axios({
	  method: 'post',
	  url: 'https://api.dropboxapi.com/2/files/list_folder',
	  headers: {
		'Content-Type' : 'application/json', 
		'Authorization' : AUTH
	  },
	  data: {
			path: folderPath,
			recursive: false,
			include_media_info: false,
			include_deleted: false,
			include_has_explicit_shared_members: false,
			include_mounted_folders: true,
			include_non_downloadable_files: false
	  }
	})
	.then(function (r) {
		const files = JSON.stringify(r.data);		
		res.send(files);		
	})
	.catch(function (e) {		
		res.send(e);
	});
});

//update saveTo folder
app.post('/saveFolders', (req, res) => {
	console.log('saveFolders');	
		
	let newEntry = 
	{
		id:req.query.id,
		getFrom:
		{
			id:req.query.getFrom,	  
		},
		noFolder:req.query.noFolder,
		saveTo:req.query.saveTo
	}		
	
	axios({
	  method: 'post',
	  url: 'https://api.dropboxapi.com/2/files/get_metadata',
	  data: {
		path : newEntry.getFrom.id,
		include_media_info : false,
		include_deleted : false,
		include_has_explicit_shared_members : false 
	  },
	  headers: {
		'Content-Type' : 'application/json' , 
		'Authorization' : AUTH
	  }
	})
	.then(function (r) {		
		newEntry.getFrom.name = r.data.path_display.replace(r.data.name,'');
		database.push(newEntry);
		res.status(200).send(newEntry);
	})
	.catch(function (error) {
		res.send(error);
	});		
});

app.post('/batchMetaData', (req, res) => 
{	
	let idArr = '{"files":'+req.query.ids+',"actions":[]}';		
	idArr = JSON.parse(idArr);
	axios({
	  method: 'post',
	  url: 'https://api.dropboxapi.com/2/sharing/get_file_metadata/batch',	 
	  data:	idArr,
	  headers: 
	  {
		'Content-Type':'application/json',
		'Authorization' : AUTH
	  }
	})
	.then(function (r) 
	{			
		res.send(r.data).status(200);				
	})
	.catch(function (error) {
		res.send(error);
	});		
	
});

app.post('/moveFile', (req, res) => {			
	const from = req.query.fromFolder;
	//const from = request.query.fromFolder + name;
	const to = req.query.toFolder;
	//const to = '/' + request.query.toFolder + '/' + name;
	
	console.log(from);
	console.log(to);
	
	axios({
	  method: 'post',
	  url: 'https://api.dropboxapi.com/2/files/move_v2',
	  data: {
		from_path: from,
		to_path: to,
		allow_shared_folder: false,
		autorename: true,
		allow_ownership_transfer: false
	  },
	  headers: {
		'Content-Type' : 'application/json' , 
		'Authorization' : AUTH
	  }
	})
	.then(function (r) {	
		let data = r.data.metadata;	
		res.json(data);
		res.end();
	})
	.catch(function (error) {
		console.log(error);
	});		
});

app.listen(PORT, () =>
  console.log('Express server is running on localhost:3001')
);

// start the server
//app.listen(8081, () => {
//  console.log('listening on port 8081');
//});