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
		Notiflix.Notify.Warning(redirectError, {clickToClose : true})
	};
	$("select#qtype").on("change", function(){
		checkQType(this, initialAnswer);
	});
	$("i.trash").toggle();
	$('#form-title')
		.on('focusout', () => {
			var title = $('#form-title').val()
			if(title != session["form_title"] && session["form_title"] != null){
				submitForm();
			}
		})

	// make these modualar
    $("form#signup").on('submit', function(e){
		sendPOSTReqeust($(this), e, "/signup", true, 'Your account has been created succesfully', true, "/team")
	});
    $("form#login").on('submit', function(e){
		sendPOSTReqeust($(this), e, "/login", false, '', true, "/forms")
	});
    $("form#team-add").on('submit', function(e){
		sendPOSTReqeust($(this), e, "/team/add",true, 'The team was create successfuly', true, "/profile")
	});
	$("form#team-join").on('submit', function(e){
		sendPOSTReqeust($("input[name=team]:checked"), e, "/team/join",true, 'The new team was selected!', true, "/profile")
	});
	$("form#phone").on('submit', function(e){
		sendPOSTReqeust($(this), e, "/profile/phone",true, 'The phone was changed!', true, "/profile")
	});
	$("form#address").on('submit', function(e){
		sendPOSTReqeust($(this), e, "/profile/address",true, 'The address was changed!', true, "/profile")
	});

	$("div.btn-snd").on("click", function(e){
		$("i.trash").toggle();
	})

	$('#survey-btn').on('click', function(e){
		$.ajax({
			url: '/survey/' + session.current_form_id,
			type: "POST",
			dataType: "json",
			success: function(resp) {
				sessionStorage.questions = JSON.stringify(resp.questions)
				sessionStorage.currentQuestion = 0
				sessionStorage.isStarted = 'true'
				window.location.href = '/survey'
			},
			error: function(resp) {
				errorHandler(resp);
			}
		});
	})

	if(window.location.pathname === '/survey'){
		/*window.onbeforeunload = function(){
			console.log('reload')
			if(parseInt(sessionStorage.currentQuestion) > 0){
				sessionStorage.currentQuestion = parseInt(sessionStorage.currentQuestion) - 1
			}else{
				sessionStorage.currentQuestion = 0
			}
		}*/
		if(sessionStorage.getItem('isStarted') == null){
			sessionStorage.currentQuestion = 0
			sessionStorage.isStarted = 'true'
			sessionStorage.answers = JSON.stringify([])
		}
		createQuestionSurvey()
		$(window).on('unload', function(e){
			e.preventDefault()
			sessionStorage.removeItem('isStarted')
			sessionStorage.removeItem('answers')
		})
	}
});

