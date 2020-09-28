const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// all authors
router.get('/', async(req, res) => {
    //res.send("Hello World")
    let searchString = {};
    if(req.query.name != null && req.query.name !== '' )  {
        searchString.name = new RegExp(req.query.name, 'i');
    }

    try {
        let authors = await Author.find(searchString);
        //console.log(authors);
        res.render('authors/index', {authors : authors,
            searchString : req.query
        });
    }
    catch {
        res.redirect('/');
    }
    
})

// new author route . Displays only form 

router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
})


//create a new author

router.post('/', async (req, res) => {
    //res.send(req.body.name);
    let new_author = new Author({
        name: req.body.name
    })

    // new_author.save((err, newAuthor) => {
    //     if(err) {
    //         res.render('authors/new', {
    //             author: new_author,
    //             errorMessage : 'Error creating author'
    //         })
    //     }
    //     else {
    //         res.redirect('authors')
    //     }
    // })

    try {
        const newAuthor = await new_author.save();
        res.redirect('authors');
    }
    catch (err) {
        res.render('authors/new', {
            author: new_author,
            errorMessage: 'Error creating author'
        })
    }
})

module.exports = router;