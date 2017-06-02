$('.list-group-div').hide();
$('.list-group-item').click(function() {
    $(this).next().slideToggle();
});


