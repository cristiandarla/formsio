$(document).ready(function() {
    $("form").on('submit', function(e){
        
        var $form = $(this);
        var data = $form.serialize();
    
        $.ajax({
        url: "/signup",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(resp) {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Your account has been created succesfully',
                showConfirmButton: false,
                timer: 1500
            }),
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        },
        error: function(resp) {
            console.error(resp);
            if(resp.status == 500 || resp.status == 0){
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