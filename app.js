//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
// const date = require(__dirname + "/date.js");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://alkama_123:Alkama123@cluster0.rgltw.mongodb.net/todolistDB",{useNewUrlParser:true});

// mongodb+srv://alkama_123:<password>@cluster0.rgltw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// Schema for item 
const itemschema = new mongoose.Schema({
  name:{
        type:"string",
        required:true
  }
});
// Model Name required for creating documents 
const Item = new mongoose.model("Item",itemschema);
// schema for list Custom Route 
const listschema = new mongoose.Schema({
  name:String,
  items:[itemschema]
});

const List = new mongoose.model("List",listschema);


// Creating the Dummy Items for Starting if Nothing is in the Todo list 
const item1 = new Item({
  name:"Welcome to do list"
});

const item2 = new Item({
  name:"create new item and hit + plus"
});
const item3 = new Item({
  name:"<-- hit this to delete"
});

// the array of default Items
const defaultItems = [item1,item2,item3];
// const day = date.getDate();
//  Home Route 
app.get("/", function(req, res) {
  Item.find({},function(err,founditems){
    if(founditems.length==0)
    {
      Item.insertMany(defaultItems, function(err){

        if(err)console.log(err);
        else{
          console.log("Sucessfully inserted");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }  
  });
});


// Custom route for any other route 
app.get("/:customlistName",function(req,res){
    
    const customlistName = _.capitalize(req.params.customlistName);
    List.findOne({name:customlistName}, function(err,foundlist){
      if(!err){
        if(!foundlist)
        {
           const customlist= new List({
           name:customlistName,
           items:defaultItems
          });
           customlist.save();
           res.redirect("/" + customlistName);
        }
        else{
         res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items});
        }
      }
      else
      console.log("error");
    });

});

// Clicking on + 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName}, function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
     
  }
  
});

// once checked the checkbox
app.post("/delete", function(req, res){


  const itemchekedId= req.body.checkbox;
  const listName = req.body.listName;
  // console.log(listName);

  if(listName === "Today")
  {
    Item.findByIdAndRemove(itemchekedId, function(err){
      if(err){
        console.log(err);
      }
    });
      res.redirect("/");
  }
  else
  {
      List.findOneAndRemove({name:listName},{$pull:{items:{_id:itemchekedId}}},function(err,foundlist){
          if(!err){
            res.redirect("/" + listName);
          }
      });
  }
  // Item.findByIdAndRemove(itemchekedId, function(err){
  //   if(err){
  //     console.log(err);
  //   }
  // });
  //   res.redirect("/");
 
//   Item.deleteOne({ _id: itemchekedId }, function(err) {
//    if(err) {
//      console.log("there is error");
//    }
// });

}); 





let port = process.env.PORT;
if (port == null || port == "") {
    port = 4000;
}
app.listen(port, function () {
    console.log("server has started successfully");
});
