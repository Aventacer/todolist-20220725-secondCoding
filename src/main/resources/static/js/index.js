const selectedTypeButton = document.querySelector(".selected-type-button");
const typeSelectBoxList = document.querySelector(".type-select-box-list");
const typeSelecteBoxListLis = typeSelectBoxList.querySelectorAll("li");
const todoContentList = document.querySelector(".todo-content-list");
const sectionBody = document.querySelector(".section-body");
const incompleteCountNumber = document.querySelector(".incomplete-count-number");
const modalContainer = document.querySelector(".modal-container");
const todoAddButton = document.querySelector(".todo-add-button");
/* 
순서
1. 게시글 불러오기
	1) todoList의 type이 무엇인가 중요함
		- all, complete, incomplete, importance
	2) 요청주소: /api/v1/todolist/list/{type}?page=페이지번호&content=게시글 개수(몇개들고올건지)
	3) AJAX 요청을 활용
		- type : get
		- url: 요청주소
		- data: 객체 -> {ket : value 형태로} {page : 1, contentCount: 20}
		- dataType: 응답받을 데이터의 타입 -> "JSON"
		- success: 함수 -> response 매개변수(CMRespDTO)를 받아야함.
		- error: 함수 -> 요청실패 request, status, error
			-- 400대 에러의 경우
				--- 매개변수 타입이 잘못된 경우
				--- 요청 리소스가 잘못된 경우 
				--- 권한이 없어서 요청을 하지 못하는 경우
				--- ContentType 
					-> text/html
					-> text/plain
					-> application/json
				--- enctype : multipart/form-data
			-- 500대 에러의 경우
				--- !! 가장 먼저 해야하는 것 => (eclipse의)console창 에러의 가장 위 쪽이면서 가장 오른쪽 확인
				--- 오타
				--- nullPointer
				--- SQL 쿼리문 문제
				--- indexOut
				--- di 잘못됬을때
				--- @component(Controller, RestController, Service, Mapper, Repository, Configuration) IoC에 등록 안되어있을때
				--- Interface 겹칠 때, bean 객체가 IoC에 여러개 생성되어 있을 때

*/

let totalPage = 0;
let page = 1;
let listType = "all";

load();



function setTotalPage(totalCount) {
	totalPage = totalCount % 20 == 0 ? totalCount / 20 : Math.floor(totalCount / 20) + 1;
}

function setIncompleteCount(incompleteCount) {
	incompleteCountNumber.textContent = incompleteCount;
}

function appendList(listContent) {
	todoContentList.innerHTML += listContent;
}


function updateCheckStatus(type, todoContent, todoCode) {
	let result = updateStatus(type, todoCode);

	if (((type == "complete" && (listType == "complete" || listType == "incomplete"))
		|| (type == "importance" && listType == "importance")) && result) {
		todoContentList.removeChild(todoContent);
	}
}

function addCompleteEvent(todoContent, todoCode){
	const completeCheck = todoContent.querySelector(".complete-check");
	
	completeCheck.onchange = () => {
		let incompleteCount = parseInt(incompleteCountNumber.textContent);

		if (completeCheck.checked) {
			incompleteCountNumber.textContent = incompleteCount - 1;
		} else {
			incompleteCountNumber.textContent = incompleteCount + 1;
		}
		updateCheckStatus("complete", todoContent, todoCode);
	}	
}

function addImportanceEvent(todoContent, todoCode){
	const importanceCheck = todoContent.querySelector(".importance-check");
	importanceCheck.onchange = () => {
		updateCheckStatus("importance", todoContent, todoCode);
	}
}

function addDeleteEvent(todoContent, todoCode){
	const trashButton = todoContent.querySelector(".trash-button");
	trashButton.onclick = () => {
		deleteTodo(todoContent, todoCode);
	}
}

