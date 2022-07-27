package com.jaewon.todolist.service.todo;

import java.util.List;

import com.jaewon.todolist.web.dto.todo.CreateTodoReqDto;
import com.jaewon.todolist.web.dto.todo.TodoListRespDto;
import com.jaewon.todolist.web.dto.todo.UpdateTodoReqDto;

public interface TodoService {
	//추가
	public boolean createTodo(CreateTodoReqDto createTodoReqDto) throws Exception;

	//조회
	public List<TodoListRespDto> getTodoList(int page, int contentCount) throws Exception;
	//importance 조회
	public List<TodoListRespDto> getImportanceTodoList(int page, int contentCount) throws Exception;
	
	//수정
	public boolean updateTodoComplete(int todoCode) throws Exception;
	public boolean updateTodoImportance(int todoCode) throws Exception;
	public boolean updateTodo(UpdateTodoReqDto updateTodoReqDto) throws Exception;
	
	//삭제
	public boolean removeTodo(int todoCode) throws Exception;
}
