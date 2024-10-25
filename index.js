require('dotenv').config()
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const error = require('./utilities/error');
const path = require('path');

app.listen(PORT, () => {
  console.log(`Listening to port: ${PORT}`)
})

//import our data (routers)
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

//middleware; must come before the route handlers because the handlers can end the request-response cycle (so the middleware will never run)
app.use(express.json()); //parse any json data in the request body
app.use(express.urlencoded({extended: true})); //parse any urlencoded data in the request body

// New logging middleware to help us keep track of
// requests during testing!
app.use((req, res, next) => {
  const time = new Date();

  console.log(
    `-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("Containing the data:");
    console.log(`${JSON.stringify(req.body)}`);
  }
  next();
});

// Valid API Keys.
const apiKeys = JSON.parse(process.env["API-KEYS"]) //we have to parse this because it is a string

// New middleware to check for API keys!
app.use('/api', (req, res, next) => {
  const key = req.query["api-key"]; //name of our query parameter is api-key
  if(!key) return res.status(400).json({error: "API Key Required"});
  if(!apiKeys.includes(key)) return res.status(401).json({error: "Invalid API Key"});

  req.key = key; // this will be used in the next middleware; store key for route use
  next();
})


// router set up
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

// New User form; we dont use /api because this user form is not locked behind an API key
app.get("/users/new", (req, res) => {
  // only works for GET and POST request by default
  // if you are trying to send a PATCH, PUT, DELETE, etc. Look into method-override package 
  res.send(`
    <div>
      <h1>Create a User</h1>
      <form action="/api/users?api-key=${apiKeys[0]}" method="POST">
        Name: <input type="text" name="name" />
        <br />
        Username: <input type="text" name="username"/>
        <br />
        Email: <input type="text" name="email" />
        <br />
        <input type="submit" value="Create User" />
      </form>
    </div>
    `)
})

// Download Example 
app.use(express.static('./data'))

app.get("/get-data", (req, res) => {
  res.send(`
    <div>
      <h1>Download Data</h1>
      <form action="/download/users.js">
        <button>Download Users data</button>
      </form>

      <form action="/download/posts.js">
        <button>Download Posts data</button>
      </form>
    </div>
    `)
})

app.get("/download/:filename", (req, res) => {
  res.download(path.join(__dirname, 'data', req.params.filename))
})

// Adding some HATEOAS links.
app.get("/", (req, res) => {
  res.json({
    links: [
      {
        href: "/api",
        rel: "api",
        type: "GET",
      },
    ],
  });
});

// Adding some HATEOAS links.
app.get("/api", (req, res) => {
  res.json({
    links: [
      {
        href: "api/users",
        rel: "users",
        type: "GET",
      },
      {
        href: "api/users",
        rel: "users",
        type: "POST",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "GET",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "POST",
      },
    ],
  });
});

//default
app.get('/', (req, res) => {
  res.send("Nothing here...")
})

//404 error handler
app.use((req, res, next) => {
  next(error(404, "Resource Not Found"))
  //res.status(404).json({error: 'Resource Not Found'})
})

//default error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
})
