const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const found = users.find(( user ) => {
    return user.username === username;
  })

  if (found) {
    request.user = found;
    return next()
  }

  return response.status(404).json({
    error: "Username not found"
  })

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const found = users.find(( user ) => {
    return user.username === username;
  })

  if (found) {
    return response.status(400).json({
      error: "Username already exists"
    })
  }

  const user = { 
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user)

  response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find( (todo ) => {
    return todo.id === id
  })

  if (todo) {
    todo.title = title;
    todo.deadline = new Date(deadline);
    return response.status(201).json(todo);
  }

  return response.status(404).json({
    error: "Todo not found"
  })


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find( (todo ) => {
    return todo.id === id
  })

  if (todo) {
    todo.done = true
    return response.status(201).json(todo);
  }

  return response.status(404).json({
    error: "Todo not found"
  })

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex( (todo ) => {
    return todo.id === id
  })

  if (index >= 0) {
    user.todos.splice(index, 1);
    return response.status(204).json()
  }

  return response.status(404).json({
    error: "Todo not found"
  })
});

module.exports = app;