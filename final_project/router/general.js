const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const getBooksAsync = async () => {
  return await axios.get('http://localhost:5000/internal/books');
};

public_users.get('/internal/books', (req, res) => {
  res.status(200).json(books);
});

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
// public_users.get('/', function (req, res) {
//   return res.status(200).send(JSON.stringify(books, null, 4));
// });
public_users.get('/', async function (req, res) {
  try {
    const response = await getBooksAsync();
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

public_users.get('/internal/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

const getBookByISBN = (isbn) => {
  return axios.get(`http://localhost:5000/internal/isbn/${isbn}`);
};

// Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//   const isbn = req.params.isbn;

//   if (books[isbn]) {
//     return res.status(200).json(books[isbn]);
//   } else {
//     return res.status(404).json({ message: "Book not found for given ISBN" });
//   }
// });
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  getBookByISBN(isbn)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      return res.status(404).json({ message: "Book not found", error: error.message });
    });
});

public_users.get('/internal/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const matchingBooks = [];

  for (let key in books) {
    if (books[key].author.toLowerCase() === author) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

const getBooksByAuthor = async (author) => {
  return await axios.get(`http://localhost:5000/internal/author/${author}`);
};
  
// Get book details based on author
// public_users.get('/author/:author', function (req, res) {
//   const author = req.params.author.toLowerCase();
//   const matchingBooks = [];

//   for (let key in books) {
//     if (books[key].author.toLowerCase() === author) {
//       matchingBooks.push({ isbn: key, ...books[key] });
//     }
//   }

//   if (matchingBooks.length > 0) {
//     return res.status(200).json(matchingBooks);
//   } else {
//     return res.status(404).json({ message: "No books found by this author" });
//   }
// });
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
    const response = await getBooksByAuthor(author);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "Author not found", error: error.message });
  }
});

public_users.get('/internal/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const matchingBooks = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title) {
      matchingBooks.push({ isbn: key, ...books[key] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

const getBooksByTitle = async (title) => {
  return await axios.get(`http://localhost:5000/internal/title/${title}`);
};

// Get all books based on title
// public_users.get('/title/:title', function (req, res) {
//   const title = req.params.title.toLowerCase();
//   const matchingBooks = [];

//   for (let key in books) {
//     if (books[key].title.toLowerCase() === title) {
//       matchingBooks.push({ isbn: key, ...books[key] });
//     }
//   }

//   if (matchingBooks.length > 0) {
//     return res.status(200).json(matchingBooks);
//   } else {
//     return res.status(404).json({ message: "No books found with this title" });
//   }
// });
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const response = await getBooksByTitle(title);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "Title not found", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
