const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Our toys server is running');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fiopcal.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const toyCollection = client.db('toysDB').collection('toys');
const reviewsCollection = client.db('customer-reviews').collection('reviews')

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();



        // toys add or post
        app.post('/toys', async (req, res) => {
            const body = req.body;
            const result = await toyCollection.insertOne(body);
            res.send(result);
        })



        // all toys get
        app.get('/toys', async (req, res) => {
            const result = await toyCollection.find().toArray();
            res.send(result);
        })


        // toy category
        app.get('/toys/:category', async (req, res) => {
            const category = req.params.category;
            const filter = { category: category }
            console.log('result', filter)
            const result = await toyCollection.find(filter).toArray()
            res.send(result);
        })


        // toy details
        app.get('/toysDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })


        // my toy
        app.get('/my-toys/:email', async (req, res) => {
            const email = req.params;
            const result = await toyCollection.find(email).toArray();
            res.send(result);
        })


        // Delete
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(filter);
            res.send(result);
        })


        //update
        app.patch('/update-toy/:id', async (req, res) => {
            const id = req.params.id;
            const toyInfo = req.body;
            console.log('client side:-', toyInfo);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    price: toyInfo.price,
                    quantity: toyInfo.quantity,
                    description: toyInfo.description
                },
            };
            const result = await toyCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })

        // customer reviews
        app.get('/customer', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Our toys server running port is ${port}`);
})