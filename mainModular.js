/*<===========>
 * Modules
 *<===========>
 */
var express = require('express');
var mysql = require('mysql');
var fs = require('fs')
var bodyparser = require("body-parser");
var mysql = require("mysql");
var string_similarity = require('string-similarity');

/*<=============>
 * Express setup
 * <============>
 */
var app = express();

app.use(express.static("."));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

/*<==============>
 * Host config
 *<==============>
 */
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var portNumber = 8080;
if (config.port != undefined){
    portNumber = config.port;
}


/*<=============>
 * Database setup
 *<=============>
 */
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

/*<==========>
 * Error handling functions
 *<==========>
 */
function handle_sql_error(err,sql,res){
    console.log('Error during query processing');
    console.log(err);
    console.log(sql);
    res.status("500");
    res.send("Internal Server Error: Bad sql query: " + sql);
}

function validate_query_string(str,res){
    if(str == undefined){
        res.status("400")
        res.send("bad request");
        return false;
    }
    return true;
}

function validate_query_number(str,res){
    if(str == undefined){
        res.status("400")
        res.send("bad request missing information");
        return false;
    }
    if(/^\d+$/.test(str) == false){
        res.status("400")
        res.send("bad request: not a number");
        return false;
    }
    return true;
}
/*<==============>
 * Util functions
 *<==============>
 */

function sort(str,results){
    for(var i=0;i<results.length;i++){
        results[i].similarity = string_similarity.compareTwoStrings(str,results[i].name);
    }
    results.sort(compare_results);
    results.forEach(function(v){ delete v.similarity });
    return results;
}
function compare_results(a,b){
    if(a.similarity > b.similarity){
        return -1;
    }
    if(b.similarity > a.similarity){
        return 1;
    }
    return 0;
}

/*<================>
 * Search Endpoints
 *<================>
 */

/*
 * Endpoint: recipes/search?ids=5?ids=3  NOTE no spaces
 * Response: [{"recipe":"Boilded Egg", "used":1, "needed":-1},{"recipe":"Chocolate Cake","used":1,"needed":-1}]
 */
app.get('/recipes/search', function(req,res){
    //Search for a recepie within the table recipe
    // input is a json of searchIDs numbers
    //  inputQuery is creating 
    var ids = req.param("ids");
    if(validate_query_string(ids,res) == false){
        return;
    }
    console.log(ids)
    var inputQuery = "";
    for (var i=0;i<ids.length;i++){
        if(validate_query_string(ids[i],res) == false){
            return;
        }
        inputQuery +=  mysql.escape(ids[i]) + " " + ",";
    }
    inputQuery = inputQuery.substring(0,inputQuery.length-1);

    var sql = "SELECT Recipe.name AS 'recipe', COUNT(Ingredient.name) AS 'used', 'Total Ingredients' - COUNT(Ingredient.name) AS 'needed' FROM Recipe JOIN RecipeIngredient ON Recipe.id = RecipeIngredient.recipe_id JOIN Ingredient ON Ingredient.id = RecipeIngredient.ingredient_id JOIN (SELECT (RecipeIngredient.recipe_id), COUNT(RecipeIngredient.ingredient_id) AS 'Total Ingredients'    FROM ingredient JOIN recipeingredient ON RecipeIngredient.ingredient_id = ingredient.id GROUP BY recipeingredient.recipe_id ORDER BY recipeingredient.recipe_id ASC) AS SUB_SELECT USING (recipe_id)WHERE Ingredient.id IN (  "+inputQuery+"  )GROUP BY Recipe.name ORDER BY COUNT(Ingredient.name) DESC , Recipe.name ASC";

    con.query(sql,
        function(err, rows, fields)	{
            if (err){
                handle_sql_error(err,sql,res);
                return;
            }
            if(rows.length == 0){
                res.send(rows);
                return;
            }
            var names = "(";
            console.log(rows);
            for(var i =0;i<rows.length;i++){
                names = names + mysql.escape(rows[i].recipe)  + " ,";
            }
            names = names.substring(0,names.length-1);
            names = names + ")";
            var sql2 = "SELECT recipe.id, recipe.name, recipeingredient.ingredient_id FROM recipe JOIN recipeingredient ON recipe.id = recipeingredient.recipe_id WHERE recipe.name IN " + names ;
            con.query(sql2,function(err,rows,fields){
                if (err){
                    handle_sql_error(err,sql2,res);
                    return;
                }
                result = {};
                for(var i=0;i<rows.length;i++){
                    if(result[rows[i].name] == undefined){
                        result[rows[i].name] = {
                            name: rows[i].name,
                            id : rows[i].id,
                            ingredients : [rows[i].ingredient_id]
                        };
                    }else{
                        result[rows[i].name].ingredients.push(rows[i].ingredient_id);
                    }
                }
                res.send(result);
            })
        });
});

/*
 * Endpoint: ingredients/search?str=rice+cake  NOTE no space use + instead.
 * Response: {"id":12,"name":"american cheese"} NOTE it's ordered based on the original string's similarity.
 */
