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
  password: process.env.MYSQL_PASSWORD,
  database: "bamazon_db"
});

// connect to database
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  console.log(`==============================
Welcome to Bamazon!`)
  chooseSearch()
});



//Function to select search method
function chooseSearch() {
  console.log("")
  inquirer
    .prompt([{
      type: "list",
      name: "searchMethod",
      message: "What would you like to do?",
      choices: ["See all items", "Search by ID", "Search by name", "Search by department", "Exit Bamazon"]
    }])
    .then(answers => {

      if (answers.searchMethod === "See all items") {
        seeAll()
      } else if (answers.searchMethod === "Search by ID") {
        searchById()
      } else if (answers.searchMethod === "Search by name") {
        searchByName()
      } else if (answers.searchMethod === "Search by department") {
        searchByDept()
      } else if (answers.searchMethod === "Exit Bamazon") {
        // Code to close out of the app
        console.log("Thank you for choosing Bamazon. We hope you come again!")
        connection.end();
      }
    });
}

// View all items in the products database, before running an ID search
function seeAll() {
  console.log("")
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    // create a table for our items
    printTable(res)
    searchById()
  })
}

// Search the database for an item by its unique ID
// If user enters 0, return to the beginning of the search process.
function searchById() {
  console.log("")
  inquirer
    .prompt([{
      type: "input",
      name: "searchId",
      message: "Enter the ID number of the item you'd like to purchase (Enter 0 to start over):",
      validate: function (value) {
        const valid = (!isNaN(parseInt(value))) && (parseInt(value) >= 0);
        return valid || 'Please enter a positive integer or 0';
      }
    }])
    .then(answers => {
      if (answers.searchId === "0") {
        chooseSearch()
      } else {
        connection.query("SELECT * FROM products WHERE item_id = ?", [answers.searchId], function (err, res) {
          if (err) throw err;
          searchResults(res)
        })
      }
    })
}

// Search the database for items by name
// Searches for all names that include the search term
function searchByName() {
  console.log("")
  inquirer
  .prompt([{
    type: "input",
    name: "searchTerm",
    message: "Enter the item you would like to search for:"
  }])
  .then(answers => {

    connection.query("SELECT * FROM products WHERE product_name LIKE ?", [`%${answers.searchTerm}%`], function (err, res) {
      if (err) throw err;

      searchResults(res)
    })

  })
}

// Search the database for items by department
// User may choose from all available departments
function searchByDept() {
  console.log("")
  connection.query("SELECT department_name FROM products", function (err, res) {
    if (err) throw err;
    const deptList = []

    res.forEach(function(item) {
      if (!deptList.includes(item.department_name)) {
        deptList.push(item.department_name)
      }
    })

    deptList.push("New Search")

    inquirer
    .prompt([{
      type: "list",
      name: "chooseDept",
      message: "Choose a Department:",
      choices: deptList
    }])
    .then(answers => {
      if (answers.chooseDept === "New Search") {
        chooseSearch()
      } else {
        connection.query("SELECT * FROM products WHERE department_name = ?", [answers.chooseDept], function(err, res) {
          searchResults(res)
        })
      }
    })
    
  })
}

// Takes the results of a database search
// Depending on length of results array, either start the search over, prompt user for a confirmation, or ask user to choose which of a narrower selection they would like.
function searchResults(res) {
  console.log("")
  if (res.length === 0) {
    console.log("No results found. Please try a different search.")
    chooseSearch()
  } else if (res.length === 1) {
    confirmSelection(res[0])
  } else {
    console.log("Search Results:")
    printTable(res)

    const options = []

    res.forEach(function(item) {
      const option = {}
      option.name = item.product_name;
      option.value = item;

      options.push(option)
    })

    options.push({
      name: "New Search",
      value: "0"
    })

    inquirer
      .prompt([{
        type: "list",
        name: "itemselect",
        message: "Select Item:",
        choices: options
      }])
      .then(answers => {
        if (answers.itemselect === "0") {
          chooseSearch()
        } else {
          confirmSelection(answers.itemselect)
        }
      })
  }
}

// Prompts user to confirm if the item is the one they'd like to purchase
// If yes, move on to select amount
// If no, start over
function confirmSelection(item) {
  console.log("")
  inquirer
  .prompt([{
    type: "confirm",
    name: "selectConfirm",
    message: `Purchase ${item.product_name}?`,
    default: true
  }])
  .then(answers => {
    if (answers.selectConfirm) {
      purchaseNumber(item)
    } else {
      chooseSearch()
    }
  })
}

// Prompts user to input the number of the item that they wish to buy
// If 0 is entered, start over
// If a value greater than 0 is entered, compare to current inventory for the item
// If not enough items, alert user as such, and start over
// If there are enough items, then proceed to a purchase confirmation
function purchaseNumber(item) {
  console.log("")
  inquirer
    .prompt([{
      type: "input",
      name: "purchaseNum",
      message: `How many ${item.product_name} would you like to buy? (Enter 0 to start over)`,
      validate: function (value) {
        const valid = (!isNaN(parseInt(value))) && (parseInt(value) >= 0);
        return valid || 'Please enter a positive integer or 0';
      }
    }])
    .then(answers => {
      if (answers.purchaseNum === "0") {
        chooseSearch()
      } else {
        if (parseInt(answers.purchaseNum) > parseInt(item.stock_quantity)) {
          console.log(`Not enough ${item.product_name} in stock! Try again later.`)
          chooseSearch()
        } else {
          confirmPurchase(item, parseInt(answers.purchaseNum))
        }
      }
    })
}

// Asks for a purchase confirmation
// If yes, tell the user their purchase went through, and update database accordingly
// If no, do nothing
// In both cases, start a search over again.
function confirmPurchase(item, num) {
  console.log("")
  inquirer
  .prompt([{
    type: "confirm",
    name: "purchaseConfirm",
    message: `Purchase ${num} ${item.product_name}(s) for $${parseFloat(item.price) * num}?`,
    default: true
  }])
  .then(answers => {
    if (answers.purchaseConfirm) {
      
      connection.query(
        "UPDATE products SET ? WHERE ?",
        [{
            stock_quantity: (parseInt(item.stock_quantity) - num)
          },
          {
           item_id: item.item_id
          }
        ],
        function (err, res) {
          console.log("You successfully made a purchase!");
          chooseSearch()
        }
      );
      
    } else {
      console.log(`You did not purchase the ${item.product_name}(s).`)
      chooseSearch()
    }
  })
}

// Prints a table of the items in the inputted results array
function printTable(res) {
  let data,
    output;

  data = [
    ["ID", "Item Name", "Department", "Price"]
  ]

  res.forEach(function (item) {
    // Every item gets a row in this data table, which is an additional array in the array of arrays
    const rowArray = []

    rowArray.push(item.item_id)
    rowArray.push(item.product_name)
    rowArray.push(item.department_name)
    rowArray.push(`$${item.price}`)

    data.push(rowArray)
  })


  output = table(data)
  console.log(output)
}