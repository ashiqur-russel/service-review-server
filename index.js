const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}
//Function for Creating collection to the database
async function run() {
  try {
    const serviceCollection = client.db("serviceReview").collection("services");
    const reviewCollection = client.db("serviceReview").collection("reviews");
    const userCollection = client.db("serviceReview").collection("user");

    //Create jwt token and send to client
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "120s",
      });
      res.send({ token });
    });
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

    //get review by id

    app.get("/reviewss-all/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //Get Review by service id
    app.get("/reviews-all/:id", async (req, res) => {
      const id = req.params.id;
      const query = { service_id: id };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //Get Review
    app.get("/reviews-all", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //Create Review
    app.post("/reviews-all", async (req, res) => {
      const reviews = req.body;
      const result = await reviewCollection.insertOne(reviews);
      res.send(result);
    });

    //Get review data from db by email query

    app.get("/reviews", verifyJWT, async (req, res) => {
      const email = req.query.email;

      let query = { email: email };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //Fetch service by id
    app.get(`/services/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //Delete review by specific id
    app.delete("/reviews-all/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    //update review

    app.patch("/reviews-all/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await reviewCollection.updateOne(
          { _id: ObjectId(id) },
          { $set: req.body }
        );

        if (result.matchedCount) {
          res.send({
            success: true,
            message: `successfully updated ${req.body.name}`,
          });
        } else {
          res.send({
            success: false,
            error: "Couldn't update  the product",
          });
        }
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });
  } finally {
  }
}
run().catch((err) => console.log(err));
app.listen(port, () => {
  console.log(`Service review server running on ${port}`);
});
