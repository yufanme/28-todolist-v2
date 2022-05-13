//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Fan:mongodb009527@cluster0.pwed7.mongodb.net/todoDB");

const itemsSchema = new mongoose.Schema({
  name: String, 
});
const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);


const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully insert many items to todolistDB!");
        }
      });
      res.redirect('/');
    } else {
      if (err) {
        console.log(err);
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.listName;
  const newItem = new Item({name: itemName});

  if (listName === "Today") {
    newItem.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName}, function(err, foundItem){
      if (err) {
        console.error(err);
      } else {
        foundItem.items.push(newItem);
        foundItem.save();
        res.redirect('/' + listName);
      }
    })
  }
  
});

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err){
      if (err) {
        console.log(err);
      } else {
        res.redirect('/' + listName);
      }
    })
  }
  
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName + "??-");
  if (customListName != "Favicon.ico") {
    List.findOne({name: customListName}, function(err,foundList){
      console.log(!foundList);
      if (err) {
        console.log(err);
      } else {
        if (foundList) {
          console.log("yes.")
          // Show the list
          res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        } else {
          // Create the list
          const list = new List({
            name: customListName,
            items: defaultItems
          })
          list.save();
          console.log("create.")
          res.redirect('/' + customListName);
        }
      }
    })
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});