//utils
function errorHandler(resp){
	if([400, 401].includes(resp.status)){
		Notiflix.Notify.Failure(resp.responseJSON.error, {clickToClose : true})
		console.error(resp.responseJSON.error)
	}else if([500, 0].includes(resp.status)){
		Notiflix.Notify.Failure("Server error! Ask tech support.", {clickToClose : true})
	}else if(resp.status == 503){
		Notiflix.Notify.Failure("Server error! Request timed out...", {clickToClose : true})
	}else{
		Notiflix.Notify.Failure("An unknown error has occured... We are sorry for that! Please contact the tech support!", {clickToClose : true})
	}
}
function successMessage(msg){
	Notiflix.Notify.Success(msg, {clickToClose : true})
}
function warningMessage(msg){
	Notiflix.Notify.Warning(msg, {clickToClose : true})
}
function Validate() {
	var password = document.getElementById("password").value;
	var confirmPassword = document.getElementById("rpassword").value;
	var privacy = $("#privacy");
	if (password != confirmPassword && !privacy.is(":checked")) {
		Notiflix.Notify.Warning('Passwords do not match!', {clickToClose : true}),
		Notiflix.Notify.Warning('You should accept the Terms!', {clickToClose : true})
	}else if (password != confirmPassword) {
		Notiflix.Notify.Warning('Passwords do not match!', {clickToClose : true})
	}else if (!privacy.is(":checked")) {
		Notiflix.Notify.Warning('You should accept the Terms!', {clickToClose : true})
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
function sendPOSTReqeust(form, event, url, hasMessage, message, redirect, destination){
	event.preventDefault();
	var data = $(form).serialize();

	$.ajax({
	url: url,
	type: "POST",
	data: data,
	dataType: "json",
	success: function(resp) {
		if(hasMessage){
			successMessage(message)
		}
		if(redirect){
			setTimeout(() => {
				window.location.href = destination;
			}, 1750)
		}
	},
	error: function(resp) {
		errorHandler(resp);
	}
	});
}
function checkQType(value, ans){
	if( ["checkbox", "checkbox_cf", "radio", "radio_cf"].includes($(value).val())){
		if($("div.ind-ans").length === 0 ){
			$("div#answers").append(ans);
		}
		$("div#btn-ans").show();
		$("div.scrollable-div").show();
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
function resetModal(){
	currentQuestion = null;
	$('input#_id').val('');
	$('textarea#question').val('');
	$('select#qtype').val('text');
	$("div#btn-ans").hide();
	$('div#answers>').remove();
}
function createQuestionSurvey(){

	//cleanup first
	$('#answers').children().remove()
	
	var questions = JSON.parse(sessionStorage.questions)
	var currentQuestion = questions[sessionStorage.currentQuestion]
	sessionStorage.currentQuestion = parseInt(sessionStorage.currentQuestion) + 1
	$("input#question-id").val(currentQuestion._id)
	//$('input#qtype-survey').val(currentQuestion.question_type)
	var qtypeInput = document.createElement('input')
		qtypeInput.setAttribute('type', 'hidden')
		qtypeInput.setAttribute('name', 'qtype')
		qtypeInput.setAttribute('id', 'qtype-survey')
		qtypeInput.setAttribute('value', currentQuestion.question_type)
	$('div#answers').append(qtypeInput)
	if(questions.length > sessionStorage.currentQuestion){
		$('div#survey-final').hide()
		$('div#survey-next').show()
	}else{
		$('div#survey-next').hide()
		$('div#survey-final').show()
	}
	$('h4#question').text(currentQuestion.text)
	$('div#answers').show()
	switch(currentQuestion.question_type){
		case 'text':{
			var div = document.createElement('div')
				div.className = 'ind-ans row my-1 w-100'
				$('div#answers').append(div)
			var input = document.createElement('input')
				input.setAttribute('type', 'text')
				input.setAttribute('name', 'ans')
				input.setAttribute('id', 'answer')
				input.className = 'answer-input'
				div.append(input)
			break;
		}
		case 'checkbox':{
			currentQuestion.answers.forEach((val ,index) => {
				makeAnswerElement(val, index, "checkbox")
			})
			break;
		}
		case 'radio':{
			currentQuestion.answers.forEach((val ,index) => {
				makeAnswerElement(val, index, "radio")
			})
			break;
		}
		case 'file':{
			var div = document.createElement('div')
				div.className = 'ind-ans row my-1 w-100'
				$('div#answers').append(div)
			currentQuestion.answers.forEach(() => {
				var input = document.createElement('file')
					input.setAttribute('type', 'radio')
					input.setAttribute('name', 'ans')
					input.setAttribute('id', 'currentQuestion._id')
					input.className = 'answer-input'
					div.append(input)
			})
			break;
		}
	}
}
function makeAnswerElement(val, index, qtype){
	var div = document.createElement('div')
	div.className = 'ind-ans row my-1 w-100'
	div.id = 'ind-ans-' + (index + 1)
	$('div#answers').append(div)
	var input = document.createElement('input')
		input.setAttribute('type', qtype)
		//input.setAttribute('hidden', true)
		input.setAttribute('name', 'ans')
		input.setAttribute('id', val._id)
		input.className = 'answer-input'
		div.append(input)
	var label = document.createElement('label')
		label.setAttribute('for', val._id)
		label.innerHTML = val.answer
		div.append(label)
}

//questions
function deleteQuestion(id){
	$.ajax({
		url: "/forms/create/question/delete",
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
function modifyQuestion(id){
	$.ajax({
		url: "/question/get",
		type: "POST",
		data: {'id' : id},
		dataType: "json",
		success: function(resp) {
			currentQuestion = resp
		},
		error: function(resp) {
			errorHandler(resp);
		}
	}).then(() => {
		$('input#_id').val(currentQuestion._id);
		$('textarea#question').val(currentQuestion.text);
		$('select#qtype').val(currentQuestion.question_type);
		$('div#answers>').remove();
		if(['checkbox', 'radio'].includes(currentQuestion.question_type)){
			$("div.scrollable-div").show();
			currentQuestion.answers.forEach(
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
		
		var regex = '^[0-9a-f]{12}[1-5][0-9a-f]{3}[89ab][0-9a-f]{15}$'
		if(window.location.pathname.split('/').splice(-1)[0].match(regex)){
			$('.answer-input').prop('disabled', true),
			$('.pill-del').hide(), $('.pill-grey').hide(), $('.pill-cyan').hide()
		}
	})
}
function addQuestion(){
	var question = $('textarea[name=question').val();
	var qtype = $('select[name=qtype]').val();
	var flags = [question === ''];
	var hasCurrentQuestion = currentQuestion != null;
	var isModified = false
	if(hasCurrentQuestion){
		isModified = !(question === currentQuestion.text && qtype === currentQuestion.question_type);
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
		warningMessage('All the input values should be filled!')
		warningMessage('The question should have a text!')
	} else if(flags[0]){
		warningMessage('The question should have a text!')
	} else if(flags[1]){
		warningMessage('All the input values should be fullfiled!')
	} else { 
		var formData = makeJSON(question, qtype, hasCurrentQuestion ? currentQuestion._id : null);
		
		console.log('ismodifice:', formData)
		$.ajax({
			url: isModified ? "/forms/create/question/update" : "/forms/create/question/add",
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
				console.log(resp)
				errorHandler(resp);
			}
			});
	}
}
function nextQuestion(){
	console.log("merge");
}
function makeFav(current){
	var currentSrc = current.src.split('/');
	startType = currentSrc[currentSrc.length - 1];
	var otherType = startType == 'star-grey.png' ? 'star-yellow.png' : 'star-grey.png';
	currentSrc[currentSrc.length - 1] = otherType;
	current.src = currentSrc.join('/');
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
		Notiflix.Notify.Warning('You should have at least 2 options!', {clickToClose : true})
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

//form
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
				successMessage(resp['success']),
				setTimeout(() => {
					window.location.href = "/forms/create/question/add";
				}, 1750);
			},
			error: function(resp) {
				errorHandler(resp);
			}
		});
	}
}
function modifyForm(id){
	session['session["form_title"]'] = id
	session['session["current_form_id"]'] = id
	window.location.href = '/forms/create/question/add'
}
function congrats(){
	successMessage('All changes has been saved!'),
	setTimeout(() => {
		window.location.href = "/forms/submit";
	}, 1750);
}

//survey
function storeCurrent(isLast){
	var question_id = $('input#question-id').val()
	var qtype = $("input#qtype-survey").val()
	var answer = {'question_id': question_id, 'question_type': qtype}
	var answers = sessionStorage.getItem('answers') === null ? [] : JSON.parse(sessionStorage.answers) 
	var inputValue = null
	switch(qtype){
		case 'text':{
			inputValue = $('input#answer').val()
			if(inputValue == ''){
				Notiflix.Notify.Warning('The answer cannot be empty!', {clickToClose : true})
			}else{
				answer['answer'] = inputValue
				answers.push(answer)
				sessionStorage.answers = JSON.stringify(answers)
				isLast ? sendSurvey() : createQuestionSurvey()
			}
			break
		}
		case 'file':{
			inputValue = $('input#answer').val()
			if(inputValue == ''){
				Notiflix.Notify.Warning('The answer cannot be empty!', {clickToClose : true})
			}else{
				answer['answer'] = inputValue
				answers.push(answer)
				sessionStorage.answers = JSON.stringify(answers)
				isLast ? sendSurvey() : createQuestionSurvey()
			}
			break
		}
		case 'checkbox':{
			inputValue = []
			var isChecked = false
			$('#answers div input').each((index, elem) => {
				if(elem.checked){
					isChecked = true
				}
				inputValue.push({'answer_id' : elem.id , 'isSelected' : elem.checked })
			})
			if(inputValue == [] || !isChecked){
				Notiflix.Notify.Warning('The answer cannot be empty!', {clickToClose : true})
				return
			}else{
				answer['answer'] = inputValue
				answers.push(answer)
				sessionStorage.answers = JSON.stringify(answers)
				isLast ? sendSurvey() : createQuestionSurvey()
			}
			break
		}
		case 'radio':{
			inputValue = $('input#answer').val()
			if(inputValue == ''){
				Notiflix.Notify.Warning('The answer cannot be empty!', {clickToClose : true})
			}else{
				answer['answer'] = inputValue
				answers.push(answer)
				sessionStorage.answers = JSON.stringify(answers)
				isLast ? sendSurvey() : createQuestionSurvey()
			}
			break
		}
	}
}

function sendSurvey(){
	data = {
		'form_id' : session.current_form_id,
		'answers' : sessionStorage.answers
	}
	console.log(data)
	$.ajax({
		url: '/survey',
		type: "POST",
		data: data,
		dataType: "json",
		success: function(resp) {
			window.location.href= '/survey/congrats';
		},
		error: function(resp) {
			errorHandler(resp);
		}

	})
}