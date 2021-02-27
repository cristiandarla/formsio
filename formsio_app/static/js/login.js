$(document).ready(function() {

    $("form").on('submit', function(e){
        
        var $form = $(this);
        var data = $form.serialize();
    
        $.ajax({
        url: "/login",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(resp) {
            window.location.href = "/profile";
        },
        error: function(resp) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: resp.responseJSON.error
            })
        }
        });    
        e.preventDefault();
    });

});