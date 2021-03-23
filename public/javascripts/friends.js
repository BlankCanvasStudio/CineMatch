function build_user_search_response(users_found){
    if(!Array.isArray(users_found.users)){users_found.users = [users_found.users];}
    if(!users_found.users.length){
        // This is going to be the none condition
        let no_users = document.createElement('h3');
        $(no_users).text("No Users Found!");
        $('.user-lookup-response-space').append(no_users);
    } else {
        let len = users_found.users.length;
        for(let i=0; i<len; i++){
            console.log(users_found.users[i].email.split('@')[0]);
            let user_btn = document.createElement('a');
            user_btn.className="list-group-item list-group-item-action potential-friend-btn";
            $(user_btn).attr('data-toggle', 'list')
            if($('div#'+users_found.users[i].email.split('@')[0]+".tab-pane").length){
                $(user_btn).attr('href', '#'+users_found.users[i].email.split('@')[0]);
            } else {
                $(user_btn).attr('href', '#potential-friend')
            }
            $(user_btn).attr("role", "tab");
            $(user_btn).attr("aria-controls", users_found.users[i].email.split('@')[0]);
            $(user_btn).attr("data-email", users_found.users[i].email);
            $(user_btn).attr("data-genres", users_found.users[i].genres);
            $(user_btn).text(users_found.users[i].nickname+". Genres: "+users_found.users[i].genres);
            $(user_btn).attr("id", 'list-'+users_found.users[i].email.split('@')[0]+'-list')
            $('.user-lookup-response-space').append(user_btn);
        }
    }
}

function load_potential_friends_ids(user_email, unique_name){
    $.post('/load', { type:"get-lists", email:user_email }, function(data, status){
        if (data.status === "success") {
            console.log(data);
            let len = data.to_watch.length;
            let input = document.createElement('input');
            populate_profile_to_watch(data.to_watch, "potential-friend");
            populate_profile_watched(data.watched, "potential-friend");
        } else { 
            let failure_code = data.status.split(':')[1];
            if(failure_code === "user"){
                console.log('Failed to find your user account.');
            } else {
                console.log('You got an invalid error code but something went wrong');
            }
        }
        
    });
}

function load_matched_movies(other_u_email){
    $('.to-watch-matched-area').empty();
    $('.watched-matched-area').empty();
    $.post('/load', { type:"get-matched-list", other_u_email:other_u_email }, function(data, status){
        if(data.status === "success"){
            console.log('in loading matches')
            let len = data.to_watch.length
            for(let i=0; i<len; i++){
                load_specific_movie(data.to_watch[i], build_new_movie_card, '.to-watch-matched-area');
            }
            len = data.watched.length
            for(let i=0; i<len; i++){
                load_specific_movie(data.watched[i], build_new_movie_card, '.watched-matched-area');
            }
            return
        } else {
            let failure_code = data.status.split(':')[1];
            if (failure_code === "o_user"){
                console.log("the user comparing against couldn't be found");
            } else if (failure_code === "user") {
                console.log("your user is missing somehow?");
            } else if (failure_code === "both") {
                console.log("Both of the users involved couldn't be found (probably server or database error)");
            }
        }
        
    });
}

function load_new_friend_space(unique_name, email, genres){
    $('.potential-friend h2.name').html("<u>"+unique_name+"'s Profile</u>");
    $('.potential-friend .to-watch-potential-friend').empty();
    $('.potential-friend .watched-potential-friend').empty();
    $('.potential-friend h5.genres').text("Likes: "+genres)
    $('.add-friend').attr("data-email", email);
}

function list_group_trigger(unique_name){
    $('.tab-pane.active').removeClass("active");
    $('.list-group-item-action.active').removeClass("active");
    $('.user-lookup-response-space').empty();
    //let unique_name = $(this).attr('id').split('-')[1];
    // Check if the user has a profile display area. If not, make one
    load_from_ids(unique_name);
}

function load_from_ids (unique_name){
    // Load the user profile display area
    if(!$('.to-watch-'+unique_name+' .movie-card').length){
        let id_nums = [];
        $('.to-watch-list input[type="hidden"]').each((index, value)=>{
            id_nums.push($(value).val());
        });
        populate_profile_to_watch(id_nums, unique_name);
    }
    if(!$('.watched-'+unique_name+" .movie-card").length){
        // This function comes from cards.js so make sure its imported above that one
        let id_nums = [];
        $('.watched-list input[type="hidden"]').each((index, value)=>{
            id_nums.push($(value).val());
        });
        populate_profile_watched(id_nums, unique_name);
    }
}

