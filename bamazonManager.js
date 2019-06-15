var mysql = require("mysql");
var inquierer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user:"root",
    password:"603Concord!",
    database:"bamazon"
});

connection.connect(function(err){
    if(err) throw err;
    console.log("connection started");
    runBamazon();
});


function runBamazon(){

    inquierer.prompt([
        {
            type: "list",
            name:"menu",
            message:"What do you want to do",
            choices:["View products for sale","View low inventory", "Add inventory","Add new product" ]
        }
    ]).then(function(answer){
        var menuChoice = answer.menu;

        if(menuChoice ==="View Products for sale"){
            productsForsale();
        }if(menuChoice === "View low inventory"){
            lowInventory();
        }if (menuChoice === "Add inventory"){
            addInventory();
        }if(menuChoice === "Add new product"){
            addProduct();
        }
        else {
            connection.end();
        }

    })
}