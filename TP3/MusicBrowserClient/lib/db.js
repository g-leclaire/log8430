"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Playlists = new Schema({
  name: { type: String, unique: true }
}, { versionKey: false });


var PlaylistMusic = new Schema({
  playlist_name: String,
  img: String,
  player: String,
  title: String,
  artist: String,
  preview: String,
  href: String
}, { versionKey: false });

mongoose.model("Playlists", Playlists);
mongoose.model("PlaylistMusic", PlaylistMusic);

mongoose.Promise = global.Promise;

// TODO: Initialiser la connexion avec le "connect string" de votre base de données.
mongoose.connect("mongodb://log8430tp3:log8430@ds125146.mlab.com:25146/playlist", { useMongoClient: true });