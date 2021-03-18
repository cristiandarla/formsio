$(document).ready(function() {
	var currentQuestion = null;
	var redirectError = $("p#redirect-error").text()
	let initialAnswer = `
	<div class="ind-ans row my-1 w-100" id="ind-ans-1">
		<div class="col-10">
			<input type="text" class="answer-input" name="ans[1]" placeholder="answer...">
		</div>
		<div class="col-2" id="btn-ind-ans">
			<div class="btn-pill pill-cyan" id="pill-cyan" onclick="switchButtons(this)"></div>
			<div class="btn-pill pill-grey" id="pill-grey" onclick="switchButtons(this)"></div>
			<div class="btn-pill pill-del" onclick="removeCurrentAnswer(this)">&mdash;</div>
		</div>
	</div>
	<div class="ind-ans row my-1 w-100" id="ind-ans-2">
		<div class="col-10">
			<input type="text" class="answer-input" name="ans[2]" placeholder="answer...">
		</div>
		<div class="col-2" id="btn-ind-ans">
			<div class="btn-pill pill-cyan" id="pill-cyan" onclick="switchButtons(this)"></div>
			<div class="btn-pill pill-grey" id="pill-grey" onclick="switchButtons(this)"></div>
			<div class="btn-pill pill-del" onclick="removeCurrentAnswer(this)">&mdash;</div>
		</div>
	</div>`;

	//init
	var questions = $('div.questions > div.row').length;
	for (var i = 1; i <= length; i++){
		$('div#q-' + i + ' >> img#fav').hide();
	}
	$("button#nextq").hide();
	checkQType($("select#qtype"), initialAnswer);

	if (!(redirectError === "")){
		Swal.fire({
			icon: 'warning',
			title: redirectError,
			showConfirmButton: false,
			timer: 3000
		}).then(() => $("p#redirect-error").hide());
	};
	$("select#qtype").on("change", function(){
		checkQType(this, initialAnswer);
	});
	$("i.trash").toggle();

	// make these modualar
    $("form#signup").on('submit', function(e){
		var $form = $(this);
		var data = $form.serialize();

		$.ajax({
		url: "/signup",
		type: "POST",
		data: data,
		dataType: "json",
		success: function(resp) {
			successMessage('Your account has been created succesfully'),
			setTimeout(() => {
				window.location.href = "/team";
			}, 1750);
		},
		error: function(resp) {
			errorHandler(resp);
		}
		});

		e.preventDefault();
	});
    $("form#login").on('submit', function(e){
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
				errorHandler(resp);
			}
		});    
		e.preventDefault();
	});
    $("form#team-add").on('submit', function(e){
		var $form = $(this);
		var data = $form.serialize();

		$.ajax({
		url: "/team/add",
		type: "POST",
		data: data,
		dataType: "json",
		success: function(resp) {
			successMessage('The team was create successfuly'),
			setTimeout(() => {
				window.location.href = "/profile";
			}, 1750);
		},
		error: function(resp) {
			errorHandler(resp);
		}
		});    
		e.preventDefault();
	});
	$("form#team-join").on('submit', function(e){
		var form = $("input[name=team]:checked");
		var data = form.serialize();

		$.ajax({
		url: "/team/join",
		type: "POST",
		data: data,
		dataType: "json",
		success: function(resp) {
			successMessage('The new team was selected!'),
			setTimeout(() => {
				window.location.href = "/profile";
			}, 1750);
		},
		error: function(resp) {
			errorHandler(resp);
		}
		});
		e.preventDefault();
	});
	$("form#phone").on('submit', function(e){
		var form = $(this);
		var data = form.serialize();

		$.ajax({
		url: "/profile/phone",
		type: "POST",
		data: data,
		dataType: "json",
		success: function(resp) {
			successMessage('The phone was changed!'),
			setTimeout(() => {
				window.location.href = "/profile";
			}, 1750);
		},
		error: function(resp) {
			errorHandler(resp);
		}
		});
		e.preventDefault();
	});
	$("form#address").on('submit', function(e){
		var form = $(this);
		var data = form.serialize();

		$.ajax({
		url: "/profile/address",
		type: "POST",
		data: data,
		dataType: "json",
		success: function(resp) {
			successMessage('The address was changed!'),
			setTimeout(() => {
				window.location.href = "/profile";
			}, 1750);
		},
		error: function(resp) {
			errorHandler(resp);
		}
		});
		e.preventDefault();
	});

	$("div.btn-snd").on("click", function(e){
		$("i.trash").toggle();
	})
});

