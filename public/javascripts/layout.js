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

$(document).ready(()=>{
    let platform = getUrlParameter('platform');
    if(platform){
        $('#navbarDropdown').text(platform.replace("Plus", "+"));
        if(platform==="All"){
            $('div.row.title-display div.col').fadeIn("slow");
        } else{
            platform = platform.replace("Plus", "+");
            $('div.row.title-display div.col').each((index, value) => {
                let plat = $($(value).find("div.card-footer p")[0]).text().split(':')[1].trim();
                if(plat===platform){
                    $(value).show();
                } else {
                    $(value).hide();
                }
            });
        }
    }
})
