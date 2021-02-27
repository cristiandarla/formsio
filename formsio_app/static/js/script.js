function Validate() {
	var password = document.getElementById("password").value;
	var confirmPassword = document.getElementById("rpassword").value;
	var privacy = $("#privacy");
	if (password != confirmPassword && !privacy.is(":checked")) {
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
	}else if (!privacy.is(":checked")) {
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
            text: 'You should accept the Terms!'
		});
	}
	return password == confirmPassword && privacy.is(":checked");
}