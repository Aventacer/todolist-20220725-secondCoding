const selectedTypeButton = document.querySelector(".selected-type-button");
const typeSelectBoxList = document.querySelector(".type-select-box-list");

let listType = "all";
load();

selectedTypeButton.onclick = () => {
    typeSelectBoxList.classList.toggle("visible");
}

selectedTypeButton.onblur = () => {
    typeSelectBoxList.classList.toggle("visible");
}


function load(){
	$.ajax({
		type:"get",
		url:`/api/v1/todolist/list/${listType}`,
		data: {
			page: 1,
			contentCount: 20
		},
		dataType: "json",
		success: (response) => {
			console.log(JSON.stringify(response));
			getList(response.data);
		},
		error: errorMessage
	})
}

function getList(data){
	const todoContentList = document.querySelector(".todo-content-list");
	for(let content of data) {
		//console.log(list.todoCode);
		const listContent = `
			<li class="todo-content">
                        <input type="checkbox" id="complete-check-${content.todoCode}" class="complete-check" ${content.todoComplete ? 'checked':''}>
                        <label for="complete-check-${content.todoCode}"></label>
                        <div class="todo-content-text">${content.todo}오늘의 할 일aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                        <input type="text" class="todo-content-input visible" value="${content.todo}">
                        <input type="checkbox" id="importance-check-${content.todoCode}" class="importance-check" ${content.importance ? 'checked':''}>
                        <label for="importance-check-${content.todoCode}"></label>
                        <div class="trash-button"><i class="fa-solid fa-trash"></i></div>
                    </li>
		`
		todoContentList.innerHTML += listContent;
	}
}

function errorMessage(request, status, error){
	alert("요청 실패");
	console.log(request.status);
	console.log(request.responseText);
	console.log(error);
}