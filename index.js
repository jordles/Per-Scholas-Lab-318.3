const express = require("express");
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening to port: ${PORT}`)
})

//import our data
const users = require('./data/users');
const posts = require('./data/posts');

//middleware; must come before the route handlers because the handlers can end the request-response cycle (so the middleware will never run)
app.use(express.json()); //parse any json data in the request body
app.use(express.urlencoded({extended: true})); //parse any urlencoded data in the request body

//users
app.get('/api/users', (req, res) => {
  res.json(users)
})

app.get('/api/users/:id', (req, res, next) => {
  const foundUser = users.find(user => user.id == req.params.id);
  if(foundUser) res.json(foundUser);
  else next() //goes to our middleware that will send a 404
  /* else res.json({error: "User Not Found"}) */
})

app.post('/api/users', (req, res) => {
  if(req.body.name && req.body.username && req.body.email){
    if(users.find(user => user.username == req.body.username)) return res.json({error: "Username Already Taken"})
    const user = {
      id: users[users.length-1].id + 1,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email
    }
    users.push(user);
    res.json(user);
  }
  else res.json({error: "Insufficient Data"});
})

app.patch('/api/users/:id', (req, res) => {
  const user = users.find((u, i) => (u.id == req.params.id))
  if(user) {
    for(const key in req.body) {
      user[key] = req.body[key] //whatever we placed in the req.body we will overwrite the existing user[key]
    }
    res.json(user)
  }
  else res.json({error: "User Not Found"})
})

app.delete('/api/users/:id', (req, res) => {
  const user = users.findIndex(user => user.id == req.params.id)
  if(user !== -1) {
    const [deletedUser] = users.splice(user,1); //remove the user; recall that splice returns an array
    res.json(deletedUser)
  }
  else res.json({error: "User Not Found"});
})

//posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
})

app.get('/api/posts/:id', (req, res, next) => {
  const foundPost = posts.find(post => post.id == req.params.id)
  if(foundPost) res.json(foundPost)
  else next()
  /* else res.json({error: "Post Not Found"}) */
})

//default
app.get('/', (req, res) => {
  res.send("Nothing here...")
})

app.use((req, res, next) => {
  res.status(404).json({error: "Resource Not Found"})
})
