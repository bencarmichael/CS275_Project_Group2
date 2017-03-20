var can_search = false;
var SEARCH_TIMEOUT = 100;
var SEARCH_INGREDIENT_URL = "/ingredients/search";
var SUBMIT_INGREDIENT_URL = "/ingredients";
var SUBMIT_RECIPE_URL = "/recipes";
var SEARCH_RECIPE_URL = "/recipes/search";
var FIND_INGREDIENT = "/ingredients";
var ingredient_search_result;
var picked_ingredients;
var new_ingredient_error;
var recipe_error;
var submit;
var description_textarea;
var instruction_textarea;
var recipe_title_input;

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
    recipe_error = $("#recipe-error");
    submit = $(".submit");
    description_textarea = $("#description-textarea");
    instruction_textarea = $("#instruction_textarea");
    recipe_title_input = $("#recipe-title-input");
    search_result_loader = $("#search-result-loader")
    search_current = $("#search-current");
    add_new = $("#add-new");

    //Add event handler Note: .on is for generated elements
    ingredient_search_result.on("click",".searched-ingredient",ingredient_clicked);
    picked_ingredients.on("click",".picked-ingredient",remove_ingredient)
    search_form.keyup(search_key_press);
    submit.click(submit_recipe);
});

//there no recipes prevents console errors.
function look_up_recipe(){}

function submit_recipe(){
        var recipe = {}
        recipe.title =  recipe_title_input.val().trim();
        if(recipe.title == ""){
            recipe_title_input.parent().addClass("has-error");
        }
        recipe.description = description_textarea.val().trim();
        if(recipe.description == ""){
            description_textarea.parent().addClass("has-error");
        }
        recipe.instructions = instruction_textarea.val().trim();
        if(recipe.instructions == ""){
            instruction_textarea.parent().addClass("has-error");
        }
        recipe.ingredients = [];
        $(".picked-ingredient").each(function(){
            recipe.ingredients.push($(this).attr("server-id"));
        });
        $.ajax({
            url:SUBMIT_RECIPE_URL,
            data:recipe,
            type:"POST",
            success:function(){
                window.location = ".";
            }
        });
}
