const selectedTypeButton = document.querySelector(".selected-type-button");
const typeSelectBoxList = document.querySelector(".type-select-box-list");

selectedTypeButton.onclick = () => {
    typeSelectBoxList.classList.toggle("visible");
}

selectedTypeButton.onblur = () => {
    typeSelectBoxList.classList.toggle("visible");
}