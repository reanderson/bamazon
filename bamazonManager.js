// set required packages
require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql");
const {
  table
} = require("table")

// create connection to database
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: process.env.MYSQL_PASSWORD || "",
  database: "bamazon_db"
});

// connect to database
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  console.log(`==============================
Bamazon Manager Access`)
  mainMenu()
});

// Main Menu
// Prompts user to select what action to take
function mainMenu() {
  console.log("")
  inquirer
    .prompt([{
      type: "list",
      name: "searchMethod",
      message: "What would you like to do?",
      choices: ["View all items", "View low inventory", "Add to inventory", "Add a new product", "Close Bamazon Manager Access"]
    }])
    .then(answers => {

      if (answers.searchMethod === "View all items") {
        viewProducts()
      } else if (answers.searchMethod === "View low inventory") {
        viewLowInv()
      } else if (answers.searchMethod === "Add to inventory") {
        addInventory()
      } else if (answers.searchMethod === "Add a new product") {
        newProduct()
      } else if (answers.searchMethod === "Close Bamazon Manager Access") {
        // Code to close out of the app
        console.log("Exiting Manager Access")
        connection.end();
      }
    });
}

// Shows all available items
function viewProducts() {
  console.log("")
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    // create a table for our items
    printTable(res)
    mainMenu()
  })
}

// Shows all items with an inventory count of five or lower
function viewLowInv() {
  console.log("")
  connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function (err, res) {
    if (err) throw err;
    // create a table for our items
    printTable(res)
    mainMenu()
  })
}

// Prompts user to select an item ID
// Then asks how many of that item to add to the store
function addInventory() {
console.log("")
inquirer.prompt([{
  type: "input",
  name: "itemId",
  message: "Enter the ID of the item you'd like to add inventory to (0 to return to the menu):",
  default: "0",
  validate: function (value) {
    const valid = (!isNaN(parseInt(value))) && (parseInt(value) >= 0);
    return valid || 'Please enter a positive integer or 0';
  }
}])
.then(answers => {
  if (answers.itemId === "0") {
    mainMenu()
  } else {
    connection.query(`SELECT * FROM products WHERE item_id = ?`, [answers.itemId], function(err, res) {
      if (err) throw err;

      if (res.length === 0) {
        console.log(`No item with ${answers.itemId} found`)
        mainMenu()
      } else {
        howMuch(res[0])
      }
    })
  }
})
}

// Asks user how much to add to the stock of selected item
function howMuch(item) {
  console.log("")
  inquirer.prompt([{
    type: "input",
    name: "amt",
    message: `How many ${item.product_name}s would you like to add?`,
    default: "0",
    validate: function (value) {
      const valid = (!isNaN(parseInt(value))) && (parseInt(value) >= 0);
      return valid || 'Please enter a positive integer or 0';
    }
  }])
  .then(answers => {
    if (answers.amt === "0") {
      console.log("No change")
      mainMenu()
    } else {
      const newTotal = parseInt(answers.amt) + parseInt(item.stock_quantity)
      connection.query(
        "UPDATE products SET ? WHERE ?",
        [{
            stock_quantity: newTotal
          },
          {
           item_id: item.item_id
          }
        ],
        function (err, res) {
          console.log(`You added ${answers.amt} to the total stock of ${item.product_name}!`);
          mainMenu()
        }
      );
    }
  })
}

// Allows the user to input a new product to the store
function newProduct() {
  console.log("");
  inquirer.prompt([{
    type: "input",
    name: "product",
    message: "What item are you adding?",
    validate: function(value) {
      const valid = (value.length > 0)
      return valid || "Please enter a name for the product."
    }
  }, {
    type: "input",
    name: "department",
    message: "What department is this item in?",
    validate: function(value) {
      const valid = (value.length > 0)
      return valid || "Please enter a department name."
    }
  }, {
    type: "input",
    name: "price",
    message: "How much does this item cost?",
    validate: function(value) {
      const valid = (!isNaN(parseFloat(value))) && (parseFloat(value) > 0);
      return valid || 'Please enter a positive number';
    }
  }, {
    type: "input",
    name: "stock",
    message: "How many of this item are in stock?",
    validate: function(value) {
      const valid = (!isNaN(parseInt(value))) && (parseInt(value) >= 0);
      return valid || 'Please enter a positive integer or 0';
    }
  }])
  .then(answers => {
    console.log(answers)

    connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
    VALUES
    (?, ?, ?, ?)`, [answers.product, answers.department, answers.price, answers.stock], function(err,res) {
      if (err) throw err;

      console.log("Item added!")
      mainMenu()
    })
  })
}

// Prints a table of the items in the inputted results array
function printTable(res) {
  let data,
    output;

  data = [
    ["ID", "Item Name", "Department", "Price", "Current Stock"]
  ]

  res.forEach(function (item) {
    // Every item gets a row in this data table, which is an additional array in the array of arrays
    const rowArray = []

    rowArray.push(item.item_id)
    rowArray.push(item.product_name)
    rowArray.push(item.department_name)
    rowArray.push(`$${item.price}`)
    rowArray.push(item.stock_quantity)

    data.push(rowArray)
  })


  output = table(data)
  console.log(output)
}