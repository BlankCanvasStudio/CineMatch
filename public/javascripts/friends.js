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
    $.post(window.location.pathname, { type:"get-lists", email:user_email }, function(data, status){
        console.log(data);
        let len = data.to_watch.length;
        let input = document.createElement('input');
        populate_profile_to_watch(data.to_watch, "potential-friend");
        populate_profile_watched(data.watched, "potential-friend");
    });
}

function load_matched_movies(other_u_email){
    $('.to-watch-matched-area').empty();
    $('.watched-matched-area').empty();
    $.post(window.location.pathname, { type:"get-matched-list", other_u_email:other_u_email }, function(data, status){
        console.log('in loading matches')
        let len = data.to_watch.length
        for(let i=0; i<len; i++){
            load_specific_movie(data.to_watch[i], build_new_movie_card, '.to-watch-matched-area');
        }
        len = data.watched.length
        for(let i=0; i<len; i++){
            load_specific_movie(data.watched[i], build_new_movie_card, '.watched-matched-area');
        }
    });
}

function load_new_friend_space(unique_name, genres){
    $('.potential-friend h2.name').html("<u>"+unique_name+"'s Profile</u>");
    $('.potential-friend .to-watch-potential-friend').empty();
    $('.potential-friend .watched-potential-friend').empty();
    $('.potential-friend h5.genres').text("Likes: "+genres)
}

function list_group_trigger(){
    $('.tab-pane.active').removeClass("active");
    $('.list-group-item-action.active').removeClass("active");
    $('.user-lookup-response-space').empty();
    let unique_name = $(this).attr('id').split('-')[1];
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

$(document).ready(() => {
    $('.list-group-item-action').on('click', list_group_trigger);
    $('.lookup-fit').on('click', function(){
        let filter = $('input[name=friends-lookup]').val();
        $.post(window.location.pathname, { type:"find-friends", filter:filter }, function(data, status){
            $('.tab-pane.active').removeClass("active");
            $('.list-group-item-action.active').removeClass("active");
                // Makes whatever is filling the current window disappear
            $('.user-lookup-response-space').empty();
            build_user_search_response(data);
            $('.potential-friend-btn').on('click', function(){
                console.log('triggering');
                let unique_name = $(this).attr("id").split('-')[1];
                let genres = $(this).attr('data-genres');
                let user_email = $(this).attr('data-email');
                load_new_friend_space(unique_name, genres);
                load_potential_friends_ids(user_email, unique_name);
            });    
        });
    });
    $('.find-matched').on('click', function(){
        let other_email = $(this).attr("data-email");
        console.log(other_email);
        load_matched_movies(other_email);
    });
})