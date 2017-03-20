var can_search = false;
var SEARCH_TIMEOUT = 300;
var SEARCH_INGREDIENT_URL = "/ingredients/search";
var SUBMIT_INGREDIENT_URL = "/ingredients";
var SEARCH_RECIPE_URL = "/recipes/search";
var FIND_INGREDIENT = "/ingredients";
var FIND_RECIPE = "/recipes";
var ingredient_search_result;
var picked_ingredients;
var new_ingredient_error;
var recipe_result;
var recipe_modal;
var modal_recipe_description;
var modal_recipe_instructions;
var modal_recipe_tile;

var search_result_loader;
var search_current;
var add_new;
var new_ingredient_mode = false;


$(document).ready(function(){
    //Find the elements
    search_form = $("#search-form");
    ingredient_search_result = $("#ingredient-search-result");
    picked_ingredients = $("#picked-ingredients");
    new_ingredient_error = $("#new-ingredient-error");
    recipe_result = $("#recipe-result");
    recipe_modal = $("#recipe-modal");
    search_result_loader = $("#search-result-loader")
    search_current = $("#search-current");
    add_new = $("#add-new");

    modal_recipe_description = $("#modal-recipe-description");
    modal_recipe_instructions = $("#modal-recipe-instructions");
    modal_recipe_tile = $("#modal-recipe-tile");

    //Add event handler Note: .on is for generated elements
    ingredient_search_result.on("click",".searched-ingredient",ingredient_clicked);
    picked_ingredients.on("click",".picked-ingredient",remove_ingredient)
    search_form.keyup(search_key_press);
    new_ingredient.parent().click();

    //Toggle tooltip;
    $("[data-toggle=tooltip]").tooltip({html:true});


});

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
                    <div id="'+recipe.name+'"  description="'+ recipe.description +'"class="panel panel-default">\
                        <div class="panel-heading"><a href="#" onClick="get_recipe_details(this)" server-id="'+recipe.server_id+'" class="panel-title recipe-title" data-toggle="modal" data-target="#recipe-modal">'+recipe.name+'<span class="badge pull-right">'+recipe.completeness+'%</span></a></div>\
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

function get_recipe_details(elm){
    var id = $(elm).attr("server-id");
    $.ajax({
        url:FIND_RECIPE,
        data:{id:id.toString()},
        success:function(data){

            modal_recipe_tile.html(data.name);
            modal_recipe_description.html(data.description);
            modal_recipe_instructions.html(data.instructions);
            recipe_modal.modal("show");
        },


    })
}
