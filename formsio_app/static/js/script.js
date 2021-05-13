var session;
var all_questions = []
$.ajax({
	url: '/session',
	type: "GET",
	dataType: "json",
	success: function(resp) {
		session = resp.session
	},
	error: function(resp) {
		errorHandler(resp);
	}
}).then(()=>{
	$(document).ready(function() {
		Notiflix.Notify.Init({
			clickToClose : true,
			timeout : 2000,
			warning : {
				background: 'rgb(238, 182, 27)',
				textColor:'#FFF',
			},
			success : {
				background:'rgb(90, 218, 126)',
				textColor:'#FFF',
			},
			failure : {
				background:'rgb(218, 98, 90)',
				textColor:'#FFF',
			},
			info : {
				background:'rgb(90, 210, 218)',
				textColor:'#FFF',
			},
		})
		Notiflix.Loading.Init({
			messageFontSize:"30px",
			customSvgUrl:'/static/assets/loading.svg',
			svgSize:"200px",
			svgColor:"rgb(90, 210, 218)",
			backgroundColor:"rgb(205, 241, 244)",
			messageColor:"rgb(255, 255, 255)"
		})
	
		if(window.innerWidth <= 425){
			Notiflix.Notify.Init({
				position: 'center-top'
			})
		}
		//init
		var currentQuestion = null;
		var redirectError = $("p#redirect-error").text()
		let initialAnswer = `
		<div class="ind-ans row my-1 w-100" id="ind-ans-1">
			<div class="col-10">
				<input type="text" class="answer-input" name="ans[1]" placeholder="answer...">
			</div>
			<div class="col-2" id="btn-ind-ans">
				<div class="btn-pill pill-del" onclick="removeCurrentAnswer(this)">&mdash;</div>
			</div>
		</div>
		<div class="ind-ans row my-1 w-100" id="ind-ans-2">
			<div class="col-10">
				<input type="text" class="answer-input" name="ans[2]" placeholder="answer...">
			</div>
			<div class="col-2" id="btn-ind-ans">
				<div class="btn-pill pill-del" onclick="removeCurrentAnswer(this)">&mdash;</div>
			</div>
		</div>`;
	
		switch(location.pathname){
			case '/signup': {
				var signupFields = ['name', 'email', 'password', 'rpassword']
				signupFields.forEach((elem) => {
					var currentInput = document.getElementById(elem)
					currentInput.addEventListener('input', function(e){
						if(e.target.value !== ''){
							currentInput.labels.item(0).style.display = "flex"
						}else{
							currentInput.labels.item(0).style.display = "none"
						}
					})
				})
				var confirmPassword = document.getElementById("rpassword")
				confirmPassword.addEventListener('input', function(e){
					var password = document.getElementById("password").value
					if(password && e.target.value){
						if(password === e.target.value){
							e.target.classList.add('correct-input')
						}else{
							e.target.classList.add('wrong-input')
						}
					}else{
						e.target.classList.remove('correct-input')
						e.target.classList.remove('wrong-input')
					}
				})
				break
			}
			case '/team/join' :{
				Notiflix.Loading.Custom('Loading...')
				$('.teams-container').hide()
				$.ajax({
					url: '/team/get',
					type: "GET",
					dataType: "json",
					success: function(resp) {
						var x = `<div class="wrapper-neon d-flex flex-column justify-content-around">
						<p class="neon">There is no team added!</p>
						<p class="neon">Add a team using the button below!</p>
						<input type="button" class="btn btn-primary button-neon" onclick="window.location.href='/team/add'" value="Add a team"/>
					</div>`
						if(resp.teams.length){
							resp.teams.forEach((elem, index) => {
								var html = makeTeamEntry(elem, index)
								$('#team-join').append(html)
							})
						}else{
							$('.teams-container').empty()
							$('.teams-container').append(x)
						}
						Notiflix.Loading.Remove(600)
						$('.teams-container').show()
					},
					error: function(resp) {
						errorHandler(resp);
					}
				})
				break
			}
			case '/survey': {
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
				break
			}
			case '/forms/all':{
				Notiflix.Loading.Custom('Loading...')
				$('.forms').hide()
				$.ajax({
					url: '/forms/all',
					type: "POST",
					dataType: "json",
					success: function(resp) {
						if(resp.forms.length){
							resp.forms.forEach((elem) => {
								var html = makeFormEntry(elem)
								$('#forms-list').append(html)
							})
						}else{
							$('.forms').empty()
							var div = document.createElement('div')
							div.setAttribute('class', 'center')
							var h1 = document.createElement('h1')
								h1.appendChild(document.createTextNode('You have no form created!'))
							var h3 = document.createElement('h3')
								h3.appendChild(document.createTextNode('Press the button below to create yout first form!'))
							var buttonsDiv = document.createElement('div')
								buttonsDiv.setAttribute('class', 'buttons no-forms_button')
							var button = document.createElement('div')
								button.setAttribute('class', 'btn-prm')
								button.addEventListener('click', (e)=>{
									window.location.href = '/forms/create'
								})
							button.appendChild(document.createTextNode('Create a form'))
							buttonsDiv.appendChild(button)
							div.appendChild(h1)	
							div.appendChild(h3)	
							div.appendChild(buttonsDiv)	
							$('.forms').append(div)
						}
						Notiflix.Loading.Remove(600)
						$('.forms').show()
					},
					error: function(resp) {
						errorHandler(resp);
					}
				})
				$('#share_button').on('click', function(e){$('.share_div').each((_, e) => {
					if(e.style.display === 'none'){
						e.style.display = 'block'
					}else{
					e.style.display = 'none'
					}
				})})
				$('#delete_button').on('click', function(e){$('.delete_div').each((_, e) => {
					if(e.style.display === 'none'){
						e.style.display = 'block'
					}else{
					e.style.display = 'none'
					}
				})})
				break
			}
			case'/forms/create/question/add':{
			
				Notiflix.Loading.Custom('Loading...')
				$('.wrapper-profile').hide()
	
				$.ajax({
					url: '/forms/desc',
					type: "GET",
					dataType: "json",
					success: function(resp) {
						$('#form-desc').val(resp.desc)
					},
					error: function(resp) {
						errorHandler(resp);
					}
				})
				$.ajax({
					url: '/forms/create/question/get',
					type: "POST",
					dataType: "json",
					success: function(resp) {
						if(resp.questions.length){
							resp.questions.forEach((question, index) => {
								all_questions.push(question)
								var html = makeQuestionEntry(question, index + 1)
								$('#questions').append(html)
							})
						}
						Notiflix.Loading.Remove(600)
						$('.wrapper-profile').show()
					},
					error: function(resp) {
						errorHandler(resp);
					}
				});
				checkQType($("select#qtype"), initialAnswer);
			
				if (!(redirectError === "")){
					Notiflix.Notify.Warning(redirectError)
				};
				$("select#qtype").on("change", function(){
					checkQType(this, initialAnswer);
				});
				$("i.trash").toggle();
				$('#form-title')
					.on('focusout', () => {
						var title = $('#form-title').val()
						if(title != session["form_title"] && session["form_title"] != null){
							changeTitleDesc(true)
						}
					})
				var description;
				$('#form-desc')
					.on('focusin', () => {
						description = $('#form-desc').val()
					})
					.on('focusout', () => {
						if(description !== $('#form-desc').val()){
							changeTitleDesc(false)
						}
					})
				Sortable.create(document.getElementById('questions'),{
					onEnd: function(event){
						aux_questions = []
						$('#questions>').each((id,elem) => {
							aux_questions.push(all_questions.find(quest => quest._id === elem.id))

							elem.children[0].children[0].children[0].innerText = id + 1
						})
						all_questions = aux_questions
					}
				})
				$('#next_step').on('click', function(e){
					e.preventDefault()
					if($('#questions>').length > 0){
						if($('#questions>')
							.toArray()
							.filter(elem => ['radio','checkbox']
												.includes(elem.childNodes[0].childNodes[1].childNodes[1].innerText)).length !== 0){
							$('#questions>').each((id, elem) => {
								if(['radio','checkbox'].includes(elem.childNodes[0].childNodes[1].childNodes[1].innerText)){
									elem.childNodes[1].childNodes[1].style.display = "block"
									var entries = elem.childNodes[1].childNodes[1].childNodes
									if($(`#trailing-${elem.id}>`).length === 0){
										entries.forEach((innerElem, id) => {
											var select = document.createElement('select')
												select.setAttribute('class', 'select-trailing')
												select.setAttribute('id', `trailing-${innerElem.childNodes[0].innerText}-${elem.id}`)
											var nullOption = document.createElement('option')
												nullOption.setAttribute('value', '')
											select.appendChild(nullOption)
				
											$('#questions>').each((index, question)=>{
												if(question.id !== elem.id){
													var option = document.createElement('option')
														option.setAttribute('value',question.id)
														option.innerText = question.childNodes[0].childNodes[0].innerText
													select.appendChild(option)
												}
											})
											elem.childNodes[1].childNodes[2].appendChild(select)
				
										})
									}
								}
							})
							$('#next_step').attr('id', 'final_step')
							$('#final_step').on('click', function(e){
								e.preventDefault()
							})
						}else{
							congrats()
						}
						
					}else{
						warningMessage('There should be questions to finish this form!')
					}
				})
				break
			}
			case "/forms/submit":{
				var span = document.createElement('span')
					span.appendChild(document.createTextNode('Copy the link'))
					$('#copylink_button').append(span)
				$('#copylink_button').on('click', function(e){
					const el = document.createElement('textarea');
					el.value = `${window.location.origin}/survey/${session.current_form_id}`;
					document.body.appendChild(el);
					el.select();
					document.execCommand('copy');
					document.body.removeChild(el);
					successMessage(`The link has been copied for the current form: ${session.form_title}`)
				})
				break
			}
			case `/forms/${session.current_form_id}`:{
				Notiflix.Loading.Custom('Loading...')
				$('.wrapper-profile').hide()
	
				$.ajax({
					url: '/forms/desc',
					type: "GET",
					dataType: "json",
					success: function(resp) {
						$('#form-desc').val(resp.desc)
					},
					error: function(resp) {
						errorHandler(resp);
					}
				})
				
				$.ajax({
					url: '/forms/create/question/get',
					type: "POST",
					dataType: "json",
					success: function(resp) {
						if(resp.questions.length){
							resp.questions.forEach((elem, index) => {
								var html = makeQuestionEntry(elem, index + 1)
								$('#questions').append(html)
							})
						}
						Notiflix.Loading.Remove(600)
						$('.wrapper-profile').show()
					},
					error: function(resp) {
						errorHandler(resp);
					}
				})

				$('#modify_button').on('click', function(e){
					e.preventDefault()
					e.stopPropagation()
					modifyForm(session.current_form_id)
				})

				break
			}
		}
		
		$("form#signup").on('submit', function(e){
			e.preventDefault()
			sendPOSTReqeust($(this), e, "/signup", true, 'Your account has been created succesfully', true, "/team")
		});
		$("form#login").on('submit', function(e){
			e.preventDefault()
			sendPOSTReqeust($(this), e, "/login", false, '', true, "/forms")
		});
		$("form#team-add").on('submit', function(e){
			e.preventDefault()
			sendPOSTReqeust($(this), e, "/team/add",true, 'The team was create successfuly', true, "/profile")
		});
		$("#team-join_button").on('click', function(e){
			e.preventDefault()
			sendPOSTReqeust($("input[name=team]:checked"), e, "/team/join",true, 'The new team was selected!', true, "/profile")
		});
		$("form#phone").on('submit', function(e){
			e.preventDefault()
			if($(this).val() !== ''){
				sendPOSTReqeust($(this), e, "/profile/phone",true, 'The phone was changed!', true, "/profile")
			}else{
				warningMessage('The field cannot be empty!')
			}
		});
		$("form#address").on('submit', function(e){
			e.preventDefault()
			if($(this).val() !== ''){
				sendPOSTReqeust($(this), e, "/profile/address",true, 'The address was changed!', true, "/profile")
			}else{
				warningMessage('The field cannot be empty!')
			}
		});
	
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
	
	});
})

