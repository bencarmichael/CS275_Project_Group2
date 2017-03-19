var can_search = false;
var SEARCH_TIMEOUT = 100;
var SEARCH_INGREDIENT_URL = "/ingredients/search";
var SUBMIT_INGREDIENT_URL = "/ingredients";
var SEARCH_RECIPE_URL = "/recipes/search";
var FIND_INGREDIENT = "/ingredients";
var ingredient_search_result;
var picked_ingredients;
var new_ingredient;
var new_ingredient_error;
var recipe_result;
var recipe_modal;

$(document).ready(function(){
    //Find the elements
    search_form = $("#search-form");
    ingredient_search_result = $("#ingredient-search-result");
    picked_ingredients = $("#picked-ingredients");
    new_ingredient = $("#new-ingredient");
    new_ingredient_error = $("#new-ingredient-error");
    recipe_result = $("#recipe-result");
    recipe_modal = $("#recipe-modal");

    //Add event handler Note: .on is for generated elements
    ingredient_search_result.on("click",".searched-ingredient",ingredient_clicked);
    picked_ingredients.on("click",".picked-ingredient",remove_ingredient)
    search_form.keyup(search_key_press);
    new_ingredient.parent().click(add_ingredient);
});

function search(){
    new_ingredient_error.addClass("hidden");
    $.ajax({
        url:SEARCH_INGREDIENT_URL,
        type:"GET",
        data: {str:search_form.val()},
        success: function(data,textStatus,jqXHR){
            ingredient_search_result.empty();
            if(data.length == 0){
                new_ingredient.parent().removeClass("hidden");
                return;
            }
            for(var i=0;i<data.length;i++){
                ingredient_search_result.prepend(
                    '<li server-id="'+ data[i].id+'" name="'+ data[i].name + '"class="list-group-item btn-look searched-ingredient">' + data[i].name + ' <span class="glyphicon glyphicon-plus"></span></li>'
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
    new_ingredient.parent().addClass("hidden");
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
    search_form.val('');
    new_ingredient.html('');
    new_ingredient_error.addClass("hidden");
    new_ingredient.parent().addClass("hidden");
    picked_ingredients.append(
                   '\
                        <span server-id="'+server_id+'" name="'+name+'"class="label label-default picked-ingredient">'+name+' <span class="glyphicon glyphicon-remove"></span></span>\
                    '
);
    look_up_recipe();
}

function remove_ingredient(){
   $(this).remove();
   look_up_recipe();
}
     
function look_up_recipe(){
    var search_ids = []
    $(".picked-ingredient").each(function(){
        search_ids.push($(this).attr("server-id"));
    });
    recipe_result.empty();
    if(search_ids.length == 0){
        return;
    }
    $.ajax({
        url:SEARCH_RECIPE_URL,
        type:"GET",
        data:{ids:search_ids},
        success: function(data,textStatus,jqXHR){
            ingredient_search_result.empty();
            var recipes = []
            //First gather all the recipes up and calculate their completeness.
            for(var key in data){
                    var recipe = {};
                    recipe.name = data[key].name;
                    recipe.server_id = data[key].id;
                    var number_of_matched = 0;
                    var ingredients  = [];
                    for(var x=0;x<data[key].ingredients.length;x++){
                        ingredients.push({id:data[key].ingredients[x],match:false});
                        for(var y=0;y<search_ids.length;y++){
                            if(data[key].ingredients[x] == search_ids[y]){
                                number_of_matched++;
                                ingredients[x].match =true;
                                break;
                            }                        
                        }
                    }
                    recipe.ingredients = ingredients;
                    recipe.number_of_matched = number_of_matched;
                    recipe.total_number_of_ingredients =  ingredients.length;
                    console.log(recipe.total_number_of_ingredients);
                    console.log(recipe.number_of_matched);
                    recipe.completeness = Math.round((number_of_matched/recipe.total_number_of_ingredients)*100)
                    recipes.push(recipe);
            }
            //Now sort them by completeness
            recipes = recipes.sort(function(a,b){
                if(a.completeness > b.completeness){
                    return -1
                }
                if(b.completeness > a.completeness){
                    return 1;
                }
                return 0;
            });
            //Now output them.
            for(var i=0;i<recipes.length;i++){
                var recipe = recipes[i];
                var ingredient_str = "";
                for(var x=0;x<recipe.ingredients.length;x++){
                    var ingredient = recipe.ingredients[x];
                    if(ingredient.match){
                        ingredient_str = ingredient_str + '\
                            <span  server-id="'+ingredient.id+'" class="ingredient-'+ingredient.id+' label label-success padding-right"></span>\
                            '
                    }else{
                        ingredient_str = ingredient_str + '\
                            <span server-id="'+ingredient.id+'" class="ingredient-'+ingredient.id+' label label-warning padding-right"></span>\
                            '
                    }
                }
                console.log(ingredient_str);
                recipe_result.append(
                    '\
                    <div id="'+recipe.name+'" server-id="'+recipe.server_id+'" description="'+ recipe.description +'"class="panel panel-default">\
                        <div class="panel-heading"><a href="#" class="panel-title">'+recipe.name+'<span class="badge pull-right">'+recipe.completeness+'%</span></a></div>\
                        <div class="panel-body">' + ingredient_str + '\
                        </div>\
                    </div>\
                    '
                );
                for(var x=0;x<recipe.ingredients.length;x++){
                    $.ajax({
                        url:FIND_INGREDIENT,
                        type:"GET",
                        data:{id:recipe.ingredients[x].id},
                        success:function(data,textStatus,jqXHR){
                            $('.ingredient-'+data.id).html(data.name);
                        }
                    })
                }
            }
        }
    });
}

function add_ingredient(){
    new_ingredient.parent().addClass("hidden");
    search_form.val('');
    $.ajax({
        url:SUBMIT_INGREDIENT_URL,
        type:"POST",
        data:{name:new_ingredient.html()},
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
                new_ingredient_error.removeClass("hidden");
            }

        },
        error: function(jqXHR,textStatus,errorThrown){
            console.log('ERROR ADDING INGREDIENT : ' + errorThrown);
        }
    });
}
