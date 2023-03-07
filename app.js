//npm install express mongodb ejs body - parser--save
// Dependencies
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017';
const connectionString = "mongodb+srv://khanglngcs210650:Abcd1234@cluster0.jjfkxyw.mongodb.net/?retryWrites=true&w=majority";


//Connect database 
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db('toy-store')
        console.log('Connected to Database')
        app.set('view engine', 'ejs');
        app.use(express.static(__dirname + '/static'));
        app.use(favicon(__dirname + '/static/favicon.ico'));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        // Routes
        // Main website
        app.get('/', (req, res) => {
            db.collection('products').find().toArray()
                .then(results => {
                    console.log(results)
                    res.render('index.ejs', { products: results })
                })
                .catch(error => console.log('Error getting products:', error))
        })


        //Add product
        app.post('/add', (req, res) => {
            db.collection('products').insertOne(req.body)
                .then(() => {
                    console.log('Product added to database');
                    res.redirect('/');
                })
                .catch(error => console.log(error))
        });


        // Delete product
        app.get('/delete/:id', (req, res) => {
            const id = new ObjectId(req.params.id);
            db.collection('products').deleteOne({ _id: id })
                .then(() => {
                    console.log('Product deleted successfully');
                    res.redirect('/');
                })
                .catch(error => console.log('Error deleting product:', error))
        });


        //Search product
        app.get('/search', (req, res) => {
            const query = req.query.s;
            db.collection('products').find({ name: { $regex: String(query), $options: 'i' } }).toArray()
                .then(results => {
                    res.render('index.ejs', { products: results, search: query });
                    console.log(results);
                    console.log(query);
                })
                .catch(error => console.log(error))
        });


        //Edit product
        app.post('/edit/:id', (req, res) => {
            const id = new ObjectId(req.params.id);
            db.collection('products').updateOne(
                { _id: id },
                {
                    $set: {
                        name: req.body.name,
                        status: req.body.status,
                        price: parseFloat(req.body.price),
                        quantity: parseInt(req.body.quantity),
                    },
                })
                .then(results => {
                    console.log('Product updated');
                    res.redirect('/');
                    console.log(results);
                })
                .catch(error => console.log(error))
        });


        // Start the server
        const port = 3000 || process.env.PORT;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    );
