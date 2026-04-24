import { fetchTodos, createTodo, updateTodoStatus, deleteTodo } from './api.js';

const todoContainer = document.getElementById('todoList');
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');

let todos = [];
let currentFilter = 'all'; // 'all', 'active', 'completed'

async function loadTodos() {
    todoContainer.innerHTML = '<div class="loading">Загрузка задач...</div>';
    try {
        todos = await fetchTodos(15);
        renderFilteredTodos();
        updateStats();
    } catch (error) {
        todoContainer.innerHTML = '<div class="error">❌ Ошибка загрузки</div>';
        console.error(error);
    }
}

function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
    document.getElementById('completedCount').textContent = completed;
}

function getFilteredTodos() {
    switch(currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function renderFilteredTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        let message = '';
        if (currentFilter === 'active') message = '✨ Нет активных задач!';
        else if (currentFilter === 'completed') message = '✅ Нет выполненных задач!';
        else message = '📝 Нет задач. Добавьте первую!';
        
        todoContainer.innerHTML = `<div class="empty">${message}</div>`;
        return;
    }

    todoContainer.innerHTML = '';
    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoContainer.appendChild(todoElement);
    });
}

function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = 'todo-item';
    div.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));

    const span = document.createElement('span');
    span.className = 'todo-text';
    if (todo.completed) span.classList.add('completed');
    span.textContent = todo.title;

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', () => removeTodo(todo.id));

    div.append(checkbox, span, delBtn);
    return div;
}

async function addTodo() {
    const title = todoInput.value.trim();
    if (!title) {
        alert('Введите задачу!');
        return;
    }

    try {
        const newTodo = await createTodo(title);
        newTodo.id = Date.now(); // временный ID для отображения
        todos.unshift(newTodo);
        renderFilteredTodos();
        updateStats();
        todoInput.value = '';
        
        // Анимация для новой задачи
        if (todoContainer.firstChild) {
            todoContainer.firstChild.style.animation = 'slideIn 0.3s ease';
        }
    } catch (error) {
        alert('Ошибка при добавлении');
    }
}

async function toggleTodo(id, completed) {
    try {
        await updateTodoStatus(id, completed);
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = completed;
            renderFilteredTodos();
            updateStats();
        }
    } catch (error) {
        alert('Ошибка при обновлении');
        renderFilteredTodos(); // откат
    }
}

async function removeTodo(id) {
    if (!confirm('Удалить задачу?')) return;
    
    try {
        await deleteTodo(id);
        todos = todos.filter(t => t.id !== id);
        renderFilteredTodos();
        updateStats();
    } catch (error) {
        alert('Ошибка при удалении');
    }
}

function setFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderFilteredTodos();
}

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        setFilter(e.target.dataset.filter);
    });
});

loadTodos();