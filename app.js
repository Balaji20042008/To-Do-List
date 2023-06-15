const express = require("express");
const mongoose = require("mongoose");
const body_parser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true });

const items_schema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Mention the Name of the Item!!"] }
});

const Item = new mongoose.model("Item", items_schema);

const list_schema = new  mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Mention the Name of the Work Item"]
  },
  Items: [items_schema]
});

const List = new mongoose.model("List", list_schema);

const item_01 = new Item({
  Name: "Buy Food"
});

const item_02 = new Item({
  Name: "Cook Food"
});

const item_03 = new Item({
  Name: "Eat Food"
});

const default_items = [item_01, item_02, item_03];

// Item.insertMany(default_items, function(error) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Successfully added all the items in the to do list");
//   }
// });

app.use(body_parser.urlencoded({extended: true}));
app.use(express.static("public"));

var day = date.getDate();

app.get("/", function (request, response) {

    // Item.find({})
    //  .then(function(found_items){
    //    if (found_items.length === 0) {
    //      Item.insertMany(default_items)
    //       .then(function () {
    //         console.log("Successfully saved default items to DB");
    //       })
    //        .catch(function (error) {
    //          console.log(error);
    //        });
    //        response.redirect("/");
    //    } else {
    //      response.render("list",{
    //        title: day,
    //        value: "list",
    //        new_list_items: found_items });
    //    }
    // })
    // .catch(function(error){
    //   console.log(error);
    // });

    Item.find({})
      .then(function(found_items) {
        if (found_items.length === 0) {
          Item.insertMany(default_items)
            .then(function() {
              console.log("Successfully saved default items to DB");
            })
            .catch(function(error) {
              console.log(error);
            })
            response.redirect("/");
        } else {
          response.render("list",{
                 title: day,
                 value: "list",
                 new_list_items: found_items });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
});

app.get("/:custom_list_name", function (request, response) {
  const custom_list_name = request.params.custom_list_name;

  List.findOne({Name: custom_list_name})
   .then (function (found_list) {
      if (!found_list) {
        const list = new List({
          Name: custom_list_name,
          Items: default_items
        }); list.save();
        response.redirect("/" + custom_list_name);
      } else {
        response.render("list",{
          title: found_list.Name,
          value: found_list.Name,
          new_list_items: found_list.Items});
      }
   })
   .catch (function (error) {
     console.log(error);
   });
});

app.post("/", function (request, response) {
  const item_name = request.body.new_item;
  const list_name = request.body.list;

  const new_item = new Item({
    Name: item_name
  });

  if (list_name === day) {
    new_item.save();
    response.redirect("/");
  } else {
    List.findOne({Name: list_name})
     .then(function(found_list) {
      var found_list = new List({
        Name: list_name,
        Items: [items_schema]
      });
       found_list.Items.push(new_item);
       found_list.save();
       response.redirect("/" + list_name)
     })
     .catch(function(error){
       console.log(error);
     });
  }
});

app.post("/delete", function (request, response) {
  Item.findByIdAndRemove(request.body.checkbox)
   .then(function () {
     console.log(request.body.checkbox);
   })
   .catch(function (error) {
     console.log(error);
   });
   response.redirect("/");
});



app.get("/about", function (request, response) {
  response.render("about");
});

app.listen(3000, function () {
  console.log("The server is running on port 3000.");
});
