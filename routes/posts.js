const express = require('express');
const router = express.Router();
const posts = require('../data/posts');
const comments = require('../data/comments');
const error = require('../utilities/error');

/* -------------------------------------------------------------------------- */
/*                                    POSTS                                   */
/* -------------------------------------------------------------------------- */
router.get('/', (req, res, next) => {
  //retrieves all posts by a user with the specified postId
  if(req.query.userId){
    const userId = posts.find(post => post.userId == req.query.userId); // see if our userId exists in the posts data. 
    if (userId) {
      const filteredPosts = posts.filter(post => post.userId == req.query.userId);
      if(filteredPosts) return res.json(filteredPosts);
    }
    else next()
  }
  else{
    //HATEOAS
    const links = [
      {
        href: "posts/:id",
        rel: ":id",
        type: "GET",
      },
    ];

    res.json({posts, links});
  }
})

router.get('/:id', (req, res, next) => {
  const post = posts.find(post => post.id == req.params.id)
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
  if(post) res.json({post, links})
  else next()
  /* else res.json({error: "Post Not Found"}) */
})

router.get('/:id/comments', (req, res, next) => {

  const post = posts.find(post => post.id == req.params.id)
  if(post) {
    const filteredComments = comments.filter(comment => comment.postId == req.params.id) 
    if(filteredComments.length === 0) res.send('There are no comments for this post')
    else{
      if(req.query.userId){ //search for the correct userId within the comments with the postId.
        const comment = comments.find(comment => comment.userId == req.query.userId);
        if(comment) return res.json(filteredComments.filter(comment => comment.userId == req.query.userId))
        else return next()
      }
      res.json(filteredComments)
    }
  }
  else next()
})

router.post('/', (req, res, next) => {
  if (req.body.userId && req.body.title && req.body.content){
    const post = {
      id: posts[posts.length - 1].id + 1,
      userId:  req.body.userId,
      title: req.body.title,
      content: req.body.content
    }

    posts.push(post)
    res.json(post)
  }
  else next(error(400, "Insufficient Data")) // res.json({error: "Insufficient Data"});
})

router.patch('/:id', (req, res, next) => {
  const post = posts.find(post => post.id == req.params.id)
  if(post){
    for(const key in req.body){
      post[key] = req.body[key]; //whatever we placed in the req.body we will overwrite the existing user[key]
    }
    res.json(post);
  }
  else next() // res.json({error: "Post Not Found"})
})

router.delete('/:id', (req, res, next) => {
  const post = posts.findIndex(post => post.id == req.params.id)
  if(post !== -1) {
    const [deletedPost] = posts.splice(post,1); //remove the post; recall that splice returns an array
    res.json(deletedPost)
  }
  else next() // res.json({error: "Post Not Found"});
})

module.exports = router