app.get('/ingredients/search', function(req,res){
    var str = req.param("str");
    if(validate_query_string(str,res) == false){
        return;
    }
    if(str.length == 0){
        res.send([]);
        return;
    }
    mysql.escape(str);
    var sql = "SELECT * FROM ingredient WHERE name REGEXP '"+str+"'";
    console.log(sql);
    con.query(sql,
        function(err, rows, fields)	{
            if (err){
                handle_sql_error(err,sql,res);
                return;
            }
            rows = sort(str,rows);
            res.send(rows);
            return;
        });
});

/*<================>
 * Submission Endpoints
 *<================>
 */

app.post('/ingredients', function(req,res){
    console.log(req.body);
    var ingredient = req.body.name;
    var sql = "INSERT INTO ingredient (name) VALUES (" + mysql.escape(ingredient) + ")";
    con.query(sql,
        function(err, rows, fields)	{
            if (err){
                handle_sql_error(err,sql,res);
                return;
            }
            rows.name = req.body.name;
            res.send(rows)
            return;
        });
});

app.post('/recipes', function(req,res){
    // Assuming IDs are correct 
    var name = req.body.title;
    var desc = req.body.description;
    var instr = req.body.instructions;
    var ingredients = req.body['ingredients[]'];
    console.log(ingredients);
    var sql = "INSERT INTO recipe (name,description,instructions) VALUES (" + mysql.escape(name) + ","+mysql.escape(desc)+" , "+mysql.escape(instr)+")";
    con.query(sql,
        function(err, rows, fields)	{
            if (err){
                handle_sql_error(err,sql,res);
                return;
            }
            var id = rows.insertId;
            var sql2 ="INSERT INTO recipeingredient (recipe_id,ingredient_id) VALUES";
            for(var i=0;i<ingredients.length;i++){
                sql2 = sql2 + "(" + id+ ","+mysql.escape(ingredients[i])+"),"
            }
            sql2 = sql2.substring(0,sql2.length-1);
            con.query(sql2,function(err,rows,fields){
                if(err){
                    handle_sql_error(err,sql2,res);
                    return;
                }
                res.send(rows);
                return;
            });
        });
});

/*<================>
 * Get Endpoints
 *<================>
 */

/*
 * Endpoint: ingredients?id=5 
 * Response: {"id": 1 ,"name": "salt"}
 * Endpoint: recipe?name=salt
 * Response: {"id": 1 ,"name": "salt"}
 * Endpoint: ingredients 
 * Response: [{"id": 1,"name": "egg"},{ "id": 2,"name":"chocolate"}]
 */
app.get('/ingredients', function(req, res){
    var ID = req.param("id");
    console.log(ID);
    var sql = "SELECT id, name FROM ingredient WHERE id =" + mysql.escape(ID);
    if(ID == undefined){
        var name = req.param("name");
        if(name == undefined){
            sql = "SELECT id, name FROM ingredient";
        }else{
            if(validate_query_string(name,res) == false){
                return;
            }
           sql = "SELECT id, name FROM ingredient WHERE name = " + mysql.escape(name);
        }
    }else{
        if(validate_query_number(ID,res) == false){
            return;
        }
    }
    con.query(sql,
        function(err, rows, fields)	{
            if (err){
                handle_sql_error(err,sql,res);
                return;
            }
            if(rows.length == 0){
                res.status("404");
                res.send("Can't find ingredient for the id " + ID);
                return;
            }
            if(rows.length == 1){
                res.send(rows[0]);
                return;
            }
            res.send(rows);
            return;
        });
});

/*
 * Endpoint: recipes?id=5 
 * Response: {"id": 1 ,"name": "hamburger"}
 * Endpoint: recipe?name=hamburger
 * Response: {"id": 1 ,"name": "hamburger"}
 * Endpoint: recipes
 * Response: [{"id": 1,"name": "eggs"},{ "id": 2,"name":"cake"}]
 */
app.get('/recipes', function(req, res){
    var ID = req.param("id");
    var sql = "SELECT * FROM recipe WHERE id =" +mysql.escape(ID);
    if(ID == undefined){
        var name = req.param("name");
        if(namee == undefined){
            sql = "SELECT * FROM recipe";
            if(validate_query_string(name,res) == false){
                return;
            }
        }else{
            sql = "SELECT * FROM recipe WHERE name =" + mysql.escape(name);
        }
    }else{
        if(validate_query_number(ID,res) == false){
            return;
        }
    }
    con.query(sql,
        function(err, rows, fields)	{
            if (err){
                handle_sql_error(err,sql,res);
                return;
            }
            if (rows.length == 0)
            {
                res.status("404");
                res.send("Can't find recipe for the id " + ID);
                return;
            }
            if(rows.length == 1){
                res.send(rows[0]);
                return;
            }
            res.send(rows);
            return;
        });
});

app.listen(portNumber, function(){
    console.log('Server Running. . .')
});
