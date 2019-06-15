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
            choices:["View products for sale","View low inventory", "Add inventory","Add new product","Exit"]
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

function productsForsale(){

    connection.connect(function(){
        connection.query("SELECT * FROM products", function(err,res){
            if(err) throw err;
            for(var i =0; i< res.length; i++){
                console.log("\nID: "+res[i].item_id+" | Item: "+res[i].product_name+" | Department: "+res[i].department_name+" | Price: "+res[i].price+" | In Stock: "+res[i].stock_quantity+" |\n");
            };
        });
    });

    retry();
};


function retry() {
    inquirer.prompt([
        {
            type:"list",
            name:"retry",
            message:"Do you want to do something else?",
            choices: ["Yes", "No"]
        }
    ]).then(function(answer){
        if(answer.retry === "Yes"){
            runBamazon();
        }else{
            console.log("Thanks for stopping by.");
            connection.end();
        };
    });
};
