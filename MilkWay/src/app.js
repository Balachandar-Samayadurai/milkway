const express = require('express');
const path = require('path');
const hbs = require("hbs");
const bodyparser = require("body-parser")
const { 
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
      } = require("./database.js")

const app = express();

const static_path = path.join(__dirname,"../public" );
const template_path = path.join(__dirname,"../templates/views" );
const leaveCollection = client.db("milkway").collection("leave");

app.use(express.static(static_path))
app.set("view engine","hbs")
app.set("views",template_path)
app.use(express.urlencoded({extended :false}))
app.use(bodyparser.json())

app.get("/getCustomerDetail", async(req, res)=>{
    try {
        if (req.query["uid"]) 
            res.send({ "state" : await getCustomerDetails(req.query["uid"]) });  
        else
            sendErr(res, "UID not found to fulfil request");
    } catch (error) {
        console.error(error);
        sendErr(res);
    }
});

app.patch("/updateCustomerEntry", async (req, res)=>{
    try {
      if (req["body"]["state"]) {
        await updateCustomerEntry(req["body"]["state"]);
        res.send({ "state" : "success" });
      }
      else{
        res.send({ "state" : "no state object found" });
      }
    } catch (error) {
      console.error(error);
      sendErr(res);
    }
})

app.post("/login", async(req, res)=>{
    console.log(req.body["id"])
    if(req["body"]["id"]){
        if(await loginValidate(req["body"])){
          console.log("rendering");
            if (req["body"]["user"] === "milkmen") 
              res.redirect("/customer/panel");
            else
              res.redirect("employer");
        }
        else{
          res.send({"state" : "false"});
        }
    }
    else{
      res.send({"state" : "false"});
    }
})

function sendErr(res, msg="error"){
  res.send({ "state" : msg });
}

app.post("/updateMilkmen", async (req, res)=>{
    console.log("update called",req.body);
    const fetchResult = await client.db("milkway").collection("milkmen").updateOne({ uid : req.body["uid"]}, { $set : req.body  });
    console.log(fetchResult);
    res.render("Manager/details");
})

app.get("/milkmen/details/editMilkmen", async (req, res)=>{
    try {
        console.log("rendering edit milk men");
        res.render("Manager/editMilkmen");
    } catch (error) {
        console.error(error);
    }
})

app.delete("/deleteMilkmen", async(req, res)=>{
  try {
    console.log("deleteMilkmen~ ",req.query.uid);
    if(req.query["uid"]){
      const result = await deleteMilkmen(req.query["uid"]);
      result ? res.send({ "state" : "done" }) : sendErr(res);
    }
    else
      sendErr(res, "query string not found!");
  } catch (error) {
    console.error(error);
    sendErr(res); 
  }
})

app.delete("/deleteCustomer", async (req, res)=>{
  try {
    console.log("uid ",req.query.uid);
    if(req.query["uid"]){
      const result = await deleteCustomer(req.query["uid"]);
      result ? res.send({ "state" : "done" }) : sendErr(res);
    }
    else
      sendErr(res, "query string not found!");
  } catch (error) {
    console.error(error);
    sendErr(res); 
  }
})

app.post("/editCustomer", async(req, res)=>{
  try {
    
  } catch (error) {
    console.error(error);
    res.send({ "state" : error });
  }
})

app.get("/",(req,res)=>{
  res.render("login");
})

app.get("/milkmen", (req, res)=>{
  res.render("Manager/milkmen")
})

app.get("/milkmen/details", (req, res)=>{
  res.render("Manager/details")
})

app.get("/milkmen/leave", (req, res)=>{
  res.render("Manager/ManagerManageleave")
})

app.get("/milkmen/details/addMilkmen", (req, res)=>{
  res.render("Manager/addMilkmen");
})

app.get("/employer",(req,res)=>{
  res.render("manager/employer");
})

app.get("/getLeaveDetails", async (req, res)=>{
    res.send( {"state" : await getLeaveDetails() });
})

app.get("/milkrate", async (req, res)=>{
  res.render("manager/milkrate");
})

