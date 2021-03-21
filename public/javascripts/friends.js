$(document).ready(()=>{
    $('a.list-group-item-action').on('click', function() {
        let unique_name = $(this).attr('id').split('-')[1];
        if(3 === $('.to-watch-'+unique_name).children().length){
            let id_nums = [];
        $('.to-watch-list input[type="hidden"]').each((index, value)=>{
            id_nums.push($(value).val());
        });
        populate_profile_to_watch(id_nums, unique_name);
        }
        if(3 === $('.watched-'+unique_name).children().length){
            // This function comes from cards.js so make sure its imported above that one
            let id_nums = [];
            $('.watched-list input[type="hidden"]').each((index, value)=>{
                id_nums.push($(value).val());
            });
            populate_profile_watched(id_nums, unique_name);
        }
    });
})