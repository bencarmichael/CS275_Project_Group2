var express = require('express');
var app = express();
app.use(express.static("."));
var con = mysql.createConnection({
	host:	'localhost',
	user: 'root',
	password:	'8907',
	database:	'cookbook'
});

con.connect(function(err)	{
	if (err)	{
		console.log("Error connecting to database");
	}
	else	{
		console.log("Databse successfully connected");
	}
});

app.post('/SearchRecipe', function(req,res){
	//Search for a recepie within the table recipe
	// input is a json of searchIDs numbers
	//  inputQuery is creating 
	var inputQuery;
	for (var i = 0; i < Object.keys(req.query.recipeSearch.searchIDs); i++)
	{
		inputQuery += "\'" + req.query.searchIDs[i] + "\'";
		if (i != Object.keys(req.query.searchIDs) - 1) inputQuery += ",";
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

app.get('/SearchIngredient', function(req,res){
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

app.post('/SubmitIngredient', function(req,res){
	var ingredient = req.query.ingredientSubmission.name;
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

app.post('/SubmitRecipe', function(req,res){
	// Assuming IDs are correct 
	var name = req.query.recipeSubmission.name;
	var desc = req.query.recipeSubmission.description;
	var instr = req.query.recipeSubmission.instructions;
	var ingredients = req.query.recipeSubmission.ingredients;
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
app.listen(8080, function(){
	console.log('Server Running. . .')
});