app.get("/milkReport", async(req, res)=>{
  res.render("manager/milkReport");
})

app.get("/milkmen/route", async (req, res)=>{
    res.render("manager/route");
})

app.get("/leave/:uid/:date/:shift", async (req, res)=>{
    // const { uid, date } = req.params;
    const result = await leaveCollection.updateOne(req.params, { $set : { "status" : req.query.status } });
    res.send({ "status" : "success" });
})

app.post("/addMilkmen", async (req, res)=>{
  try {
    console.log(req["body"]);
    const result = await insertMilkmen(req["body"]);
    console.log(result);
    if (result) {
      // res.send({ "state" : result });
      res.redirect("milkmen/details")
    }
  } catch (error) {
    console.error(error);
    res.send({ "state" : false });
  }
})

app.post("/transaction/:uid", async (req, res)=>{
    const { uid } = req.params;
    console.log(uid, req.body);
    const fetchRes = await client.db("milkway").collection("transaction").insertOne(req.body);
    console.log(fetchRes);
    res.send({ "state" : "success" });
});

app.get("/updatePayment/:uid", async (req, res)=>{
    const result = await client.db("milkway").collection("transaction").updateOne({ uid : req.params.uid }, { $set : req.query });
    console.log(result);
    res.send({ "state" : "success" });
})

app.get("/getTransaction", async (req, res)=>{
    const result = await client.db("milkway").collection("transaction").find().toArray();
    res.send({"state" : result});
})

app.get("/employer/transact", async (req, res)=>{
    res.render("Manager/transact");
})

app.get("/customer/panel/transact", (req, res)=>{
  res.render("Milkmen/transaction");
});

app.post("/addCustomer", async(req, res)=>{
    try {
      console.log(req["body"]);
      const result = await insertCustomer(req["body"]);
      console.log(result);
      if (result) {
        // res.send({ "state" : result });
        res.redirect("/customer/panel/mycustomer");
      }
    } catch (error) {
        console.error(error);
        res.send({state : false});
    }
})

app.post("/applyLeave", async (req, res)=>{
    try {
      await applyLeave(req["body"]["state"]);
      res.send({ "state" : "success" });
    } catch (error) {
      console.error(error);
      res.send({ state : "error"});
    }
})

app.get("/customer/panel/mycustomer/addCustomer", async(req, res)=>{
  res.render("Milkmen/addCustomer")
})

app.get("/customer/panel", async(req, res)=>{
  res.render("Milkmen/customer");
})

app.get("/customer/panel/applyLeave", async(req, res)=>{
  res.render("Milkmen/leave");
})

app.get("/customer/panel/entry", async(req, res)=>{
  res.render("Milkmen/entry");
})

app.get("/customer/panel/mycustomer", async(req, res)=>{
  res.render("Milkmen/details");
})

app.post("/sendLeaveRequest", async (req, res)=>{
    try {
      const result = await applyLeave(req["body"]["state"]);  
      if (result) {
        res.send({ state : "success" });
      }
      else{
        sendErr(res, result)
      }
    } catch (error) {
      console.error(error);
      sendErr(res);
    }
})

app.get("/getDetails", async (req, res)=>{
  try {
    const result = await fetchMilkmen();
    if (result) {
        res.send({ "state" : result });
    }
  } catch (error) {
    console.error(error);
    res.send({ "state" : "failed" });
  }
})

app.get("/customer/panel/mycustomer/editCustomer", async(req, res)=>{
    // Manager/editMilkmen.hbs
    console.log(req.query.obj);
    try {
      res.render("Milkmen/editCustomer");
    } catch (error) {
      console.error(error);
      res.send({ "state" : "failed" });
    }
})

app.get("/getCustomerDetails", async(req, res)=>{
  try {
    const result = await fetchCustomerDetails();
    if (result) {
      res.send({ "state" : result });
    }
  } catch (error) {
    console.error(error);
    res.send({ "state" : "failed" });
  }
})

app.listen(9000, ()=>{
  console.log("Connected ");
})