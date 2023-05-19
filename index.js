const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// middleware 
app.use(cors());
app.use(express.json());


// appllication code ------------------------------------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qtemx5j.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();


    const toyCollection = client.db('handyToy').collection('toys');

    app.get('/allToys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.post('/addToys', async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(result)
    });

    app.get('/myToys/:email', async (req, res) => {
      const result = await toyCollection.find({ email: req.params.email }).toArray();
      console.log(req.params.email);
      res.send(result);
    });
    

  } finally {

    // await client.close();
  }
}
run().catch(console.dir);

// appllication code ------------------------------------------------------

app.get('/', (req, res) => {
  res.send('handle toy store server is running')
})

app.listen(port, () => {
  console.log(`handle toy store server is running on port : ${port}`)
})
