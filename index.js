const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("Service review server is running");
});

//Database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.irpitar.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
//Function for Creating collection to the database
async function run() {
  try {
    const serviceCollection = client.db("serviceReview").collection("services");
    const reviewCollection = client.db("serviceReview").collection("reviews");
    const userCollection = client.db("serviceReview").collection("user");

    //get all data from db
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    //get 3 data from db
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });

    //Create Service
    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await serviceCollection.insertOne(services);
      res.send(result);
    });
    //Get Review
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      console.log(cursor);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //Get Review by service id
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;

      const query = { service_id: id };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //Create Review
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(result);
    });

    //Fetch service by id
    app.get(`/services/:id`, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));
app.listen(port, () => {
  console.log(`Service review server running on ${port}`);
});
