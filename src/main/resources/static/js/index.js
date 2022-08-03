const selectedTypeButton = document.querySelector(".selected-type-button");
const typeSelectBoxList = document.querySelector(".type-select-box-list");
const typeSelecteBoxListLis = typeSelectBoxList.querySelectorAll("li");
const todoContentList = document.querySelector(".todo-content-list");
const sectionBody = document.querySelector(".section-body");
const incompleteCountNumber = document.querySelector(".incomplete-count-number");
	
let page = 1;
let totalPage = 0;

sectionBody.onscroll = () => {
	console.log("sectionBody : " + sectionBody.offsetHeight);
	console.log("\tscrollTop : " + sectionBody.scrollTop);
	console.log("\t\ttodoContentList height : " + todoContentList.clientHeight);
	
	let checkNum = todoContentList.clientHeight - sectionBody.offsetHeight - sectionBody.scrollTop;
	
	console.log("\t\t\t\t\t\t\t\tpage = " + page);
	console.log("\t\t\t\t\t\t\t\t totalePage = " + totalPage);
	
	if(checkNum < 50 && checkNum > -50 && page < totalPage){
		//console.log("\t\t\t\t\t\t\t\tpage = " + page);
		//console.log("\t\t\t\t\t\t\t\t totalePage = " + totalPage);
		alert("새로운 리스트 추가로 가져오기");	
		page++;
		load();
	}
}

let listType = "all";
load();

selectedTypeButton.onclick = () => {
    typeSelectBoxList.classList.toggle("visible");
}

//selectedTypeButton.onblur = () => {
//    typeSelectBoxList.classList.toggle("visible");
//}


for(let i = 0; i < typeSelecteBoxListLis.length; i++){
	typeSelecteBoxListLis[i].onclick = () => {
		//alert(i);
		page = 1;
		for(let i = 0; i < typeSelecteBoxListLis.length;i++){
			typeSelecteBoxListLis[i].classList.remove("type-selected");	
		}
		
		const selectedType = document.querySelector(".selected-type");
		//console.log("selectedType = " + selectedType);
		
		typeSelecteBoxListLis[i].classList.add("type-selected");
		//console.log("typeSelecteBoxListLis[i] = " + typeSelecteBoxListLis[i]);
		
		listType = typeSelecteBoxListLis[i].textContent.toLowerCase();
		//console.log("listType = " + listType);
		
		selectedType.textContent = typeSelecteBoxListLis[i].textContent;
		//console.log("typeSelecteBoxListLis[i].textContent = " + typeSelecteBoxListLis[i].textContent);
		//console.log("selectedType.textContent = " + selectedType.textContent);
		
		todoContentList.innerHTML = "";
		//console.log();
		load();
		
		typeSelectBoxList.classList.toggle("visible");
	}
}


function load(){
	$.ajax({
		type:"get",
		url:`/api/v1/todolist/list/${listType}`,
		async: false,
		data: {
			"page": page,
			contentCount: 20
		},
		dataType: "json",
		success: (response) => {
			//console.log(JSON.stringify(response));
			getList(response.data);
		},
		error: errorMessage
	})
}

function setTotalCount(totalCount) {
	totalPage = totalCount % 20 == 0 ? totalCount/20 : Math.floor(totalCount/20)+1;
}

function getList(data){
	incompleteCountNumber.textContent = data[0].incompleteCount;
	setTotalCount(data[0].totalCount);
	
	for(let content of data) {
		//console.log(list.todoCode);
		const listContent = `
			<li class="todo-content">
                        <input type="checkbox" id="complete-check-${content.todoCode}" class="complete-check" ${content.todoComplete ? 'checked':''}>
                        <label for="complete-check-${content.todoCode}"></label>
                        <div class="todo-content-text">${content.todo}</div>
                        <input type="text" class="todo-content-input visible" value="${content.todo}">
                        <input type="checkbox" id="importance-check-${content.todoCode}" class="importance-check" ${content.importance ? 'checked':''}>
                        <label for="importance-check-${content.todoCode}"></label>
                        <div class="trash-button"><i class="fa-solid fa-trash"></i></div>
                    </li>
		`
		todoContentList.innerHTML += listContent;
	}
	
	addEvent();
}

