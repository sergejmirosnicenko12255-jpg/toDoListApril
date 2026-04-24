import axios from 'axios';

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

export async function fetchTodos(limit = 10) {
    const response = await axios.get(`${API_URL}?_limit=${limit}`);
    return response.data;
}

export async function createTodo(title) {
    const response = await axios.post(API_URL, {
        title: title,
        completed: false,
        userId: 1
    });
    return response.data;
}

export async function updateTodoStatus(id, completed) {
    const response = await axios.patch(`${API_URL}/${id}`, { completed });
    return response.data;
}

export async function deleteTodo(id) {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.status === 200 || response.status === 204;
}