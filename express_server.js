const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Buffer - comes before all routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generate a random string when creating a new short URL
app.post("/urls", (req, res) => {
  console.log(req.body);
  const id = generateRandomString(); // Log the POST request body to the console
  urlDatabase[id] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${id}`);         // Respond with 'Ok' (we will replace this)
});

//urls
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  console.log(templateVars);
  if (!templateVars.longURL) {
    res.redirect('/urls');
  }
  res.render("urls_shows", templateVars);
});

//GET method routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//POST to delete and redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//POST to redirect to the appropriate urls page
app.post("/urls/:id", (req,res) =>{
  const shortURL = req.params.shortURL;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

