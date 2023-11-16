const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function test() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(" You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
test().catch(console.dir);

const db = client.db("group-study");
const assignmentCollection = db.collection("assignments");
const submisions = db.collection("submissions");

app.get("/", async (req, res) => {
  res.send("Server is running");
});

//Get Method by Any level like (example:: /assignment?difficulty=hard)  (3)
app.get("/assignments", async (req, res) => {
  console.log("query = ", req.query);
  const allAssignment = await assignmentCollection.find(req.query).toArray();
  res.send(allAssignment);
});

//Get Method by params like (example:: assignmentsbydifficulty/hard) (3)

app.get("/assignmentsbydifficulty/:difficulty", async (req, res) => {
  const difficulty = req.params.difficulty;
  const query = { difficulty: difficulty };
  const allAssignment = await assignmentCollection.find(query).toArray();
  res.send(allAssignment);
});

//get method for submission
//to show only penfing assignment use This

//localhost:5000/submission?status=pending

//to Show all submitted assignment of a specific user,  then use this API

//localhost:5000/submission?userEmail=testuser@gmail.com

app.get("/submission", async (req, res) => {
  const allAssignment = await submisions.find(req.query).toArray();
  res.send(allAssignment);
});

//Post method for creating Assignment 2(a)
app.post("/create", async (req, res) => {
  const assignment = req.body;
  const result = await assignmentCollection.insertOne(assignment);
  res.send(result);
});

//Post method for submission
app.post("/submission", async (req, res) => {
  const submittedData = req.body;
  submittedData.status = "pending";
  const result = await submisions.insertOne(submittedData);
  res.send(result);
});

//Delete method for deleting Assignment 2(b)
app.delete("/assignment/:id", async (req, res) => {
  const id = req.params.id;
  if (id.length == 24) {
    const query = { _id: new ObjectId(id) };
    const result = await assignmentCollection.deleteOne(query);
    res.send(result);
  } else {
    res.status("400").send({ msg: "Bad Request.Need a valid ID" });
  }
});

//Update method for Updating  Assignment 2(c)
app.put("/assignment/:id", async (req, res) => {
  const editedData = req.body;
  const id = req.params.id;
  if (id.length == 24) {
    const query = { _id: new ObjectId(id) };

    const updatedData = {
      $set: { ...editedData },
    };

    const result = await assignmentCollection.updateOne(query, updatedData);

    res.send(result);
  } else {
    res.status("400").send({ msg: "Bad Request.Need a valid ID" });
  }
});

//giving Mark and status will be changed to completed
app.patch("/submission/:id", async (req, res) => {
  const mark = req.body;
  const query = { _id: new ObjectId(req.params.id) };
  const updateData = {
    $set: {
      result: mark.result,
      feedback: mark.feedback,
      status: "completed",
    },
  };
  const result = submisions.updateOne(query, updateData);
  res.send(result);
});

//Show Usrs submitted assignment information

app.listen(port, () => {
  console.log("data is running port = ", port);
});