function addContentInputEvent(todoContent, todoCode) {
	const todoContentText = todoContent.querySelector(".todo-content-text");
	const todoContentInput = todoContent.querySelector(".todo-content-input");
	let todoContentOldValue = null;

	let eventFlag = false;

	let updateTodo = () => {
		const todoContentNewValue = todoContentInput.value;
		
		// 내용이 변경되었다면
		if (getChangeStatusOfValue(todoContentOldValue, todoContentNewValue)) {
			if(updateTodoContent(todoCode, todoContentNewValue)){
				todoContentText.textContent = todoContentNewValue;
			}		
		}
		todoContentText.classList.toggle("visible");
		todoContentInput.classList.toggle("visible");
	}
	
	todoContentText.onclick = () => {
		todoContentOldValue = todoContentInput.value;
		todoContentText.classList.toggle("visible");
		todoContentInput.classList.toggle("visible");
		todoContentInput.focus();
		eventFlag = true;
	}


	todoContentInput.onblur = () => {
		if (eventFlag) {
			updateTodo();	
		}
	}

	todoContentInput.onkeyup = () => {
		if (window.event.keyCode == 13) {
			eventFlag = false;
			updateTodo();	
		}
	}
}

function getChangeStatusOfValue(originValue, newValue){
	return originValue != newValue;
}



function substringTodoCode(todoContent){
	const completeCheck = todoContent.querySelector(".complete-check");
	
	const todoCode = completeCheck.getAttribute("id");
	const tokenIndex = todoCode.lastIndexOf("-");
	
	return todoCode.substring(tokenIndex + 1);	
}

function addEvent() {
	const todoContents = document.querySelectorAll(".todo-content");
	
	for (let todoContent of todoContents) {
		const todoCode = substringTodoCode(todoContent);	

		addCompleteEvent(todoContent, todoCode);
		addImportanceEvent(todoContent, todoCode);
		addDeleteEvent(todoContent, todoCode);
		addContentInputEvent(todoContent, todoCode);
	}
}

function createList(todoList) {
	for (let content of todoList) {
		//console.log(list.todoCode);
		const listContent = `
			<li class="todo-content">
                        <input type="checkbox" id="complete-check-${content.todoCode}" class="complete-check" ${content.todoComplete ? 'checked' : ''}>
                        <label for="complete-check-${content.todoCode}"></label>
                        <div class="todo-content-text">${content.todo}</div>
                        <input type="text" class="todo-content-input visible" value="${content.todo}">
                        <input type="checkbox" id="importance-check-${content.todoCode}" class="importance-check" ${content.importance ? 'checked' : ''}>
                        <label for="importance-check-${content.todoCode}"></label>
                        <div class="trash-button"><i class="fa-solid fa-trash"></i></div>
                    </li>
		`
		appendList(listContent);
	}
	addEvent();
}


sectionBody.onscroll = () => {
	console.log("sectionBody : " + sectionBody.offsetHeight);
	console.log("\tscrollTop : " + sectionBody.scrollTop);
	console.log("\t\ttodoContentList height : " + todoContentList.clientHeight);

	let checkNum = todoContentList.clientHeight - sectionBody.offsetHeight - sectionBody.scrollTop;

	console.log("\t\t\t\t\t\t\t\tpage = " + page);
	console.log("\t\t\t\t\t\t\t\t totalePage = " + totalPage);

	if (checkNum < 50 && checkNum > -50 && page < totalPage) {
		//console.log("\t\t\t\t\t\t\t\tpage = " + page);
		//console.log("\t\t\t\t\t\t\t\t totalePage = " + totalPage);
		alert("새로운 리스트 추가로 가져오기");
		page++;
		load();
	}
}

selectedTypeButton.onclick = () => {
	typeSelectBoxList.classList.toggle("visible");
}

function resetPage(){
	page = 1;
}

function removeAllclassList(elements, className){
	for (let element of elements) {
		element.classList.remove(className);
	}	
}

function setListType(selectedType){
	listType = selectedType.toLowerCase();	
}

function clearTodoContentList(){
	todoContentList.innerHTML = "";	
}

