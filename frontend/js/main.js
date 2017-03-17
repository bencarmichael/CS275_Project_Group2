var can_search = false;
var SEARCH_TIMEOUT = 500;
var SEARCH_INGREDIENT_URL = ""
var SUBMIT_INGREDIENT_URL = ""
var SEARCH_RECIPE_URL = ""
var ingredient_search_result;
var picked_ingredients;
var new_ingredient;
var new_ingredient_error;
var recipe_result;

$(document).ready(function(){
    //Find the elements
    search_form = $("#search-form");
    ingredient_search_result = $("#ingredient-search-result");
    picked_ingredients = $("#picked-ingredients");
    new_ingredient = $("#new-ingredient");
    new_ingredient_error = $("#new-ingredient-error");
    recipe_result = $("#recipe-result");

    //Add event handler Note: .on is for generated elements
    ingredient_search_result.on("click",".searched-ingredient",ingredient_clicked);
    picked_ingredients.on("click",".picked-ingredient",remove_ingredient)
    search_form.keyup(search_key_press);
    new_ingredient.parent().click(add_ingredient);
});

function search(){
    $.ajax({
        url:SEARCH_INGREDIENT_URL,
        type:"POST",
        data: {ingredientSearch:{searchString:search_form.val()}},
        success: function(data,textStatus,jqXHR){
            for(var key in data.ingredientResults){
                ingredient_search_result.prepend(
                    '<li server-id="'+ key +'" name="'+ data.ingredientResults[key] + '"class="list-group-item btn-look searched-ingredient">' + data.ingredientResults[key] + ' <span class="glyphicon glyphicon-plus"></span></li>'
                );
            }
        },
        error: function(jqXHR,textStatus,errorThrown){
            console.log('ERROR SEARCHING INGREDIENT : ' + errorThrown);
        }
    });
}

function search_key_press(){
    new_ingredient.html(search_form.val());
    if(can_search == false){
        can_search = true;
        search();
        setTimeout(function(){can_search=false},SEARCH_TIMEOUT);
    }
}

function ingredient_clicked(){
    var ingredient = $(this);
    var server_id = ingredient.attr('server-id');
    var name = ingredient.attr('name');
    picked_ingredients.append(
                   '\
                        <span server-id="'+server_id+'" name="'+name+'"class="label label-default picked-ingredient">'+name+' <span class="glyphicon glyphicon-remove"></span></span>\
                    '
);
    look_up_recipe();
}

function remove_ingredient(){
   $(this).remove();
}
     
function look_up_recipe(){
    var search_ids = []
    $(".picked-ingredient").each(function(){
        search_ids.push($(this).attr("server-id"));
    });
    $.ajax({
        url:SEARCH_RECIPE_URL,
        type:"POST",
        data:{recipeSearch:{searchIDs:search_ids}},
        success: function(data,textStatus,jqXHR){
            var recipes = []
            //First gather all the recipes up and calculate their completeness.
            for(var key in data.recipeResults){
                    var recipe = {};
                    recipe.name = data.recipeResults[key].name;
                    recipe.server_id = key;
                    recipe.description = data.recipeResults[key].description;
                    recipe.instructions = data.recipeResults[key].instructions;
                    var number_of_matched = 0;
                    var ingredients  = {};
                    for(var id_res in data.recipeResults[key].ingredientIDs){
                        ingredients[id_res].name = data.recipeResults[key].ingredientIDs[id_res];
                        ingredients[id_res].match = false;
                        for(var id_org in search_ids){
                            if(id_res == id_org){
                                number_of_matched++;
                                ingredients[id_res].match =true;
                            }                        
                        }
                    }
                    recipe.ingredients = ingredients;
                    recipe.number_of_matched = number_of_matched;
                    recipe.total_number_of_ingredients =  data.recipeResults[key].ingredientIDs.length;
                    recipe.completeness = ((number_of_matched/recipe.total_number_of_ingredients)*100).round();
                    recipes.push(recipe);
            }
            //Now sort them by completeness
            recipes.sort(function(a,b){
                if(a.completeness < b.completeness){
                    return -1
                }
                if(b.completeness < a.completeness){
                    return 1;
                }
                return 0;
            });
            //Now output them.
            for(var recipe in recipes){
                var ingredient_str = "";
                for(var ingredient in recipe.ingredients){
                    if(ingredients[ingredient].match){
                        ingredient_str = ingredient_str + '\
                            <span server-id="'+ingredient+'" class="label label-success padding-right">"'+recipe.ingredients[ingredient].name+'"</span>
                            '
                    }else{
                        ingredient_str = ingredient_str + '\
                            <span server-id="'+ingredient+'" class="label label-warning padding-right">"'+recipe.ingredients[ingredient].name+'"</span>
                            '
                    }
                }
                recipe_result.append(
                    '\
                    <div id="'+recipe.name+'" server-id="'+recipe.server_id+'" description="''"class="panel panel-default">\
                        <div class="panel-heading"><a href="#" class="panel-title">'+recipe.name+'<span class="badge pull-right">'+recipe.completeness+'%</span></a></div>\
                        <div class="panel-body">' + ingredient_str '\
                        </div>\
                    </div>\
                    '
                );
            }
        }
    });
}

function add_ingredient(){
    $.ajax({
        url:SUBMIT_INGREDIENT_URL,
        type:"POST",
        data:{ingredientSubmission:{name:new_ingredient.html()}},
        success: function(data,textStatus,jqXHR){
            if(data.status == "success"){
                var server_id = data.ingredientSubmissionResponse.id;
                var name = data.ingredientSubmissionResponse.name;
                picked_ingredients.append(
                    '\
                        <span server-id="'+server_id+'" name="'+name+'"class="label label-default picked-ingredient">'+name+' <span class="glyphicon glyphicon-remove"></span></span>\
                    '
                );
                look_up_recipe();
            }else{
                new_ingredient_error.toggleClass("hidden");
            }
        },
        error: function(jqXHR,textStatus,errorThrown){
            console.log('ERROR ADDING INGREDIENT : ' + errorThrown);
        }
    });
}
