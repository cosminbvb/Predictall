const express = require("express"); /*include modulul express memorand in variabila express obiectul asociat modulului(exportat de modul)*/
const fs = require("fs"); //default

const bodyParser = require("body-parser");
const formidable = require("formidable");
const crypto = require("crypto"); //default
const session = require("express-session");
const moment = require('moment');

var path = require("path");
var app = express(); //aici avem serverul

// pentru folosirea ejs-ului
app.set("view engine", "ejs");

console.log(__dirname); //calea catre radacina proiectului
app.use(express.static(path.join(__dirname, "resources")));
// din acest moment toate caile catre fisierele statice le scriem relativ la folderul resources

app.use(
  session({
    secret: "cheie_sesiune",
    resave: true,
    saveUninitialized: false,
  })
);
app.use(bodyParser.json());

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

// cand se face o cerere get catre pagina de index
app.get("/", function (req, res) {
  /*afiseaza(render) pagina folosind ejs (deoarece este setat ca view engine) */
  var numeUtiliz = req.session
    ? req.session.utilizator
      ? req.session.utilizator.username
      : null
    : null;
  res.render("html/index", { username: numeUtiliz });
});

app.get("/matches", function (req, res) {
  /*afiseaza(render) pagina folosind ejs (deoarece este setat ca view engine) */
  let fisiereMatches = fs.readFileSync("resources/json/fixtures.json");
  fisierMatches = JSON.stringify(fisiereMatches);
  var numeUtiliz = req.session
    ? req.session.utilizator
      ? req.session.utilizator.username
      : null
    : null;
  var personalId = req.session
    ? req.session.utilizator
      ? req.session.utilizator.id
      : null
    : null;
  res.render("html/matches", {
    file: fisiereMatches,
    username: numeUtiliz,
    id: personalId,
  });
});

app.get("/*", function (req, res) {
  var numeUtiliz = req.session
    ? req.session.utilizator
      ? req.session.utilizator.username
      : null
    : null;
  res.render("html" + req.url, { username: numeUtiliz }, function (
    err,
    textRandare
  ) {
    //textRandare este rezultatul compilarii templateului ejs
    if (err) {
      if (err.message.includes("Failed to lookup view"))
        return res.status(404).render("html/404", { username: numeUtiliz });
      else throw err;
    }
    res.send(textRandare);
  });
});

app.post("/inreg", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, fields, files) {
    //files provine din inputurile de tip file <input type="file"....
    //fields sunt toate celelalte
    //in fields proprietatile sunt valorile atributelor name din inputurile din formular
    fisierUseri = fs.readFileSync("resources/json/useri.json");
    var parolaCriptata;
    //al doilea argument e parola(cheia) de criptare
    var algoritmCriptare = crypto.createCipher(
      "aes-128-cbc",
      "parola_criptare"
    );
    parolaCriptata = algoritmCriptare.update(fields.parola, "utf-8", "hex");
    parolaCriptata += algoritmCriptare.final("hex");
    obUseri = JSON.parse(fisierUseri);

    var userNou = {
      id: obUseri.lastId,
      username: fields.username,
      nume: fields.nume,
      parola: parolaCriptata,
      favouriteTeam: fields.favouriteTeam,
      country: fields.country,
      score: 0,
      dataInreg: new Date(),
      numberLogins:0,
      lastLogin:0,
      lastIp:0,
      rol: "user",
    };

    obUseri.useri.push(userNou);
    obUseri.lastId++;
    var jsonNou = JSON.stringify(obUseri);
    fs.writeFileSync("resources/json/useri.json", jsonNou);
    res.redirect("/");
  });
});

//in primul parametru din app.post avem valoarea din action-ul formularului
var failedLogins={};
const maxFailedLoginsPerMinute=5;
const maxFailedLoginsPerDay=50;
app.post("/login", function (req, res) {
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, fields, files) {
    fisierUseri = fs.readFileSync("resources/json/useri.json");
    var parolaCriptata;
    //al doilea argument e parola(cheia) de criptare
    var algoritmCriptare = crypto.createCipher(
      "aes-128-cbc",
      "parola_criptare"
    );
    parolaCriptata = algoritmCriptare.update(fields.parola, "utf-8", "hex");
    parolaCriptata += algoritmCriptare.final("hex");
    obUseri = JSON.parse(fisierUseri);
    //var personalId;
    var utiliz = obUseri.useri.find(function (u) {
      return u.username == fields.username && parolaCriptata == u.parola;
    });
    //find returneaza null daca nu gaseste elementul cu conditia data

    // var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
    // req.connection.remoteAddress || 
    // req.socket.remoteAddress || 
    // req.connection.socket.remoteAddress

    var ip=req.ip;

    if (utiliz) {
      //setez datele de sesiune
      req.session.utilizator = utiliz;

      //render primeste pe al doilea parametru date (organizate sub forma unui obiect) care pot fi transmise catre ejs (template)
      res.render("html/index", { username: req.session.utilizator.username,
        lastLoginDay:moment(req.session.utilizator.lastLogin).format('D.MM.YYYY'),
        lastLoginTime:moment(req.session.utilizator.lastLogin).format('HH:mm:ss'),
        numberLogins:req.session.utilizator.numberLogins, 
        lastIp:req.session.utilizator.lastIp});

      //updatam lastLogin si numberLogins si le introducem in Json
      obUseri.useri[utiliz.id].lastLogin=new Date();
      obUseri.useri[utiliz.id].numberLogins++;
      obUseri.useri[utiliz.id].lastIp=ip;
      var jsonNou=JSON.stringify(obUseri);
      fs.writeFileSync("resources/json/useri.json",jsonNou);
      

    } else {
      res.render("html/index", { error: "Username or password incorrect" });
      //console.log(ip);
      if(failedLogins[ip]){
        failedLogins[ip]++;
      }
      else{
        failedLogins[ip]=1;
      }
      console.log(failedLogins);
    }
  });
});

app.post("/submitPredictions", function (req, res) {
  fisierPredictions = fs.readFileSync("resources/json/userPredictions.json");
  obUserPredictions = JSON.parse(fisierPredictions);
  obUserPredictions.userPredictions.push(req.body);
  obUserPredictions.lastId++;

  var jsonNou = JSON.stringify(obUserPredictions);
  fs.writeFileSync("resources/json/userPredictions.json", jsonNou);

  //console.log(`Updated entry: ${JSON.stringify(req.body)}`);
  res.send();
});

app.listen(8080);
console.log("Aplicatia se va deschide pe portul 8080.");