function addEvent(){
	const todoContents = document.querySelectorAll(".todo-content");
	for(let i = 0 ; i < todoContents.length; i++){
		let todoCode = todoContents[i].querySelector(".complete-check").getAttribute("id");

		let index = todoCode.lastIndexOf("-");
		todoCode = todoCode.substring(index + 1);	

		//console.log("todoCode : " + todoCode);
			
		todoContents[i].querySelector(".complete-check").onchange = () => {
			let incompleteCount = parseInt(incompleteCountNumber.textContent)

			if(todoContents[i].querySelector(".complete-check").checked){
				incompleteCountNumber.textContent = incompleteCount - 1;
			}else {
				incompleteCountNumber.textContent = incompleteCount + 1;				
			}
			updateCheckStatus("complete",todoContents[i], todoCode);
		}
		
		todoContents[i].querySelector(".importance-check").onchange = () => {
			updateCheckStatus("importance",todoContents[i], todoCode);
			
		}
		
		todoContents[i].querySelector(".trash-button").onclick = () => {
			deleteTodo(todoContents[i], todoCode);
		}
		
		const todoContentText = todoContents[i].querySelector(".todo-content-text");
		const todoContentInput = todoContents[i].querySelector(".todo-content-input");
		let todoContentValue = null;
		
		let eventFlag = false;
		
		//todoContentText.onclick = (e) => {
		//	e.target.classList.toggle("visible");
		//	todoContentInput.classList.toggle("visible");
		//}
		
		todoContentText.onclick = () => {
			todoContentValue = todoContentInput.value;
			todoContentText.classList.toggle("visible");
			todoContentInput.classList.toggle("visible");
			todoContentInput.focus();
			eventFlag = true;
		}
		
		let updateTodoContent = () => {
			// 내용이 변경되었다면
			if(todoContentValue != todoContentInput.value){
					//alert("수정 요청");
					$.ajax({
						type:"put",
						url:`/api/v1/todolist/todo/${todoCode}`,
						contentType: "application/json",
						data: JSON.stringify({
							"todoCode": todoCode,
							todo: todoContentInput.value
							}),
						async: false,
						dataType: "JSON",
						success: (response) => {
							if(response.data){
								todoContentText.textContent = todoContentInput.value;
							}
						},
						error:errorMessage
					})		
				}
				todoContentText.classList.toggle("visible");
				todoContentInput.classList.toggle("visible");
		}
		
		todoContentInput.onblur = () => {
			if(eventFlag){			
				updateTodoContent();
			}
		}
		
		todoContentInput.onkeyup = () => {
			if(window.event.keyCode == 13){
				eventFlag = false;
				updateTodoContent();	
			}			
		}
		
	}
}

function updateStatus(type, todoCode){
	result = false;
	
	$.ajax({
		type: "put",
		url: `/api/v1/todolist/${type}/todo/${todoCode}`,
		async: false,		
		dataType : 'json',
		success: (response) => {
			result = response.data
		},
		error: errorMessage
	})
	return result;
}

function updateCheckStatus(type, todoContent, todoCode){
	let result = updateStatus(type, todoCode);
	
//	if((listType == "complete" || listType == "incomplete" || listType == "importance") && result){
	if(((type == "complete" && (listType == "complete" || listType == "incomplete")) 
			|| (type == "importance" && listType == "importance")) && result){
		todoContentList.removeChild(todoContent);
	}
}

function deleteTodo(todoContent, todoCode){
	$.ajax({
		type: "delete",
		url: `/api/v1/todolist/todo/${todoCode}`,
		async: false,
		dataType: "json",
		success:(response)=>{
			if(response.data){
				todoContentList.removeChild(todoContent);	
			}
		},
		error:errorMessage
	})
}

function errorMessage(request, status, error){
	alert("요청 실패");
	console.log(request.status);
	console.log(request.responseText);
	console.log(error);
}