// Get references to DOM elements
const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const todoList = document.getElementById("todoList");

// Load tasks from local storage on page load
document.addEventListener("DOMContentLoaded", loadTodos);

// Add event listener to the "Add Todo" button
addTodoBtn.addEventListener("click", addTodo);
clearAllBtn.addEventListener("click", clearAll);

// Function to add a new todo item
function addTodo() {
  const todoText = todoInput.value.trim();
  if (todoText !== "") {
    const li = createTodoElement(todoText);
    todoList.appendChild(li);
    saveTodos();
    todoInput.value = "";
  }
}

// Function to create a new todo item element
function createTodoElement(todoText) {
  const li = document.createElement("li");
  li.setAttribute("draggable", "true");
  li.addEventListener("dragstart", dragStart);
  li.addEventListener("dragover", dragOver);
  li.addEventListener("drop", drop);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", toggleComplete);

  const span = document.createElement("span");
  span.textContent = todoText;
  span.contentEditable = true;
  span.addEventListener("blur", () => {
    saveTodos();
  });

  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("buttons");

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("link-button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", deleteTodo);

  buttonsDiv.appendChild(deleteButton);
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(buttonsDiv);
  return li;
}

// Function to toggle the completion status of a todo item
function toggleComplete() {
  const span = this.nextElementSibling;
  span.classList.toggle("completed");
  saveTodos();
}

// Function to delete a todo item
function deleteTodo() {
  this.parentElement.parentElement.remove();
  saveTodos();
}

// Function to clear all todo items
function clearAll() {
  todoList.innerHTML = "";
  saveTodos();
}

// Function to save todos to local storage
function saveTodos() {
  const todos = [];
  todoList.querySelectorAll("li").forEach(li => {
    const text = li.querySelector("span").textContent;
    const completed = li.querySelector("input[type='checkbox']").checked;
    todos.push({ text, completed });
  });
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to load todos from local storage
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.forEach(todo => {
    const li = createTodoElement(todo.text);
    if (todo.completed) {
      li.querySelector("input[type='checkbox']").checked = true;
      li.querySelector("span").classList.add("completed");
    }
    todoList.appendChild(li);
  });
}

// Drag-and-Drop Functions
function dragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
  event.target.classList.add("dragging");
}

function dragOver(event) {
  event.preventDefault();
  const draggingElement = todoList.querySelector(".dragging");
  const afterElement = getDragAfterElement(todoList, event.clientY);
  if (afterElement == null) {
    todoList.appendChild(draggingElement);
  } else {
    todoList.insertBefore(draggingElement, afterElement);
  }
}

function drop(event) {
  event.preventDefault();
  const draggable = document.querySelector(".dragging");
  draggable.classList.remove("dragging");
  saveTodos();
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
