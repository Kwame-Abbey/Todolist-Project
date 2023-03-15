const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js")

// console.log(date())

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb+srv://kwameabbey7:BqIwMgsQoGB3jFkh@cluster0.oi5aswp.mongodb.net/todooDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Ablordey",
});

const item2 = new Item({
  name: "Morgan",
});

const item3 = new Item({
  name: "Kwame",
});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  // res.send("Ablordey Morgan")
  // let day = date.getDay()
  // res.send(day)
  // res.sendFile(__dirname + "/index.html")

  Item.find({})
    .then((items) => {
      //   items.forEach((item) => {
      //       console.log(item.name)
      //   })
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Successfully Saved Documents");
          })
          .catch((err) => {
            console.log(err);
          });
      }

      res.render("list", {
        listTitle: "Today",
        newListItems: items,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  // console.log(req.body)
  const item = req.body.newItem;
  const listName = req.body.list.trim();

  const newItem = new Item({
    name: item,
  });

  if (listName === "Today") {
    newItem.save();

    res.redirect("/");
  } else {
    List.findOne({
      name: listName,
    }).then((foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    }).catch((err) =>{
        console.log(err)
    });
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Successfully removed document!");
    })
    .catch((err) => {
      console.log(err);
    });

  res.redirect("/");
  } else {
    List.findOneAndUpdate({
        name: listName
    },{
        $pull: {
            items: {
                _id: checkedItemId
            }
        }
    }).then((foundList) =>{
        res.redirect("/" + listName)
    }).catch((err) => {
        console.log(err)
    })
  }


});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  // console.log(req.params)

  // res.send(customListName)

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/work", (req, res) => {
  const item = req.body.newItem;
  workItems.push(item);

  res.redirect("/work");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
