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
            
            if(resp.status == 500){
                console.error(resp);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Server error! Ask tech support."
                });
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: resp.responseJSON.error
                });
            }
        }
        });    
        e.preventDefault();
    });

});