//utils
function errorHandler(resp){
	if([206, 400, 401].includes(resp.status)){
		Notiflix.Notify.Failure(resp.responseJSON.error)
		console.error(resp.responseJSON.error)
	}else if([500, 0].includes(resp.status)){
		Notiflix.Notify.Failure("Server error! Ask tech support.")
	}else if(resp.status == 503){
		Notiflix.Notify.Failure("Server error! Request timed out...")
	}else{
		Notiflix.Notify.Failure("An unknown error has occured... We are sorry for that! Please contact the tech support!")
	}
}
function successMessage(msg){
	Notiflix.Notify.Success(msg)
}
function warningMessage(msg){
	Notiflix.Notify.Warning(msg)
}
function Validate() {
	const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	
	var name = document.getElementById('name').value
	var email = document.getElementById('email').value
	var password = document.getElementById("password").value
	var confirmPassword = document.getElementById("rpassword").value
	var privacy = document.getElementById("privacy").checked
	var notNullCheck = [
		{'name' : 'name', 'value': name, 'id' : 'name'},
		{'name' : 'email', 'value': email, 'id' : 'email'},
		{'name' : 'password', 'value': password, 'id' : 'password'},
		{'name' : 'confirm password', 'value': confirmPassword, 'id' : 'rpassword'}
	]
	var notNull = notNullCheck.filter(elem => elem.value === '')
	var ok = true
	if(email !== ''){
		if(!emailRegex.test(email)){
			Notiflix.Notify.Warning('The email is not valid!')
			ok = false
		}
	}
	if(password && confirmPassword){
		if(password !== confirmPassword){
			Notiflix.Notify.Warning('The confirm password is not correct!')
			ok = false
		}
	}
	if(!privacy){
		Notiflix.Notify.Warning('You should accept the terms!')
		ok = false
	}
	if(notNullCheck.map(elem => elem.value === '').some(elem => elem)){
		Notiflix.Notify.Warning(`The fields should be filled in!(${notNull.map(elem => elem.name).join(', ')})`)
		notNull.forEach(elem => {
			const docElem = document.getElementById(elem.id)
			docElem.classList.add('wrong-input')
			docElem.addEventListener('change', (event)=>{
				event.target.classList.remove('wrong-input')
			})
		})
		ok = false
	}
	
	return ok
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
	var data = $(form).serialize()
	$.ajax({
		url: url,
		type: "POST",
		data: data,
		dataType: "json",
		success: function(resp) {
			if(hasMessage){
				successMessage(message)
			}
			if(redirect && hasMessage){
				setTimeout(() => {
					window.location.href = destination;
				}, 1000)
			}else{
				window.location.href = destination
			}
		},
		error: function(resp) {
			errorHandler(resp);
		}
	})
}
function checkQType(value, ans){
	if( ["checkbox", "radio"].includes($(value).val())){
		if($("div.ind-ans").length === 0 ){
			$("div#answers").append(ans);
		}
		$("div#btn-ans").show();
		$("div#answers").show();
	}else{
		$("div#btn-ans").hide();
		$("div#answers").hide();
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

//team select
function makeTeamEntry(team, id){
	var div = document.createElement('div')
		div.className = 'form-check'

		div.addEventListener('click', (e)=>{
			e.stopPropagation()
			e.preventDefault()
	
			$('.form-check').each(((_, elem) => {elem.classList.remove('team-active')}))
			
			if(e.target.nodeName === 'LABEL'){
				e.target.parentNode.classList.add('team-active')
				e.target.parentNode.getElementsByTagName('input')[0].checked = true
	
			}else{
				e.target.classList.add('team-active')
				e.target.getElementsByTagName('input')[0].checked = true
			}
		})

	var input = document.createElement('input')
		input.setAttribute('class', 'radio-check')
		input.setAttribute('type', 'radio')
		input.setAttribute('name', 'team')
		input.setAttribute('id', `team${id}`)
		input.setAttribute('value', team._id)
		
	var label = document.createElement('label')
		label.setAttribute('class', 'form-check-label')
		label.setAttribute('for', `team${id}`)
		label.innerText = team.name

	div.appendChild(input)
	div.appendChild(label)

	if('user' in session){
		if('team' in session.user){
			if(session.user.team._id === team._id){
				input.checked = true
				input.parentNode.classList.add('team-active')
			}
		}
	}
	return div
}

//questions
function makeQuestionEntry(question, id){
	var div = document.createElement('div')
		div.setAttribute('class', 'question-entry')
		div.setAttribute('id', question._id)
	var firstDiv = document.createElement('div')
		firstDiv.setAttribute('class', 'question-entry_data')
	var noDiv = document.createElement('div')
		noDiv.setAttribute('class', 'handle btn-pill main-pill text-bold')
	var noSpan = document.createElement('span')
		noSpan.appendChild(document.createTextNode(id))
		noDiv.appendChild(noSpan)


	var attributesDiv = document.createElement('div')
		attributesDiv.setAttribute('class', 'question-atributes')
		
	var qnameDiv = document.createElement('div')
		qnameDiv.setAttribute('class', 'question-name')
	var qname = document.createElement('span')
		qname.setAttribute('class', 'text-justify question-text')
		qname.appendChild(document.createTextNode(question.text))
		qnameDiv.appendChild(qname)
	
	var qtypeDiv = document.createElement('div')
		qtypeDiv.setAttribute('class', 'question-type')
	var qtype = document.createElement('span')
		qtype.setAttribute('class', 'text-justify question-type')
		qtype.appendChild(document.createTextNode(question.question_type))
		qtypeDiv.appendChild(qtype)
		
		var answersDiv = document.createElement('div')
			answersDiv.setAttribute('class', 'questions-answers')
			answersDiv.setAttribute('id', `questions-answers-${question._id}`)
			answersDiv.style.display = 'none'

		attributesDiv.appendChild(qnameDiv)
		attributesDiv.appendChild(qtypeDiv)
		if(['radio', 'checkbox'].includes(question.question_type)){
			question.answers.forEach(elem => {
				var answersDivEntry = document.createElement('div')
					answersDivEntry.setAttribute('class', 'questions-answers_entry')
				var pos = document.createElement('div')
					pos.setAttribute('class', 'questions-answers_pos btn-pill main-pill')
				var pos_span = document.createElement('span')
					pos_span.appendChild(document.createTextNode(elem.ordinal_pos))
					pos.appendChild(pos_span)

				var text = document.createElement('div')
					text.setAttribute('class', 'questions-answers_text')
					
				var text_span = document.createElement('span')
					text_span.appendChild(document.createTextNode(elem.text))
					text.appendChild(text_span)
				answersDivEntry.appendChild(pos)
				answersDivEntry.appendChild(text)
				answersDiv.appendChild(answersDivEntry)
			})
			
			qnameDiv.addEventListener('click', (e)=>{
				e.preventDefault()
				e.stopPropagation()
				modifyQuestion(question._id)
			})
			qtypeDiv.addEventListener('click', (e)=>{
				e.preventDefault()
				e.stopPropagation()
				var docAnswers = document.getElementById(`questions-answers-${question._id}`)
				var trailingAnchor = document.getElementById(`trailing-${question._id}`)
				if(docAnswers.style.display === 'none'){
					docAnswers.style.display = 'block'
					trailingAnchor.style.display = 'flex'
				}else{
					docAnswers.style.display = 'none'
					trailingAnchor.style.display = 'none'
				}
			})
		}else{
			attributesDiv.addEventListener('click', (e)=>{
				e.preventDefault()
				e.stopPropagation()
				modifyQuestion(question._id)
			})
		}

	var icons = document.createElement('div')
		icons.setAttribute('class', 'icons')
	var img = document.createElement('img')
		img.setAttribute('src', '/static/assets/icons/' + (question.isFavourite ? 'star-yellow.png' : 'star-grey.png'))
		img.setAttribute('alt', question.isFavourite ? 'star-yellow' : 'star-grey')
		img.setAttribute('id', question.isFavourite ? 'fav' : 'not-fav')
		img.addEventListener('click',  (e) => {
			e.preventDefault()
			e.stopPropagation()
			makeFav(e.target)
		})
	var deleteDiv = document.createElement('div')
		deleteDiv.setAttribute('class', 'trash_div')
		deleteDiv.addEventListener('click',  (e) => {
			e.preventDefault()
			e.stopPropagation()
			deleteQuestion(question._id)
		})
	var deleteIcon = document.createElement('i')
		deleteIcon.setAttribute('class', 'fas fa-trash trash')

		deleteDiv.appendChild(deleteIcon)

		icons.appendChild(img)
		icons.appendChild(deleteDiv)

	firstDiv.appendChild(noDiv)
	firstDiv.appendChild(attributesDiv)
	firstDiv.appendChild(icons)
	
	var secondDiv = document.createElement('div')
		secondDiv.setAttribute('class', 'question-entry_data')
	secondDiv.appendChild(document.createElement('div'))
	secondDiv.appendChild(answersDiv)
	var trailing = document.createElement('div')
		trailing.setAttribute('class', `trailing`)
		trailing.setAttribute('id', `trailing-${question._id}`)
		trailing.style.display = 'flex'
	secondDiv.appendChild(trailing)

	div.appendChild(firstDiv) 
	div.appendChild(secondDiv) 
	return div
}
function deleteQuestion(id){
	$.ajax({
		url: "/forms/create/question/delete",
		type: "POST",
		data: {'id' : id},
		dataType: "json",
		success: function(resp) {
			successMessage('The question has been deleted succesfully!')
			$(`div#${id}`).remove()
			$('#questions>').each((id,elem) => {elem.children[0].children[0].children[0].innerText = id + 1})
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
		$("div#btn-ans").hide();
		$("div#answers").hide();
		if(['checkbox', 'radio'].includes(currentQuestion.question_type)){
			$("div#answers").show();
			$("div#btn-ans").show();
			currentQuestion.answers.forEach(
				(element, index) => {
					var div = document.createElement('div')
					div.id = 'ind-ans-' + element.ordinal_pos
					div.className = 'ind-ans row my-1 w-100'
					$('div#answers').append(div)
		
					//col-10
					var col_10 = document.createElement('div')
					col_10.className = 'col-10'
					div.appendChild(col_10)
		
					var input = document.createElement('input')
					input.setAttribute('type', 'text')
					input.setAttribute('name', 'ans[' + (index + 1) + ']')
					input.setAttribute('value', element.text)
					input.className = 'answer-input'
					col_10.appendChild(input)
		
					//col-2
					var col_2 = document.createElement('div')
					col_2.className = 'col-2'
					col_2.id = 'btn-ind-ans'
					div.appendChild(col_2)
		
					// var btn1 = document.createElement('div')
					// btn1.className = 'btn-pill pill-cyan'
					// btn1.id = 'pill-cyan'
					// btn1.setAttribute('onclick', 'switchButtons(this)')
					// col_2.appendChild(btn1)
		
					// var btn2 = document.createElement('div')
					// btn2.className = 'btn-pill pill-grey'
					// btn2.id = 'pill-grey'
					// btn2.setAttribute('onclick', 'switchButtons(this)')
					// col_2.appendChild(btn2)
		
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
			$('.answer-input').prop('disabled', true), $('.pill-del').hide()
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
		$.ajax({
			url: isModified ? "/forms/create/question/update" : "/forms/create/question/add",
			type: "POST",
			data: formData,
			dataType: "json",
			success: function(resp) {
				$('#exampleModal').toggle()
				successMessage(isModified ? 'The question has been updated succesfully!' : 'The question has been sent succesfully!')
				$('#questions').append(makeQuestionEntry(resp, $('#questions>').length + 1))
				$('#exampleModal').modal('hide')
				if(isModified){
					var questionIndex = all_questions.findIndex(elem => elem._id === resp._id)
					if(questionIndex >= 0){
						all_questions[questionIndex] = resp
					}else{
						all_questions.push(resp)
					}
				}else{
					all_questions.push(resp)
				}
			},
			error: function(resp) {
				errorHandler(resp);
			}
			});
	}
}
function makeFav(current){
	var id = current.parentNode.parentNode.parentNode.id
	$.ajax({
		url: "/question/fav",
		type: "POST",
		data: {'id' : id },
		dataType: "json",
		success: function(resp) {
			var currentSrc = current.src.split('/')
			startType = currentSrc[currentSrc.length - 1]
			var otherType = startType === 'star-grey.png' ? 'star-yellow.png' : 'star-grey.png'
			currentSrc[currentSrc.length - 1] = otherType
			current.src = currentSrc.join('/')
		},
		error: function(resp) {
			errorHandler(resp);
		}
	});
}

//add questions popup
// function switchButtons(current){
// 	var currentButton = current.id;
// 	var parent = current.parentNode.parentNode.id;
// 	var otherButton = ((currentButton === 'pill-grey') ? 'pill-cyan' : 'pill-grey');

// 	var currentButtonSelect = $('div#' + parent + ' > div#btn-ind-ans > ' + 'div#' + currentButton);
// 	var otherButtonSelect = $('div#' + parent + ' > div#btn-ind-ans > ' + 'div#' + otherButton);

// 	currentButtonSelect.hide();
// 	otherButtonSelect.show();
// }
function removeCurrentAnswer(current){
	var parent = current.parentNode.parentNode.id;

	var parentSelect = $('div#' + parent);
	if($("div.ind-ans").length > 2){
		parentSelect.remove();
	}else{
		Notiflix.Notify.Warning('You should have at least 2 options!')
	}
}
function addNewAnswer(){
	if(['radio','checkbox'].includes($('select[name=qtype]').val())){
		var value = ($("div.ind-ans").length == 0) ? 1 : parseInt($("div.ind-ans")[$("div.ind-ans").length - 1].id.split('-')[$("div.ind-ans")[$("div.ind-ans").length - 1].id.split('-').length - 1]) + 1;
		var newAnswer = `<div class="ind-ans row my-1 w-100" id="ind-ans-${ value }">
		<div class="col-10">
		<input type="text" class="answer-input" name="ans[${ value }]" placeholder="answer...">
	</div>
	<div class="col-2" id="btn-ind-ans">
		<div class="btn-pill pill-del" onclick="removeCurrentAnswer(this)">&mdash;</div>
	</div>
	</div>`;
		$("div#answers").append(newAnswer)
	}
}

//form
function makeFormEntry(form){
	var div = document.createElement('div')
		div.setAttribute('class', 'list-item-rounded')
		div.setAttribute('id', form._id)
		div.addEventListener('click', (e)=>{
			window.location.href = `/forms/${form._id}`
		})
	var span = document.createElement('span')
		span.setAttribute('class', 'list-item_span')
		span.appendChild(document.createTextNode(form.title))

	var shareDiv = document.createElement('div')
		shareDiv.setAttribute('class','share_div')
	var shareIcon = document.createElement('i')
		shareIcon.setAttribute('class', 'fas fa-share-alt')
		shareDiv.appendChild(shareIcon)
		shareDiv.style.display = 'none'

	var deleteDiv = document.createElement('div')
		deleteDiv.setAttribute('class','delete_div')
	var deleteIcon = document.createElement('i')
		deleteIcon.setAttribute('class', 'fas fa-trash')
		deleteDiv.appendChild(deleteIcon)
		deleteDiv.style.display = 'none'

	var divAlternative = document.createElement('div')
		divAlternative.setAttribute('class', 'alternative')
		divAlternative.setAttribute('id', 'alternative')
		divAlternative.appendChild(shareDiv)
		divAlternative.appendChild(deleteDiv)
	
	var spanDiv = document.createElement('div')
		spanDiv.setAttribute('class', 'form-name')
		spanDiv.appendChild(span)

	div.appendChild(document.createElement('div'))
	div.appendChild(spanDiv)
	div.appendChild(divAlternative)

	return div
}
function submitForm(){
	var title = $('#form-title').val();
	var desc = $('#form-desc').val();
	if( title == ""){
		warningMessage("The form should have a title ")
		$('#form-title')[0].classList.add('alerts-border')
		setTimeout(() => {
			$('#form-title')[0].classList.remove('alerts-border')
		}, 2000)
	}else{
		$.ajax({
			url: "/forms/submit",
			type: "POST",
			data: {'title' : title, 'desc' : desc},
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
function changeTitleDesc(isTitle){
	var title = $('#form-title').val();
	var desc = $('#form-desc').val();
	if( title == ""){
		warningMessage("The form should have a title ")
		$('#form-title')[0].classList.add('alerts-border')
		setTimeout(() => {
			$('#form-title')[0].classList.remove('alerts-border')
		}, 2000)
	}else{
		$.ajax({
			url: isTitle ? "/forms/title" : '/forms/desc',
			type: "POST",
			data: isTitle ? {'title' : title} : {'desc' : desc},
			dataType: "json",
			success: function(resp) {
				successMessage(resp['success'])
			},
			error: function(resp) {
				errorHandler(resp);
			}
		})
	}
}
function modifyForm(id){
	session.form_title = id
	session.current_form_id = id
	window.location.href = '/forms/create/question/add'
}
function congrats(){
	var ids = []
	all_questions.forEach( elem => {ids.push(elem._id)})
	$.ajax({
		url: '/form/finish',
		type: "POST",
		data: {'ids' : ids},
		dataType: "json",
		success: function(resp) {
			successMessage('All changes has been saved!'),
			setTimeout(() => {
				window.location.href = "/forms/submit";
			}, 1750);
		},
		error: function(resp) {
			errorHandler(resp);
		}
	})
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
				Notiflix.Notify.Warning('The answer cannot be empty!')
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
				Notiflix.Notify.Warning('The answer cannot be empty!')
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
				Notiflix.Notify.Warning('The answer cannot be empty!')
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
				Notiflix.Notify.Warning('The answer cannot be empty!')
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