//try to add new notification method
function errorHandler(resp){
	if([400, 401].includes(resp.status)){
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: resp.responseJSON.error
		});
	}else if([500, 0].includes(resp.status)){
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
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: "An unknown error has occured... We are sorry for that! Please contact the tech support!"
		});
	}
}
function successMessage(msg){
	Swal.fire({
		position: 'top-end',
		icon: 'success',
		title: msg,
		showConfirmButton: false,
		timer: 1500
	})
}
function warningMessage(msg){
	Swal.fire({
		position: 'top-right',
		icon: 'warning',
		title: msg,
		showConfirmButton: false,
		timer: 1500
	})
}


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
function makeJSON(question, qtype, id = null){
	var formData = {
		'text' 	: question,
		'type' 	: qtype													
	};
	id == null ? null : formData['_id'] = id;
	if(["checkbox","radio"].includes(qtype)){
		var answers = $('.answer-input')
						.map(function(idx, elem) {
							return $(elem).val();
						})
						.get();
		formData['answers'] = answers
	}
	return formData;
}

function deleteQuestion(id){
	$.ajax({
		url: "/forms/create/delete",
		type: "POST",
		data: {'id' : id},
		dataType: "json",
		success: function(resp) {
			successMessage('The question has been deleted succesfully!'),
			setTimeout(() => {
				location.reload();
			}, 1750);
		},
		error: function(resp) {
			errorHandler(resp);
		}
	})
}
function modifyQuestion(context){
	currentQuestion = context;
	$('input#_id').val(context._id);
	$('textarea#question').val(context.text);
	$('select#qtype').val(context.question_type);
	$('div#answers>').remove();
	if(['checkbox', 'radio'].includes(context.question_type)){
		context.answers.forEach(
			(element, index) => {
				$("div#btn-ans").show();
				var div = document.createElement('div')
				div.id = 'ind-ans-' + (index + 1)
				div.className = 'ind-ans row my-1 w-100'
				$('div#answers').append(div)
	
				//col-10
				var col_10 = document.createElement('div')
				col_10.className = 'col-10'
				div.appendChild(col_10)
	
				var input = document.createElement('input')
				input.setAttribute('type', 'text')
				input.setAttribute('name', 'ans[' + (index + 1) + ']')
				input.setAttribute('value', element)
				input.className = 'answer-input'
				col_10.appendChild(input)
	
				//col-2
				var col_2 = document.createElement('div')
				col_2.className = 'col-2'
				col_2.id = 'btn-ind-ans'
				div.appendChild(col_2)
	
				var btn1 = document.createElement('div')
				btn1.className = 'btn-pill pill-cyan'
				btn1.id = 'pill-cyan'
				btn1.setAttribute('onclick', 'switchButtons(this)')
				col_2.appendChild(btn1)
	
				var btn2 = document.createElement('div')
				btn2.className = 'btn-pill pill-grey'
				btn2.id = 'pill-grey'
				btn2.setAttribute('onclick', 'switchButtons(this)')
				col_2.appendChild(btn2)
	
				var btn3 = document.createElement('div')
				btn3.className = 'btn-pill pill-del'
				btn3.setAttribute('onclick', 'removeCurrentAnswer(this)')
				btn3.innerHTML = '&mdash;'
				col_2.appendChild(btn3)
	
	
				
			}
		)
	}
	$('#exampleModal').modal('toggle');
}
function addQuestion(){
	var question = $('textarea[name=question').val();
	var qtype = $('select[name=qtype]').val();
	var flags = [question === ''];
	var hasCurrentQuestion = currentQuestion != null;
	if(hasCurrentQuestion){
		var isModified = !(question === currentQuestion.text && qtype === currentQuestion.question_type);
	}

	if(["checkbox", "radio"].includes(qtype)){
		var data = makeJSON(question, qtype);
		hasCurrentQuestion ? isModified = isModified ||
			!(data.answers.sort().join(',') === currentQuestion.answers.sort().join(',')) : null;
		
		flags.push(
			$('.answer-input')
			.toArray().
			some(element => element.value === '')
		);
	}else{
		flags.push(false);
	}

	if(hasCurrentQuestion && !isModified){
		$('#exampleModal').modal('toggle');
		successMessage('No modification was found!');
		resetModal();
		return;
	}

	if(flags.every(element => element == true)){
		warningMessage('The question should have a text!')
		.then(() => {
			setTimeout(() => {
				warningMessage('All the input values should be fullfiled!')
			}, 100);
		});
	} else if(flags[0]){
		warningMessage('The question should have a text!')
	} else if(flags[1]){
		warningMessage('All the input values should be fullfiled!')
	} else { 
		var formData = makeJSON(question, qtype, hasCurrentQuestion ? currentQuestion._id : null);
		
		$.ajax({
			url: isModified ? "/forms/create/update" : "/forms/create/add",
			type: "POST",
			data: formData,
			dataType: "json",
			success: function(resp) {
				successMessage(isModified ? 'The question has been updated succesfully!' : 'The question has been sent succesfully!')//,
				setTimeout(() => {
					location.reload();
				}, 1750);
			},
			error: function(resp) {
				errorHandler(resp);
			}
			});
	}
}
function nextQuestion(){
	console.log("merge");
}

