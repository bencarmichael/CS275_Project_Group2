function objectifyForm(formArray) {//serialize data function

  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

function search(){
    console.log(can_search);
    new_ingredient_error.addClass("hidden");
    $.ajax({
        url:SEARCH_INGREDIENT_URL,
        type:"GET",
        data: {str:search_form.val()},
        success: function(data,textStatus,jqXHR){
            search_result_loader.addClass("hidden");
            ingredient_search_result.empty();
            if(data.length == 0){
                add_new.removeClass("hidden");
                search_current.addClass("hidden");
                new_ingredient_mode = true;
                return;
            }
            for(var i=0;i<data.length;i++){
                ingredient_search_result.prepend(
                    '<li server-id="'+ data[i].id+'" name="'+ data[i].name + '"class="list-group-item btn-look searched-ingredient">' + data[i].name + '</li>'
                );
            }
            ingredient_search_result.append('<li class="list-group-item btn-look" onClick="add_ingredient()">'+search_form.val()+' <span class="glyphicon glyphicon-pencil"></span></li>');
        },
        error: function(jqXHR,textStatus,errorThrown){
            console.log('ERROR SEARCHING INGREDIENT : ' + errorThrown);
        }
    });
}

function search_key_press(event){
    search_form.parent().find(".help-block").remove();
    search_form.parent().removeClass("has-error");
    if(ingredient_search_result.children().length != 0 && search_form.val().length != 0){
        add_new.addClass("hidden");
        search_current.removeClass("hidden");
        new_ingredient_mode = false; 
    }
    if(event.originalEvent.code == "Enter"){
        if(new_ingredient_mode){
            add_ingredient();
        }else{
            if(ingredient_search_result.children().length != 0){
                ingredient_search_result.children().first().click();
            }
        }
    }else{
        if(ingredient_search_result.children().length == 0){
            search_result_loader.removeClass("hidden");
        }
        if(can_search == false){
            can_search = true;
            setTimeout(function(){can_search=false;search()},SEARCH_TIMEOUT);
        }
    }
}

function ingredient_clicked(){
    
    var ingredient = $(this);
    var server_id = ingredient.attr('server-id');
    var name = ingredient.attr('name');
    search_form.val('');
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
        ingredient_search_result.empty();
        look_up_recipe();

    }
}

function remove_ingredient(){
   $(this).remove();
   look_up_recipe();
}
     

function add_ingredient(){
    $.ajax({
        url:SUBMIT_INGREDIENT_URL,
        type:"POST",
        data:{name:search_form.val().trim()},
        success: function(data,textStatus,jqXHR){
                search_form.val('');
                var server_id = data.insertId;
                var name = data.name;
                picked_ingredients.append(
                    '\
                        <span server-id="'+server_id+'" name="'+name+'"class="label label-default picked-ingredient">'+name+' <span class="glyphicon glyphicon-remove"></span></span>\
                    '
                );
                new_ingredient = false;
                look_up_recipe();
        },
        error: function(jqXHR,textStatus,errorThrown){
            console.log('ERROR ADDING INGREDIENT : ' + errorThrown);
            search_form.parent().addClass("has-error");
            search_form.parent().append('<span class="help-block">Ingredient already exists</span>')
        }
    });
}
