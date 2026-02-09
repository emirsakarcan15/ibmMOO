const express = require('express');
let books = require("./booksdb.js");
const { authenticated } = require('./auth_users.js');
let isValid = require("./auth_users.js").isValid;
let authenticatedUser = require("./auth_users.js").authenticatedUser;
let doesUserExist = require("./auth_users.js").doesUserExist;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (!isValid(username)) {
    return res.status(400).json({message: "Username is not valid"});
  }

  if (doesUserExist(username)) {
    return res.status(400).json({message: "Username already exists"});
  }

  users = users || [];

  users.push({username: username, password: password});

  return res.status(300).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) { 
  try {
    const bookList = await books;
    return res.status(300).json({books: bookList});
  } catch (error) {
    return res.status(500).json({message: "Internal Server Error"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const bookList = await books

    const book = bookList[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(300).json({book: book});
  
  } catch (error) {
    return res.status(500).json({message: "Internal Server Error"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = [];

    const normalizeName = (name) => name.replace(/\s+/g, '')

    const bookList = await books;

    for (let isbn in bookList) {
      if (normalizeName(bookList[isbn].author) === author) {
        booksByAuthor.push(bookList[isbn]);
      }
    }

    if (booksByAuthor.length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }

    return res.status(300).json({books: booksByAuthor});
    
  } catch (error) {
    return res.status(500).json({message: "Internal Server Error"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  const normalizeTitle = (title) => title.replace(/\s+/g, '')
  
  for (let isbn in books) {
    if (normalizeTitle(books[isbn].title) === title) {
      booksByTitle.push(books[isbn]);
    }
  }

  if (booksByTitle.length === 0) {
    return res.status(404).json({ message: "No books found with this title" });
  }

  return res.status(300).json({booksByTitle: booksByTitle});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(300).json({reviews: book.reviews});
});

module.exports.general = public_users;
