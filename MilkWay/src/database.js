const express = require('express');
const bcrypt = require('bcryptjs');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Sriram:Sri19%40tce@sandbox.mh7rlcf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    if(err){
        console.error(err);
        return;
    }
  // const collection = client.db("milkway").collection("login");
  console.log("connected");
  client.close();
});

async function updateCustomerEntry(doc){
  try {
    delete doc["_id"];
    const result = await client.db("milkway").collection("customer").updateOne({ uid : doc["uid"] }, { $set : doc});
    console.log(result);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function loginValidate(doc){
  //let { id, password } = doc;
  // doc["password"] = await bcrypt.hash(doc["password"]);
  console.log("ready");
  // console.log({"id":doc["id"], password:doc["password"]});
  console.log(doc);
  console.log(await client.db("milkway").collection(doc["user"]).find({"id":doc["id"], password:doc["password"]}).toArray());
   if((await client.db("milkway").collection(doc["user"]).find({"uid":doc["id"], password:doc["password"]}).toArray()).length === 1){
      console.log("validated");
      return true;
   }
   return false;
  }

  async function deleteMilkmen(uid){
    try {
      console.log("Res ",await client.db("milkway").collection("milkmen").find({ uid : uid }).toArray());
      const result = (await client.db("milkway").collection("milkmen").deleteOne({ uid })).deletedCount;
      console.log(result);
      return result ? true : false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function deleteCustomer(uid){
      try {
        console.log(await client.db("milkway").collection("customer").find().toArray())
        const result = (await client.db("milkway").collection("customer").deleteOne({ uid })).deletedCount;
        console.log(result);
        return result ? true : false;
      } catch (error) {
        return false;
      }
  }

  async function getCustomerDetails(uid){
      try {
        return await client.db("milkway").collection("customer").find({ uid }).toArray();
      } 
      catch (error) {
        console.error(error);
        return false;
      }
  }

  function generateNumber() {
    var minm = 1000;
    var maxm = 9999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}

async function insertCustomer(doc){
  try {

      if (doc["user"] === 'supplier') 
          doc["supply"] = JSON.parse(`{ "${new Date().getFullYear()}-${new Date().getMonth()}" : 0 }`);
      else 
          doc["recieve"] = JSON.parse(`{ "${new Date().getFullYear()}-${new Date().getMonth()}" : 0 }`);
      
      doc["transaction"] = { }

      const res = await client.db("milkway").collection("customer").insertOne(doc);
      console.log(res.insertedId.toString());
      
      const uid = doc["name"].substr(0, 3)+generateNumber();
      const updatedResult = await client.db("milkway").collection("customer").updateOne({ _id : res.insertedId }, { $set : { "uid" : uid } });
      console.log(updatedResult);
      return uid;
  } catch (error) {
      console.error(error);
      return false;
  }
}

async function applyLeave(docs) {
    try {
      docs["status"] = "pending";
      const result = await client.db("milkway").collection("leave").insertOne(docs);
      console.log(result);
      return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function insertMilkmen(doc) {
    try {
      doc["supply"] = 0;
      doc["recieve"] = 0;
      const res = await client.db("milkway").collection("milkmen").insertOne(doc);
      console.log(res.insertedId.toString());
      const uid = doc["name"].substr(0, 3)+generateNumber();
      const updatedResult = await client.db("milkway").collection("milkmen").updateOne({ _id : res.insertedId }, { $set : { "uid" : uid, "password" : uid } });
      console.log(updatedResult);
      return uid;
    } catch (error) {
      console.error(error);
      return false;
    }
}

async function fetchMilkmen(){
  try {
    const data = await client.db("milkway").collection("milkmen").find().toArray();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function fetchCustomerDetails() {
    try {
      return await client.db("milkway").collection("customer").find().toArray();
    } catch (error) {
      console.error(error);
      return false;
    }
}


async function getLeaveDetails() {
    console.log(await client.db("milkway").collection("leave").find().toArray());
    return await client.db("milkway").collection("leave").find().toArray();
}

module.exports = {
  loginValidate, 
  insertMilkmen, 
  fetchMilkmen, 
  insertCustomer, 
  fetchCustomerDetails, 
  deleteCustomer,
  getCustomerDetails,
  updateCustomerEntry,
  applyLeave,
  getLeaveDetails,
  deleteMilkmen,
  client
}