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
            if(resp.status == 400 || resp.status == 401){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: resp.responseJSON.error
                });
            }else if(resp.status == 500 || resp.status == 0){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Server error! Ask tech support."
                });
            }else if(resp.status == 503){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Server error! Request timed out..."
                });
            }else{
                console.error(resp);
            }
        }
        });    
        e.preventDefault();
    });

});