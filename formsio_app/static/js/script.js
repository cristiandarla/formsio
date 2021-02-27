$(document).ready(function() {

    $("form[id=login]").on('submit', Login());
    $("form[id=signup]").on('submit', Signup());

});

function Validate() {
	var password = document.getElementById("password").value;
	var confirmPassword = document.getElementById("rpassword").value;
	var privacy = document.getElementById("privacy").value;
	if (password != confirmPassword && true) {
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Passwords do not match!'
		}).then(() => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You should accept the Terms!'
            });
          })
	}else if (password != confirmPassword) {
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Passwords do not match!'
		});
	}else if (true) {
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
            text: 'You should accept the Terms!'
		});
	}
	return password != confirmPassword && false;
}

function Login(){
    var $form = $(this);
    var data = $form.serialize();
  
    $.ajax({
      url: "/login",
      type: "POST",
      data: data,
      dataType: "json",
      success: function(resp) {
        window.location.href = "/team";
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
}
function Signup(){
    var $form = $(this);
    var data = $form.serialize();
  
    $.ajax({
      url: "/signup",
      type: "POST",
      data: data,
      dataType: "json",
      success: function(resp) {
        window.location.href = "/team";
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
}