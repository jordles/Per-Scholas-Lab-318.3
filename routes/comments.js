const express = require("express");
const router = express.Router();
const comments = require("../data/comments");

router.get("/", (req, res, next) => {
  if(req.query.postId){
    const comment = comments.find(comment => comment.postId == req.query.postId);
    if(comment) return res.json(comments.filter(comment => comment.postId == req.query.postId))
    else return next()
  }
  if(req.query.userId){
    const comment = comments.find(comment => comment.userId == req.query.userId);
    if(comment) return res.json(comments.filter(comment => comment.userId == req.query.userId))
    else return next()
  }

  res.json(comments);
})

router.post("/", (req, res) => {
  if(req.body.userId && req.body.postId && req.body.body){
    const comment = {
      id: comments.length > 0 ? comments[comments.length - 1].id + 1 : 1,
      userId:  req.body.userId,
      postId: req.body.postId,
      body: req.body.body
    }

    comments.push(comment)
    res.json(comment)
  }
  else next(error(400, "Insufficient Data"))
})

router.get("/:id", (req, res) => {
  const comment = comments.find(comment => comment.id == req.params.id);
  if(comment) res.json(comment);
  else next()  
})

router.patch("/:id", (req, res) => {
  const comment = comments.find(comment => comment.id == req.params.id);
  if(comment){
    for(const key in req.body){
      comment[key] = req.body[key];
    }
    res.json(comment)
  }
  else next()
})

router.delete("/:id", (req, res) => {
  const comment = comments.find(comment => comment.id == req.params.id);
  if(comment){
    comments.splice(comments.indexOf(comment), 1)
    res.json(comment)
  }
  else next()
})

module.exports = router