//add questions popup
function switchButtons(current){
	var currentButton = current.id;
	var parent = current.parentNode.parentNode.id;
	var otherButton = ((currentButton === 'pill-grey') ? 'pill-cyan' : 'pill-grey');

	var currentButtonSelect = $('div#' + parent + ' > div#btn-ind-ans > ' + 'div#' + currentButton);
	var otherButtonSelect = $('div#' + parent + ' > div#btn-ind-ans > ' + 'div#' + otherButton);

	currentButtonSelect.hide();
	otherButtonSelect.show();
}
function removeCurrentAnswer(current){
	var parent = current.parentNode.parentNode.id;

	var parentSelect = $('div#' + parent);
	if($("div.ind-ans").length > 2){
		parentSelect.remove();
	}else{
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'You should have at least 2 options!'
		});
	}
}
function addNewAnswer(){

	var value = ($("div.ind-ans").length == 0) ? 1 : parseInt($("div.ind-ans")[$("div.ind-ans").length - 1].id.split('-')[$("div.ind-ans")[$("div.ind-ans").length - 1].id.split('-').length - 1]) + 1;
	var newAnswer = `<div class="ind-ans row my-1 w-100" id="ind-ans-${ value }">
	<div class="col-10">
	<input type="text" class="answer-input" name="ans[${ value }]" placeholder="answer...">
</div>
<div class="col-2" id="btn-ind-ans">
	<div class="btn-pill pill-cyan" id="pill-cyan" onclick="switchButtons(this)"></div>
	<div class="btn-pill pill-grey" id="pill-grey" onclick="switchButtons(this)"></div>
	<div class="btn-pill pill-del" onclick="removeCurrentAnswer(this)">&mdash;</div>
</div>
</div>`;
	$("div#answers").append(newAnswer)
}

function checkQType(value, ans){
	if( ["checkbox", "checkbox_cf", "radio", "radio_cf"].includes($(value).val())){
		$("div#btn-ans").show();
		$("div.scrollable-div").show();
		if($("div.ind-ans").length === 0 ){
			$("div#answers").append(ans);
		}
	}else{
		$("div#btn-ans").hide();
		$("div.scrollable-div").hide();
	}
	if(["checkbox_cf", "radio_cf"].includes($(value).val())){
		$("button#nextq").show();
		$("button#addq").hide();
	}else{
		$("button#nextq").hide();
		$("button#addq").show();
	}
}

function makeFav(current){
	var currentSrc = current.src.split('/');
	startType = currentSrc[currentSrc.length - 1];
	var otherType = startType == 'star-grey.png' ? 'star-yellow.png' : 'star-grey.png';
	currentSrc[currentSrc.length - 1] = otherType;
	current.src = currentSrc.join('/');
}

function resetModal(){
	currentQuestion = null;
	$('input#_id').val('');
	$('textarea#question').val('');
	$('select#qtype').val('text');
	$("div#btn-ans").hide();
	$('div#answers>').remove();
}

function submitForm(){
	var title = $('#form-title').val();
	if( title == ""){
		warningMessage("The form should have a title ")
	}else{
		$.ajax({
			url: "/forms/submit",
			type: "POST",
			data: {'title' : title },
			dataType: "json",
			success: function(resp) {
				successMessage('The form has been created succesfully!'),
				setTimeout(() => {
					window.location.href = "/forms/submit";
				}, 1750);
			},
			error: function(resp) {
				errorHandler(resp);
			}
		});
	}
}