//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jaya:Test123@cluster0.jh8h4.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to ToDoList"
})

const item2 = new Item({
  name: "Hit the + button to add items"
})

const item3 = new Item({
  name: "<--- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("added items list successfully");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  })
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save()
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName)
    })
  }

});

app.post("/delete", function(req, res) {
  const itemChecked = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(itemChecked, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    })
  } else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: itemChecked}}}, function(err,foundlist){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

})

app.get("/:customeListName", function(req, res) {
  const customeListName = _.capitalize(req.params.customeListName);


  List.findOne({
    name: customeListName
  }, function(err, customeName) {
    if (!err) {
      if (!customeName) {
        const list = new List({
          name: customeListName,
          items: defaultItems
        })
        list.save()
        res.redirect("/" + customeListName)
      } else {
        res.render("list",{ listTitle: customeName.name,
        newListItems: customeName.items})
      }
    }
  })
})

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(3000);
app.listen(port, function() {
  console.log("Server has started successfully");
});
