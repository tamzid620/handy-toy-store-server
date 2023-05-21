const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    client.connect();


    const toyCollection = client.db('handyToy').collection('toys');

    const indexKeys = { seller: 1 };
    const indexOptions = { name: 'name' };
    const result =  toyCollection.createIndex(indexKeys, indexOptions);

    // toy search ---------------------------------------------------------------
    app.get('/toysearch/:text', async (req, res) => {
      const search = req.params.text;
      const result = await toyCollection.find({
        $or: [
          { seller: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } }
        ],
      }).toArray();
      res.send(result)
    })

        // all toys ---------------------------------------------------------------
    app.get('/allToys', async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // category details ---------------------------------------------------------------
    app.get("/catedetails/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.findOne({ _id: new ObjectId(id) });
      if (result) {
        res.send(result);
      } else {
        res.status(400).json({ status: 400, message: "No Data Found" });
      }
    });

        // all toy details ---------------------------------------------------------------
    app.get("/alltoydetails/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.findOne({ _id: new ObjectId(id) });
      if (result) {
        res.send(result);
      } else {
        res.status(400).json({ status: 400, message: "No Data Found" });
      }
    });
    
    // add toy ---------------------------------------------------------------
    app.post('/addToys', async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(result)
    });

        // my toys ---------------------------------------------------------------
    app.get('/myToys/:id', async (req, res) => {
      const result = await toyCollection.find({ email: req.params.id }).sort({price: -1}).toArray();
      console.log(req.params.id);
      res.send(result);
    });

        // update toy ---------------------------------------------------------------
    app.put('/updatetoy/:id' , async(req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = {_id:new ObjectId(id)};
      const updatetoy = {
        $set:{
          price: body.price,
          quantity:body.quantity,
          description : body.description
        },
      }
      const result = await toyCollection.updateOne(filter, updatetoy);
      res.send(result)
    });

        // delete toy  ---------------------------------------------------------------
    app.delete('/deletetoy/:id' , async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

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
