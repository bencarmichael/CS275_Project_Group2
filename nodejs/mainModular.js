var express = require('express');
var app = express();
app.use(express.static("."));
var con = mysql.createConnection({
	host:	'localhost',
	user: 'root',
	password:	'8907',
	database:	'PROJECT'
});

con.connect(function(err)	{
	if (err)	{
		console.log("Error connecting to database");
	}
	else	{
		console.log("Databse successfully connected");
	}
});

app.get('/searchRecipe', function(req,res){
	//Search for a recepie within the table recipe
		con.query('SELECT id, firstname, lastname, birth, major from students',
			function(err, rows, fields)	{
				if (err)
					console.log('Error during query processing');
				else
					console.log('Rows is  ', rows);
					res.send(rows);
			});
});

app.get('/searchIngredient', function(req,res){
	var n = parseInt(req.query.input);
	con.query('SELECT id, firstname, lastname, birth, major from students',
		function(err, rows, fields)	{
			if (err)
				console.log('Error during query processing');
			else
				console.log('Rows is  ', rows);
				res.send(rows);
		});
});

app.post('/submitIngredient', function(req,res){
	var n = parseInt(req.query.input);
	var output = calc.data.sum(n);
	console.log("\t\tSummation function . . .");
	res.send(output);
});

app.post('/submitRecipe', function(req,res){
	var output = weat.data.render();
	console.log("Rendering weather function. . .");
	res.send(output);
});

app.listen(8080, function(){
	console.log('Server Running. . .')
});