function request_friend(req_email){
    $.post('/load', { type:"request-friend", req_email:req_email }, function(data, status){
        if(data.status === "success"){return}
        else {
            let failure_code = data.status.split(':')[1];
            if (failure_code === "requesting_user"){
                console.log("the requesting user couldn't be found");
            } else if (failure_code === "user") {
                console.log("your user is missing somehow?");
            } else if (failure_code === "both") {
                console.log("Both of the users involved couldn't be found (probably server or database error)");
            }
        }
    });
}
function add_friend(add_email){
    $.post('/load', { type:"add-friend", add_email:add_email }, function(data, status){
        if(data.status === "success"){return}
        else {
            let failure_code = data.status.split(':')[1];
            if (failure_code === "requesting_user"){
                console.log("the requesting user couldn't be found");
            } else if (failure_code === "user") {
                console.log("your user is missing somehow?");
            } else if (failure_code === "both") {
                console.log("Both of the users involved couldn't be found (probably server or database error)");
            }
        }
    });
}
function remove_requestion(remove_email){
    $.post('/load', { type:"remove-request", remove_email:remove_email }, function(data, status){
        // Check the response code to make sure that the request went through or notify the user that it didn't
        if(data.status === "success"){return}
        else {
            let failure_code = data.status.split(':')[1];
            if (failure_code === "remove_user"){
                console.log("the removing user couldn't be found");
            } else if (failure_code === "user") {
                console.log("your user is missing somehow?");
            } else if (failure_code === "both") {
                console.log("Both of the users involved couldn't be found (probably server or database error)");
            }
        }
    });
}

$(document).ready(() => {
    $('.list-group-item-action').on('click', function(){
        list_group_trigger($(this).attr('id').split('-')[1]);
    });
    $('.lookup-fit').on('click', function(){
        let filter = $('input[name=friends-lookup]').val();
        $.post('/load', { type:"find-friends", filter:filter }, function(data, status){
            $('.tab-pane.active').removeClass("active");
            $('.list-group-item-action.active').removeClass("active");
                // Makes whatever is filling the current window disappear
            $('.user-lookup-response-space').empty();
            build_user_search_response(data);
            $('.potential-friend-btn').on('click', function(){
                // As much as the redundancy sucks, its necessary to keep the functions working properly
                let unique_name = $(this).attr("id").split('-')[1];
                let genres = $(this).attr('data-genres');
                let user_email = $(this).attr('data-email');
                load_new_friend_space(unique_name, user_email, genres);
                load_potential_friends_ids(user_email, unique_name);
            });    
        });
    });
    $('.find-matched').on('click', function(){
        let other_email = $(this).attr("data-email");
        console.log(other_email);
        load_matched_movies(other_email);
    });
    $('.request-friend').on('click', function(){
        request_friend($('.add-friend').attr('data-email'));
    }); 
    $('.add-friend').on('click', function(){
        add_friend($(this).attr('data-email'));
        $($(this).parents()[2]).fadeOut("slow");
        let friend_btn = $($(this).parents()[2]).find(".potential-friend-btn");
            // going to leave this as a potential friend until you reload the page 
                // sure its inefficient but its way better than having to refresh the page every time 
                // you add a friend. Might change it tho
        console.log(friend_btn);
                $('.friends-list').append(friend_btn);
        let match_btn = document.createElement('a');
        match_btn.className = "btn btn-sm btn-primary find-matched";
        $(match_btn).attr("data-email", $(friend_btn).attr("data-email"));
        $(match_btn).attr("data-toggle", "list");
        $(match_btn).attr("href", "#matched-movies");
        $(match_btn).text("Find Things to Watch!");
        $(match_btn).on('click', function(){
            let other_email = $(this).attr("data-email");
            console.log(other_email);
            load_matched_movies(other_email);
        });
        $(friend_btn).fadeIn("slow");
        $('.friends-list').append(match_btn);
        $($(this).parents()[2]).remove();
    }); 
    $('.delete-request').on('click', function(){
        remove_requestion($(this).attr('data-email'));
        $($(this).parents()[2]).fadeOut("slow", function(){
            $(this).remove();
            // this now refers to the container we made disappear
        });
    });
    $('.potential-friend-btn').on('click', function(){
        // As much as the redundancy sucks, its necessary to keep the functions working properl
        let unique_name = $(this).attr("id").split('-')[1];
        let genres = $(this).attr('data-genres');
        let user_email = $(this).attr('data-email');
        load_new_friend_space(unique_name, user_email, genres);
        load_potential_friends_ids(user_email, unique_name);
    });    
})