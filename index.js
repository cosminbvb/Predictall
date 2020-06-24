const express = require('express');/*include modulul express memorand in variabila express obiectul asociat modulului(exportat de modul)*/
const fs = require("fs"); //default

const bodyParser = require('body-parser');
const formidable = require("formidable");
const crypto = require("crypto"); //default
const session = require("express-session");

var path = require('path');
var app = express(); //aici avem serverul

// pentru folosirea ejs-ului 
app.set('view engine', 'ejs');

console.log(__dirname);//calea catre radacina proiectului
app.use(express.static(path.join(__dirname, "resources")))
// din acest moment toate caile catre fisierele statice le scriem relativ la folderul resources

app.use(session({
	secret: "cheie_sesiune",
	resave: true,
	saveUninitialized: false
}))
app.use(bodyParser.json())

app.get("/logout", function(req, res) {
	req.session.destroy();
	res.redirect("/")
});

// cand se face o cerere get catre pagina de index 
app.get('/', function(req, res) {
	/*afiseaza(render) pagina folosind ejs (deoarece este setat ca view engine) */
    var numeUtiliz= req.session? (req.session.utilizator? req.session.utilizator.username : null) : null;
    res.render('html/index', {username: numeUtiliz });
});

app.get('/matches', function(req, res) {
	/*afiseaza(render) pagina folosind ejs (deoarece este setat ca view engine) */
	let fisiereMatches=fs.readFileSync("resources/json/prediction.json")
	fisierMatches=JSON.stringify(fisiereMatches);
	var numeUtiliz= req.session? (req.session.utilizator? req.session.utilizator.username : null) : null;
	var personalId= req.session? (req.session.utilizator? req.session.utilizator.id : null) : null;

	console.log(personalId)
	res.render('html/matches',{file:fisiereMatches,username: numeUtiliz,id:personalId});
});

app.get("/*", function(req,res){
	console.log(req.url);
	var numeUtiliz= req.session? (req.session.utilizator? req.session.utilizator.username : null) : null;
	res.render('html'+req.url, {username: numeUtiliz}, function(err,textRandare){
		//textRandare este rezultatul compilarii templateului ejs
		if(err){
			if(err.message.includes("Failed to lookup view"))
				return res.status(404).render("html/404",  {username: numeUtiliz});
			else
				throw err;
		}
		res.send(textRandare);

	});
})

app.post('/inreg', function(req, res) {
	console.log("test");
	var formular= new formidable.IncomingForm()
	  formular.parse(req, function(err, fields, files){
		  //files provine din inputurile de tip file <input type="file"....
		  //fields sunt toate celelalte
  
		  //in fields proprietatile sunt valorile atributelor name din inputurile din formular
		  // <input type="text" name="username" 
		  console.log(fields.username)
		  fisierUseri=fs.readFileSync("useri.json");
		  var parolaCriptata;
		  //al doilea argument e parola(cheia) de criptare
		  var algoritmCriptare=crypto.createCipher('aes-128-cbc',"parola_criptare");
		  parolaCriptata=algoritmCriptare.update(fields.parola, "utf-8", "hex");
		  parolaCriptata+=algoritmCriptare.final("hex");
		  obUseri= JSON.parse(fisierUseri);
		  var userNou= {
				id: obUseri.lastId,
				username: fields.username,
				nume: fields.nume,
				parola: parolaCriptata,
				favouriteTeam: fields.favouriteTeam,
				country:fields.country,
				dataInreg:new Date(),
				rol: "user"
		  }
		  obUseri.useri.push(userNou);
	  	  obUseri.lastId++;
		  var jsonNou=JSON.stringify(obUseri);
		  fs.writeFileSync("useri.json",jsonNou );
		  res.redirect("/")
	  })
  })

//in primul parametru din app.post avem valoarea din action-ul formularului
app.post('/login', function(req, res) {
	var formular= new formidable.IncomingForm()
	formular.parse(req, function(err, fields, files){
		fisierUseri=fs.readFileSync("useri.json");
		var parolaCriptata;
		//al doilea argument e parola(cheia) de criptare
		var algoritmCriptare=crypto.createCipher('aes-128-cbc',"parola_criptare");
		parolaCriptata=algoritmCriptare.update(fields.parola, "utf-8", "hex");
		parolaCriptata+=algoritmCriptare.final("hex");
		obUseri= JSON.parse(fisierUseri);
		//var personalId;
		var utiliz= obUseri.useri.find(function(u) {
			return u.username == fields.username && parolaCriptata == u.parola;
		});
		//find returneaza null daca nu gaseste elementul cu conditia data
		if(utiliz){
			//setez datele de sesiune
			req.session.utilizator=utiliz;
			console.log("Exista utilizatorul")
			//render primeste pe al doilea parametru date (organizate sub forma unui obiect) care pot fi transmise catre ejs (template) 
			res.render("html/index", {username: utiliz.username})
		}
		else{
			console.log("Username or password incorrect")
			res.render("html/index", {error: "Username or password incorrect"})
		}
	})
})
  
app.post('/submitPredictions', function(req,res){
	fisierPredictions=fs.readFileSync("resources/json/userPredictions.json");
	obUserPredictions= JSON.parse(fisierPredictions);
	obUserPredictions.userPredictions.push(req.body);
	obUserPredictions.lastId++;
	var jsonNou=JSON.stringify(obUserPredictions);
	fs.writeFileSync("resources/json/userPredictions.json",jsonNou);
	console.log(req.body);
})

app.listen(8080);
console.log('Aplicatia se va deschide pe portul 8080.');



