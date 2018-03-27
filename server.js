const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = 9480;
const mysql = require("mysql");
const fs = require('fs');

require('./js/about-item');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname);
    }
});

var upload = multer({
    storage: storage
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'soren948',
    database: 'kitchen'
});

app.get('/recipes', function (req, res) {
    connection.query('SELECT * FROM recipes', function (err, rows) {
        if (err) throw err;
        console.log('get all recipes, length: ' + rows.length);
        res.status(200).send(rows);
    });
});


app.post('/images', upload.any(), function (req, res, next) {
    res.sendStatus(200);
})


app.post('/recipes', function (req, res) {
    connection.query('INSERT INTO recipes SET ?', req.body,
        function (err, result) {
            if (err) throw err;
            console.log('recipe\'s been added to database with id: ' + result.insertId);
        }
    );
    res.sendStatus(200);
});


app.get('/recipes-info', function (req, res) {
    var str = new ItemsInfo().readInfo().toString().split('/item/');
    res.status(200).send(str);
});

app.post('/recipes-info', function (req, res) {
    var str = new ItemsInfo().readInfo().toString();
    if (str == "") {
        str = str + req.body.text;
    } else {
        str = str + "/item/" + req.body.text;
    }
    var str2 = new ItemsInfo().writeInfo(str);
    res.sendStatus(200);
});



app.put('/recipes-info', function (req, res) {
    var str = new ItemsInfo().writeInfo(req.body.text);
    res.sendStatus(200);
});


app.delete('/recipe/:id', function (req, res) {
    connection.query('DELETE FROM recipes WHERE id = ?',req.params.id, function (err) {
            if (err) throw err;
            console.log('recipe delete id: ' + req.body.id);
        }
    );
    res.sendStatus(200);
});


app.post('/recipes-edit/:id', function (req, res) {
    connection.query('UPDATE recipes SET name = ?, src = ? WHERE id = ?',
        [req.body.name, req.body.price, req.body.src, req.params.id],
        function (err) {
            if (err) throw err;
            console.log('recipe updated id: ' + req.params.id);
        }
    );
    res.sendStatus(200);
});


app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});


app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Server start on port ${port}!`);
});
