var can_search = false;
var SEARCH_TIMEOUT = 100;
var SEARCH_INGREDIENT_URL = "/ingredients/search";
var SUBMIT_INGREDIENT_URL = "/ingredients";
var SUBMIT_RECIPE_URL = "/recipes";
var SEARCH_RECIPE_URL = "/recipes/search";
var FIND_INGREDIENT = "/ingredients";
var ingredient_search_result;
var picked_ingredients;
var new_ingredient;
var new_ingredient_error;
var recipe_error;
var submit;

$(document).ready(function(){
    //Find the elements
    search_form = $("#search-form");
    ingredient_search_result = $("#ingredient-search-result");
    picked_ingredients = $("#picked-ingredients");
    new_ingredient = $("#new-ingredient");
    new_ingredient_error = $("#new-ingredient-error");
    recipe_error = $("#recipe-error");
    submit = $("#submit");

    //Add event handler Note: .on is for generated elements
    ingredient_search_result.on("click",".searched-ingredient",ingredient_clicked);
    picked_ingredients.on("click",".picked-ingredient",remove_ingredient)
    search_form.keyup(search_key_press);
    new_ingredient.parent().click(add_ingredient);
    submit.click()

    var quill_descriptions = new Quill('#description-quill',{
        placeholder: 'A tasty American classic...',
        theme: 'snow'
    });
    //init quill
    var quill_instructions = new Quill('#instructions-quill',{
        placeholder: 'Set oven to 350 degrees...',
        theme: 'snow'
    });

});

//there no recipes prevents console errors.
function look_up_recipe(){}

function submit_recipe(){
        var recipe = {}
        recipe.title =  $("#recipe-title-input").val();
        recipe.description = JSON.stringify(quill_descriptions.getContents());
        recipe.instructions = JSON.stringify(quill_instructions.getContents());
        recipe.ingredients = [];
        $(".picked-ingredient").each(function(){
            recipe.ingredients.push($(this).attr("server-id"));
        });

        $.ajax({
            url:SUBMIT_RECIPE_URL,
            data:recipe,
            type:"POST"
        });
}
