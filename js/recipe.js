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

$(document).ready(function(){
    //Find the elements
    search_form = $("#search-form");
    ingredient_search_result = $("#ingredient-search-result");
    picked_ingredients = $("#picked-ingredients");
    new_ingredient = $("#new-ingredient");
    new_ingredient_error = $("#new-ingredient-error");

    //Add event handler Note: .on is for generated elements
    ingredient_search_result.on("click",".searched-ingredient",ingredient_clicked);
    picked_ingredients.on("click",".picked-ingredient",remove_ingredient)
    search_form.keyup(search_key_press);
    new_ingredient.parent().click(add_ingredient);

    var quill_descriptions = new Quill('#description-quill',{
        placeholder: 'A tasty American classic...',
        theme: 'snow'
    });
    //init quill
    var quill_instructions = new Quill('#instructions-quill',{
        placeholder: 'Set oven to 350 degrees...',
        theme: 'snow'
    });

    var form = document.querySelector('form');
    form.onsubmit = function(){
        var description = document.querySelector('input[name=description]');
        description.value = JSON.stringify(quill_descriptions.getContents());
        var instructions = document.querySelector('input[name=instructions]');
        instructions.value = JSON.stringify(quill_instructions.getContents());

        var search_ids = []
        $(".picked-ingredient").each(function(){
            search_ids.push($(this).attr("server-id"));
        });
        console.log("sumbitted",objectifyForm($(form).serializeArray()));
    }
});

//there no recipes prevents console errors.
function look_up_recipe(){}