for (let i = 0; i < typeSelecteBoxListLis.length; i++) {
	typeSelecteBoxListLis[i].onclick = () => {
		resetPage();
		
		removeAllclassList(typeSelecteBoxListLis, "type-selected");

		typeSelecteBoxListLis[i].classList.add("type-selected");
		
		setListType(typeSelecteBoxListLis[i].textContent);
		
		const selectedType = document.querySelector(".selected-type");
		
		selectedType.textContent = typeSelecteBoxListLis[i].textContent;
		
		clearTodoContentList();

		load();

		typeSelectBoxList.classList.toggle("visible");
	}
}

todoAddButton.onclick = () => {
	alert("todoAddButton");
	modalContainer.classList.toggle("modal-visible");
	todoContentList.style.overflow = "hidden";
	setModalEvent();
}

function clearModalTodoInputValue(modalTodoInput) {
	modalTodoInput.value = "";
}

function uncheckedImportance(importanceFlag){
	importanceFlag.checked = false;
}

function setModalEvent() {
	const modalCloseButton = modalContainer.querySelector(".modal-close-button");
	const importanceFlag = modalContainer.querySelector(".importance-check");
	const modalTodoInput = modalContainer.querySelector(".modal-todo-input");
	const modalCommitButton = modalContainer.querySelector(".modal-commit-button"); 
	
	modalContainer.onclick = (e) => {
		if(e.target == modalContainer){
			modalCloseButton.click();
		}
	}

	modalCloseButton.onclick = () => {
		modalContainer.classList.toggle("modal-visible");
		todoContentList.style.overflow = "auto";
		uncheckedImportance(importanceFlag);
		clearModalTodoInputValue(modalTodoInput);
	}
	
	modalTodoInput.onkeyup = () => {
		if(window.event.keyCode == 13){
			modalCommitButton.click();
		}
	}

	modalCommitButton.onclick = () => {
		data = {
			importance: importanceFlag.checked,
			todo: modalTodoInput.Value
		}
		addTodo(data);
		modalCloseButton.click();
	}
	
}

////////////////////////// <<< REQUEST >>> ///////////////////////////////

function load() {
	$.ajax({
		type: "get",
		url: `/api/v1/todolist/list/${listType}`,
		async: false,
		data: {
			"page": page,
			contentCount: 20
		},
		dataType: "json",
		success: (response) => {
			//console.log(JSON.stringify(response));

			//			createList(response.data);

			const todoList = response.data;

			setTotalPage(todoList[0].totalCount);
			setIncompleteCount(todoList[0].incompleteCount)
			createList(todoList);
		},
		error: errorMessage
	})
}

function updateStatus(type, todoCode) {
	result = false;

	$.ajax({
		type: "put",
		url: `/api/v1/todolist/${type}/todo/${todoCode}`,
		async: false,
		dataType: 'json',
		success: (response) => {
			result = response.data
		},
		error: errorMessage
	})
	return result;
}


function updateTodoContent(todoCode, todo) {
	let successFlag = false;
	$.ajax({
		type: "put",
		url: `/api/v1/todolist/todo/${todoCode}`,
		contentType: "application/json",
		data: JSON.stringify({
			"todoCode": todoCode,
			"todo": todo
		}),
		async: false,
		dataType: "JSON",
		success: (response) => {
			successFlag = response.data;
		},
		error: errorMessage
	})
	return successFlag;
}

function deleteTodo(todoContent, todoCode) {
	$.ajax({
		type: "delete",
		url: `/api/v1/todolist/todo/${todoCode}`,
		async: false,
		dataType: "json",
		success: (response) => {
			if (response.data) {
				todoContentList.removeChild(todoContent);
			}
		},
		error: errorMessage
	})
}

function addTodo(data){
	$.ajax({
		type: "post",
		url: "api/v1/todolist/todo",
		currentType: "application/json",
		data: JSON.stringify(data),
		async: false,
		dataType: "json",
		success: (response) => {
			if(response.data) {
				clearTodoContentList();
		
				load();
			}
		},
		error:errorMessage
	})
}

function errorMessage(request, status, error) {
	alert("요청 실패");
	console.log(request.status);
	console.log(request.responseText);
	console.log(error);
}