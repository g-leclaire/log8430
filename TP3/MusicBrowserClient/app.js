/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')


var router = express.Router();

var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'))
   .use(cookieParser());
   
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


console.log('Listening on 8888');
app.listen(8888);
