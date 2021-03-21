$(document).ready(()=>{
    let searchParams = getUrlParameter('platform');
    if(searchParams){
        $('#navbarDropdown').text(searchParams.replace("Plus", "+"));
    }
})