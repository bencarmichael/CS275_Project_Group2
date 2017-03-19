function objectifyForm(formArray) {//serialize data function

  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

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

function search_key_press(event){
    if(event.originalEvent.code == "Enter"){
        if(ingredient_search_result.children().length != 0){
            ingredient_search_result.children().first().click();
        }
    }else{
        new_ingredient.html(search_form.val());
        new_ingredient.parent().addClass("hidden");
        if(can_search == false){
            can_search = true;
            search();
            setTimeout(function(){can_search=false},SEARCH_TIMEOUT);
        }
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
    var unique = true;
    $(".picked-ingredient").each(function(){
        if(server_id == $(this).attr("server-id")){
            unique = false;
        }
    });
    if(unique){
        picked_ingredients.append(
            '\
                        <span server-id="'+server_id+'" name="'+name+'"class="label label-default picked-ingredient">'+name+' <span class="glyphicon glyphicon-remove"></span></span>\
                    '
        );
        look_up_recipe();

    }
}

function remove_ingredient(){
   $(this).remove();
   look_up_recipe();
}
     

function add_ingredient(){
    new_ingredient.parent().addClass("hidden");
    search_form.val('');
    $.ajax({
        url:SUBMIT_INGREDIENT_URL,
        type:"POST",
        data:{name:new_ingredient.html()},
        success: function(data,textStatus,jqXHR){
                var server_id = data.insertId;
                var name = data.name;
                picked_ingredients.append(
                    '\
                        <span server-id="'+server_id+'" name="'+name+'"class="label label-default picked-ingredient">'+name+' <span class="glyphicon glyphicon-remove"></span></span>\
                    '
                );
                look_up_recipe();
        },
        error: function(jqXHR,textStatus,errorThrown){
            console.log('ERROR ADDING INGREDIENT : ' + errorThrown);
            new_ingredient_error.removeClass("hidden");
        }
    });
}
