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

    users.push({ 
      id: uuidv4(), 
      name: name, 
      username: username, 
      todos: []
    })

  response.status(201).json(users[users.length -1])

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

    const index = users.findIndex(obj=>obj.username === user.username)

    const dateDeadline = new Date(deadline + " 00:00")

    const dateCreatedAt = new Date

    users[index].todos.push(
      { 
        id: uuidv4(),
        title: title,
        done: false, 
        deadline: dateDeadline.toDateString(), 
        created_at: dateCreatedAt.toDateString()
      }
    )

    response.status(201).json(user.todos)

});


//Modificando título e deadline do usuario
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const {user} = request

    const {id} = request.params

    const {title, deadline} = request.body

    const dateDeadline = new Date(deadline + " 00:00").toDateString()
  
    const index = user.todos.findIndex(obj=>obj.id === id)

    if(index < 0 ){
      response.status(404).send({error:'Todo not found!'})
    }

    user.todos[index].title = title
    user.todos[index].deadline = dateDeadline

    response.status(201).json(user.todos[index])

});


//Marcando um todo como done
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {id} = request.params

  const index = user.todos.findIndex(obj=>obj.id === id)

  if(index < 0 ){
    response.status(404).send({error:'Todo not found!'})
  }

  user.todos[index].done = true

  response.status(201).json(user.todos[index])

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