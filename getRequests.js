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
		con.query('SELECT 
    Recipe.name AS \'Recipe\',
    COUNT(Ingredient.name) AS \'Ingredients Used\',
    `Total Ingredients` - COUNT(Ingredient.name) AS \'Ingredients Needed\'
FROM
    Recipe
        JOIN
    RecipeIngredient ON Recipe.id = RecipeIngredient.recipe_id
        JOIN
    Ingredient ON Ingredient.id = RecipeIngredient.ingredient_id
        JOIN
    (SELECT 
        (RecipeIngredient.recipe_id),
        COUNT(RecipeIngredient.ingredient_id) AS \'Total Ingredients\'
    FROM
        ingredient
    JOIN recipeingredient ON RecipeIngredient.ingredient_id = ingredient.id
    GROUP BY recipeingredient.recipe_id
    ORDER BY recipeingredient.recipe_id ASC) AS SUB_SELECT USING (recipe_id)
WHERE
    Ingredient.name IN (\'bread\' , \'mayonaise\')
GROUP BY Recipe.name
ORDER BY COUNT(Ingredient.name) DESC , Recipe.name ASC',
			function(err, rows)	{
				if (err)
					console.log('Error during query processing');
				else
					console.log('Recipe: ', rows);
					res.send(rows);
			});
});

app.get('/searchIngredient', function(req,res){
	var n = parseInt(req.query.input);
	con.query('SELECT * from ingredient WHERE ingredient.name= ${n}',
		function(err, rows)	{
			if (err)
				console.log('Error during query processing');
			else
				console.log(rows);
				res.send(rows);
		});
});

app.listen(8080, function(){
	console.log('Server Running. . .')
});




