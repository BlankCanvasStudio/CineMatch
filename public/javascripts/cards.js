var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

async function load_new_movie(next, jq_location){
    let plat = $('#navbarDropdown').text();
    $.post(window.location.pathname+'?platform='+plat, { type:"new-movie", platform:plat }, function(data, status){
        next(data, jq_location);
    });
}
async function load_specific_movie(id_num, next, jq_location){
    let plat = $('#navbarDropdown').text();
    $.post(window.location.pathname+'?platform='+plat, { type:"load-movie", platform:plat, id_num:id_num }, function(data, status){
        next(data, jq_location);

    });
}
async function add_new_movie_to_list(id_num, next){
    let plat = $('#navbarDropdown').text();
    $.post(window.location.pathname+'?platform='+plat, { type:"add-to-list", id_num:id_num });
}
function watched(id_num){
    let plat = $('#navbarDropdown').text();
    $.post(window.location.pathname, { type:"move-to-watched", id_num:id_num });
}
function remove_from_list(id_num){
    let plat = $('#navbarDropdown').text();
    $.post(window.location.pathname, { type:"remove-from-list", id_num:id_num });
}
function remove_from_watched(id_num){
    let plat = $('#navbarDropdown').text();
    $.post(window.location.pathname, { type:"remove-from-watched", id_num:id_num });
}

async function build_new_movie_card(movie, jq_location){
    // Create and add Column for new card
    let new_col = document.createElement("div");
    new_col.className = "col";
    $(jq_location).append(new_col);

    // Create and add new card
    let card = document.createElement('div');
    card.className = "card movie-card mx-auto";
    $(new_col).append(card);

    // Add hidden ID field for later use
    let id_num = document.createElement('input');
    $(id_num).attr('type', 'hidden')
    id_num.className = "id_num";
    $(id_num).val(movie.id);
    $(card).append(id_num);

    // Create header for card
    let header = document.createElement('div');
    header.className = "card-header header-top";
    // Create close button and add it
    let close_button = document.createElement('button');
    close_button.className = "close decision";
    $(close_button).attr("type", "button");
    $(close_button).attr("aria-label", "Close");
    close_button.innerHTML = "<span aria-hidden=\"true\">&times;</span>";
    $(header).append(close_button);
    // Create title and add it
    let title = document.createElement('h3');
    title.className = "card-title";
    $(title).text(movie.title);
    $(header).append(title);
    // Add header 
    $(card).append(header);

    // Create image for movie
    // Create link wrapper 
    let link_wrapper = document.createElement('a');
    $(link_wrapper).attr('href', movie.url);
    // Make actual image
    let img = document.createElement('img');
    img.className = "card-img-top";
    $(img).attr('src', movie.img_src);
    $(img).attr('alt', movie.img_alt);
    // Wrap image in link
    $(link_wrapper).append(img);
    // Add whole thing to the card 
    $(card).append(link_wrapper);

    // Create yes/no and watched button section & buttons
    // Create and append container
    let yesno_container = document.createElement('div');
    yesno_container.className = "card-header";
    $(card).append(yesno_container);
    // Create No Button & add it
    let no_btn = document.createElement('button');
    no_btn.className = "btn btn-no decision negative";
    $(no_btn).attr("type", "button").text("No");
    $(yesno_container).append(no_btn);
    // Create Yes Button & add it
    let yes_btn = document.createElement('button');
    yes_btn.className = "btn btn-yes decision affirmative";
    $(yes_btn).attr("type", "button").text("Yes");
    $(yesno_container).append(yes_btn);
    //Create Watched button and add it
    let watched_btn = document.createElement('button');
    watched_btn.className = "btn btn-success center decision watched";
    $(watched_btn).attr("type", "button").text("Watched");
    $(yesno_container).append(watched_btn);

    // Create Description section & add it
    // Create body section & add it
    let body = document.createElement('div');
    body.className = "card-body";
    $(card).append(body);
    // Create description and add it
    let description = document.createElement('p');
    description.className = "card-text";
    $(description).text(movie.description);
    $(body).append(description);

    // Create Watch now button and add it
    let watch_now = document.createElement('a');
    watch_now.className = "btn btn-primary";
    $(watch_now).attr('href', movie.url);
    $(watch_now).text("Watch Now");
    $(card).append(watch_now);

    // Create and Add footer 
    // Create footer
    let footer = document.createElement('div');
    footer.className = "card-footer text-muted";
    $(card).append(footer);
    // Create and add platform section
    let platform = document.createElement('p')
    $(platform).text("Platform: "+movie.platform);
    $(footer).append(platform);
    // Create and add genres 
    let genres = document.createElement('p');
    $(genres).text("Genres: ");
    for(let i=0; i<movie.genres.length-1; i++){
        $(genres).append(movie.genres[i]+", ")
    }
    if(movie.genres.length){
        $(genres).append(movie.genres[movie.genres.length-1])
    } else {
        $(genres).append("None");
    }   
    $(footer).append(genres)
}

async function display_new_movie(jq_location){
    //let new_movie =;
    load_new_movie(build_new_movie_card, jq_location);
    //build_new_movie_card( await load_new_movie());
    return;
}

function likes_movie(id_num) {
    add_new_movie_to_list(id_num);
    display_new_movie('.title-display');
}

function hates_movie(id_num){
    display_new_movie('.title-display');
}

function populate_profile_to_watch(id_num, nickname){
    if(!Array.isArray(id_num)){id_num=[id_num];}
    let len = id_num.length;
    for(let i=0; i<len; i++){
        load_specific_movie(id_num[i], build_new_movie_card, '.to-watch-'+nickname);
    }
}
function populate_profile_watched(id_num, nickname){
    if(!Array.isArray(id_num)){id_num=[id_num];}
    let len = id_num.length;
    for(let i=0; i<len; i++){
        load_specific_movie(id_num[i], build_new_movie_card, '.watched-'+nickname);
    }
}

$(document).ready(() => {
    $(document).on("click", ".decision", function() {
        // This makes the element disappear then removes it cause we don't want all the 
            // Extra and unused titles to be saved when they are actual garbage
        $($(this).parents()[2]).fadeOut("slow", function(){
            $(this).remove();
        });
    });
    $(document).on("click", ".negative", function() {
        let id_num = $($(this).parents()[1]).find('input.id_num').val()
            // This is purely for readability
        hates_movie(id_num);
    });
    $(document).on("click", ".affirmative", function() {
        let id_num = $($(this).parents()[1]).find('input.id_num').val()
        likes_movie(id_num);
    });
    $(document).on("click", ".watched", function(){
        let id_num = $($(this).parents()[1]).find('input.id_num').val()
        watched(id_num);
    });
    $(document).on("click", ".watched-home", function(){
        // We want this to move to watch and add new movie but in a place like list we don't want it to add a new movie
        let id_num = $($(this).parents()[1]).find('input.id_num').val()
        watched(id_num);
        display_new_movie('.title-display');
    });
    $(document).on("click", ".rm-list", function(){
        let id_num = $($(this).parents()[1]).find('input.id_num').val()
        remove_from_list(id_num);
    });
    $(document).on("click", ".rm-watched", function(){
        let id_num = $($(this).parents()[1]).find('input.id_num').val()
        remove_from_list(id_num);
    });
});