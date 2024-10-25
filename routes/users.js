const express = require('express');
const router = express.Router();
const users = require('../data/users');
const posts = require('../data/posts');
const comments = require('../data/comments');
const error = require('../utilities/error');
/* -------------------------------------------------------------------------- */
/*                                    USERS                                   */
/* -------------------------------------------------------------------------- */
router.get('/', (req, res) => {
  //HATEOAS
  const links = [
    {
      href: "users/:id",
      rel: ":id",
      type: "GET",
    },
  ];

  res.json({users, links})
})

router.get('/:id', (req, res, next) => {
  const user = users.find(user => user.id == req.params.id);

  //HATEOAS
  const links = [
    {
      href: `/${req.params.id}`,
      rel: "",
      type: "PATCH",
    },
    {
      href: `/${req.params.id}`,
      rel: "",
      type: "DELETE",
    },
  ];

  if(user) res.json({user, links})
  else next() //goes to our middleware that will send a 404
  /* else res.json({error: "User Not Found"}) */
})

router.get('/:id/comments', (req, res, next) => {
  
  const user = users.find(user => user.id == req.params.id);
  if(user) {
    const filteredComments = comments.filter(comment => comment.userId == user.id)
    if(filteredComments.length === 0) res.send('There are no comments for this user')
    else{
      if(req.query.postId){ //search for the correct userId within the comments with the postId.
        const comment = comments.find(comment => comment.postId == req.query.postId);
        if(comment) return res.json(filteredComments.filter(comment => comment.postId == req.query.postId))
        else return next()
      }
      res.json(filteredComments);
    }
  }
  else next()
})
//retrieve all posts by a user with the specified id
router.get('/:id/posts', (req, res, next) => {
  const user = users.find(user => user.id == req.params.id);
  if(user) res.json(posts.filter(post => post.userId == user.id))
  else next() //res.json({error: "User Not Found"})
})

router.post('/', (req, res, next) => {
  if(req.body.name && req.body.username && req.body.email){
    if(users.find(user => user.username == req.body.username)) return next(error(400, "Username Already Taken")) //res.json({error: "Username Already Taken"})
    const user = {
      id: users[users.length-1].id + 1,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email
    }
    users.push(user);
    res.json(user);
  }
  else next(error(400, "Insufficient Data")) // res.json({error: "Insufficient Data"});
})

router.patch('/:id', (req, res, next) => {
  const user = users.find((u, i) => (u.id == req.params.id))
  if(user) {
    for(const key in req.body) {
      user[key] = req.body[key] //whatever we placed in the req.body we will overwrite the existing user[key]
    }
    res.json(user)
  }
  else next() //res.json({error: "User Not Found"})
})

router.delete('/:id', (req, res, next) => {
  const user = users.findIndex(user => user.id == req.params.id)
  if(user !== -1) {
    const [deletedUser] = users.splice(user,1); //remove the user; recall that splice returns an array
    res.json(deletedUser)
  }
  else next() //res.json({error: "User Not Found"});
})

module.exports = router