const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors= require('cors')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config()
console.log(process.env.DB_USER);
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.he6ho.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

console.log(port);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log('error',err);
  const serviceCollection = client.db('heroAuto').collection("services");
  const orderCollection = client.db('heroAuto').collection("orders");
  const reviewCollection = client.db('heroAuto').collection("reviews");
  const adminCollection = client.db('heroAuto').collection("admins");
  
  //CRUD FUNCTION START HERE
  // -------------- FETCH SERVICE --------------
  app.get('/services',(req, res)=>{
    serviceCollection.find({})
    .toArray()
    .then(items=>{
      res.send(items)
      console.log(items);
    })
    .catch(err => console.error(`Failed to find documents: ${err}`))
  })
  /// -------------- ADD SERVICE --------------
  app.post('/addService',(req, res)=>{
    const newEvent=req.body;
    console.log('adding event:',newEvent);
    serviceCollection.insertOne(newEvent)
    .then(result=>{
      res.send(result.insertedCount > 0)
    })
  })
  // -------------- FETCH REVIEW --------------
  app.get('/reviews',(req, res)=>{
    reviewCollection.find({})
    .toArray()
    .then(items=>{
      res.send(items)
      console.log(items);
    })
    .catch(err => console.error(`Failed to find documents: ${err}`))
  })
  // -------------- ADD REVIEW--------------
  app.post('/addReview',(req, res)=>{
    const newEvent=req.body;
    console.log('adding event:',newEvent);
    reviewCollection.insertOne(newEvent)
    .then(result=>{
      res.send(result.insertedCount > 0)
    })
  })
  /// -------------- ADD ORDER --------------
  app.post('/addOrder',(req, res)=>{
    const order=req.body;
    console.log('adding order:',order);
    orderCollection.insertOne(order)
    .then(result=>{
      console.log('result',result.insertedCount);
      res.send(result.insertedCount > 0)
    })
  })
  // -------------- GET ORDER BY USER--------------
  app.get('/order',(req, res)=>{
    const queryEmail=req.query.email;
    if(queryEmail){
      orderCollection.find({email:queryEmail})
      .toArray((err,documents)=>{
      res.status(200).send(documents)
      })
  }
  else{
    res.status(401).send('un-authorize access')
  }
  })
  // -------------- FETCH ALL ORDER --------------
  app.get('/allOrders', (req, res) => {
    orderCollection.find({})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        })
})
  // -------------- ADD ADMIN --------------
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
})
// -------------- CHECK ADMIN --------------
app.get('/Admin', (req, res) => {
  adminCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        console.log(documents);
          res.status(200).send(documents);
      })
})
// -------------- UPDATE ORDER STATUS --------------
app.patch('/update/:id', (req, res) => {
  orderCollection.updateOne(
      { _id: ObjectId(req.params.id) },
      {
          $set: { status: req.body.status },
          $currentDate: { "lastModified": true }
      }
  )
      .then(result => {
        console.log(result);
          res.send(result.modifiedCount > 0)
      })
})
  // -------------- DELETE SERVICE --------------
  app.delete('/delete/:id',(req, res)=>{
    const id=ObjectId(req.params.id)
    console.log('delete',id);
    serviceCollection.findOneAndDelete({_id:id})
    .then(documents=>{
    res.send(!!documents.value)
    console.log("delete",documents)})
  })
  console.log('connected');
  // End
   
});

app.listen(port)

app.get('/', (req, res) => {
    res.send('DataBase connected')
})

