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

}

// Shows all available items
function viewProducts() {

}

// Shows all items with an inventory count of five or lower
function viewLowInv() {

}

// Prompts user to select an item ID
// Then asks how many of that item to add to the store
function addInventory() {

}

// Allows the user to input a new product to the store
function newProduct() {

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