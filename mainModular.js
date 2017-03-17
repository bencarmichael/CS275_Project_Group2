var express = require('express');
var mysql = require('mysql');
var fs = require('fs')
var app = express();
var bodyparser = require("body-parser");
var mysql = require("mysql");
app.use(express.static("."));
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

var con = mysql.createConnection({
	host: config.host,
	user: config.user,
	password: config.password,
	database: config.database
});

con.connect(function(err)	{
	if (err)	{
		console.log("Error connecting to database");
		console.log(err);
	}
	else	{
		console.log("Database successfully connected");
	}
});

app.post('/recipeSearch', function(req,res){
	//Search for a recepie within the table recipe
	// input is a json of searchIDs numbers
	//  inputQuery is creating 
	var inputQuery;
	for (var i = 0; i < Object.keys(req.body.recipeSearch.searchIDs); i++)
	{
		inputQuery += "\'" + req.body.searchIDs[i] + "\'";
		if (i != Object.keys(req.body.searchIDs) - 1) inputQuery += ",";
	}
	var sql ="SELECT" +
    "Recipe.name AS \'Recipe\'," +
    "COUNT(Ingredient.name) AS \'Ingredients Used\',"+
    "\`Total Ingredients\` - COUNT(Ingredient.name) AS \'Ingredients Needed\'"+
"FROM"+
    "Recipe"+
        "JOIN"+
    "RecipeIngredient ON Recipe.id = RecipeIngredient.recipe_id"+
        "JOIN"+
    "Ingredient ON Ingredient.id = RecipeIngredient.ingredient_id"+
        "JOIN"+
    "(SELECT "+
        "(RecipeIngredient.recipe_id),"+
        "COUNT(RecipeIngredient.ingredient_id) AS \'Total Ingredients\'"+
    "FROM"+
        "ingredient"+
    "JOIN recipeingredient ON RecipeIngredient.ingredient_id = ingredient.id"+
    "GROUP BY recipeingredient.recipe_id"+
    "ORDER BY recipeingredient.recipe_id ASC) AS SUB_SELECT USING (recipe_id)"+
"WHERE"+
    "Ingredient.id IN (" + inputQuery + ")"+
"GROUP BY Recipe.name" +
"ORDER BY COUNT(Ingredient.name) DESC , Recipe.name ASC"
	con.query(sql,
		function(err, rows, fields)	{
			if (err)
				console.log('Error during query processing');
			else
				console.log('Rows is  ', rows);
				res.send(rows);
		});
});

app.get('/ingredientSearch', function(req,res){
	var ingredient = req.query.ingredientSearch.searchString;
	var sql = "SELECT * FROM ingredient WHERE name LIKE \'%" + ingredient + "%\'";
	con.query(sql,
		function(err, rows, fields)	{
			if (err)
				console.log('Error during query processing');
			else
				console.log('Rows is  ', rows);
				res.send(rows);
		});
});

app.post('/ingredientSubmission', function(req,res){
	var ingredient = req.body.ingredientSubmission.name;
	var sql = "INSERT INTO ingredient (name) VALUES (\'" + ingredient + "\')";
	con.query(sql,
		function(err, rows, fields)	{
			if (err)
				console.log('Error during query processing');
			else
				console.log('Rows is  ', rows);
				res.send(rows);
		});
	res.send("OK");
});

app.post('/recipeSubmission', function(req,res){
	// Assuming IDs are correct 
	var name = req.body.recipeSubmission.name;
	var desc = req.body.recipeSubmission.description;
	var instr = req.body.recipeSubmission.instructions;
	var ingredients = req.body.recipeSubmission.ingredients;
	var sql = "INSERT INTO recipe (name) VALUES (\'" + ingredient + "\')";
	con.query(sql,
		function(err, rows, fields)	{
			if (err)
				console.log('Error during query processing');
			else
				console.log('Rows is  ', rows);
				res.send(rows);
		});
	res.send("200");
});

app.get('/FindIngredientByID', function(req, res){
	var ID = req.param("id");
	var sql = "SELECT id FROM ingredient WHERE id =" + ID;
	con.query(sql,
		function(err, rows, fields)	{
			if (err)
				console.log('Error during query processing');
			else
				console.log('Rows is  ', rows);
				if (Object.keys(rows).length == 0)
				{
					res.send("404");
				}
		});

});

portNumber = 8080;
if (config.port != 8080){
	portNumber = config.port;
}
app.listen(portNumber, function(){
	console.log('Server Running. . .')
});