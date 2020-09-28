const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const uploadPath = path.join('public', Book.coverImageBasePath);
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// all books route
router.get('/', async(req, res) => {
    let query = Book.find();
    if(req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if(req.query.publishedBefore) {
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if(req.query.publishedAfter) {
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    try {
        //const books = await Book.find({});
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchString : req.query
        });
    }
    catch {
        res.redirect('/');
    }
    
    
})

// new book route . Displays only form 

router.get('/new', async(req, res) => {
    renderNewPage(res, new Book());
})


//create a new book

router.post('/', upload.single('cover'), async (req, res) => {
    let filename = null;
    if(req.file) filename = req.file.filename;
    const book = new Book( {
        title: req.body.title,
        author : req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description : req.body.description,
        coverImageName: filename,
    })

    try {
        const newBook = await book.save();
        res.redirect('/books');
    }
    catch{
        if(book.coverImageName)
            removeBookCover(book.coverImageName);
        renderNewPage(res, book, true);
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        console.log(err);
    });
}

async function renderNewPage(res, book, hasError = false) {
    

    try {
        const authors = await Author.find({});
        //const book = new Book();
        const params = {authors: authors, book : book};
        if(hasError) {
            params.errorMessage = 'Error creating book';
        }
        res.render('books/new', params)
    }
    catch {
        res.redirect('/books');
    }
}

module.exports = router;