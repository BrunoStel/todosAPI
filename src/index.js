const express = require('express');

const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());

app.use(express.json());

const users = [];


//Midleware de validação por username
function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers


 const user = users.find(obj=>obj.username === username)

 if(!user){
   response.status(404).send({error:'Username not found!'})
 }

 request.user = user
  
 next()

}


//Cadastro de usuário
app.post('/users', (request, response) => {
    const {name, username} = request.body
 
    if(users.some(obj=>obj.username === username)){
      response.status(400).send({error:"Username already exists!"})
    }

    const novoUsuario = { 
      id: uuidv4(), 
      name: name, 
      username: username, 
      todos: []
    }

    users.push(novoUsuario)

  response.status(201).json(novoUsuario)

});



//Consultando todos do usuário
app.get('/todos',checksExistsUserAccount, (request, response) => {
  const { user } = request

  response.status(200).json(user.todos)
});


//Novo todo
app.post('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request

    const {title, deadline} = request.body
    
  const todo =  { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date
  }

    user.todos.push(todo)
    

    response.status(201).json(todo)

});


//Modificando título e deadline do usuario
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const {user} = request

    const {id} = request.params

    const {title, deadline} = request.body

    const todo = user.todos.find(obj=>obj.id === id)

    if(!todo){
      response.status(404).send({error:'Todo not found!'})
    }

    todo.title = title
    todo.deadline = new Date(deadline)

    response.status(201).json(todo)

});


//Marcando um todo como done
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {id} = request.params

  const todo = user.todos.find(obj=>obj.id === id)

  if(!todo){
    response.status(404).send({error:'Todo not found!'})
  }

  todo.done = true

  response.status(201).json(todo)

});

//Deletando um todo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {id} = request.params

  const index = user.todos.findIndex(obj=>obj.id === id)

  if(index < 0 ){
    response.status(404).send({error:'Todo not found!'})
  }

  user.todos.splice(index, 1)

  response.status(204).send({message:'Todo deletado com sucesso!'})

});



module.exports = app;