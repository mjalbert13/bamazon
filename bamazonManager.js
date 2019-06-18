var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table")

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

    inquirer.prompt([
        {
            type: "list",
            name:"menu",
            message:"What do you want to do",
            choices:["View products for sale","View low inventory", "Add inventory","Add new product","Exit"]
        }
    ]).then(function(answer){
        var menuChoice = answer.menu;
        console.log(menuChoice);

        if(menuChoice ==="View products for sale"){
            productsForsale();
        }else if(menuChoice === "View low inventory"){
            lowInventory();
        }else if (menuChoice === "Add inventory"){
            addInventory();
        }else if(menuChoice === "Add new product"){
            addProduct();
        }
        else {
            connection.end();
        }

    })
}

function productsForsale(){
    var table = new Table({
        head:['Item ID','Product Name','Department','Price','In Stock'],
        style:{
            head: ['green'],
            compact: false,
            colAligns:['center'],
        }
    });

    connection.connect(function(){
        connection.query("SELECT * FROM products", function(err,res){
            if(err) throw err;
            for(var i =0; i< res.length; i++){
                table.push([res[i].item_id,res[i].product_name,res[i].department_name,res[i].price,res[i].stock_quantity]);
            };
            console.log(table.toString());
            retry();
        });
    });
};

function lowInventory(){
    var lowStock =[];
    var table = new Table({
        head:['Item ID','Product Name','Department','Price','In Stock'],
        style:{
            head: ['red'],
            compact: false,
            colAligns:['center'],
        }
    })

    connection.query("SELECT * FROM products WHERE stock_quantity < 5",function(err, res){
        if(err) throw err;
        for(var i =0; i<res.length; i++){
            if(res[i].stock_quantity < 5){
                lowStock.push(res[i]);
            }
        }
        for(var i =0; i < lowStock.length; i++){
            if(lowStock.length < 1){
                console.log("Your Stock looks good!");
            }else{
            table.push([res[i].item_id,res[i].product_name,res[i].department_name,res[i].price,res[i].stock_quantity]);
            }
        }
        console.log(table.toString());
        retry();
    })
    
}

function addInventory(){


    connection.query("SELECT * FROM products", function(err,res){
        if(err) throw err;
        var productList = [];
        for(var i =0; i< res.length; i++){
            productList.push(res[i].product_name)
        };
        inquirer.prompt([
            {
                type:"list",
                name:"inventory",
                message:"What product do you want to add stock to?",
                choices: productList
            },
            {
                type:"input",
                name:"quantity",
                message:"How much do you want add?",
                validate:function(value){
                    if(isNaN(value)===false){
                        return true;
                    }else{
                        return false;
                    }
                }
            }
        ]).then(function(answer){
            var currentStock;
            for(var i =0; i<res.length; i++){
                if(res[i].product_name === answer.inventory){
                    currentStock = res[i].stock_quantity;
                }
            }
            connection.query("UPDATE products SET ? WHERE ?", 
            [{stock_quantity: parseInt(currentStock) +parseInt(answer.quantity)},{product_name: answer.inventory}],
            function(err, res){
                if(err) throw err;
                console.log("\nAdding "+answer.quantity+" to "+answer.inventory+"\n")
            })
            retry();
        })
    
    });
}

function addProduct(){

    inquirer.prompt([
        {
            type:"input",
            name:"product",
            message: "What it the product",
            validate :function(value){
                if(value){
                    return true;
                }else{
                    return false;
                }
            }
        },
        {
            type:"input",
            name:"department",
            message:"What department does it belong in?",
            validate: function(value){
                if(value){
                    return true;
                }else{
                    return false;
                }
            }   
        },
        {
            type:"input",
            name:"price",
            message:"What is the price?",
            validate: function(value){
                if(isNaN(value)===false){
                    return true;
                }else{
                    return false;
                }
            }
        },
        {
            type:"input",
            name:"quantity",
            message:"How many are you adding?",
            validate: function(value){
                if(isNaN(value)===false){
                    return true;
                }else{
                    return false;
                }
            }
        }
    ]).then(function(answer){
        connection.query("INSERT INTO products SET ?",
        {
            product_name: answer.product,
            department_name: answer.department,
            price: answer.price,
            stock_quantity: answer.quantity
        },function(err,res){
            if(err) throw err;
            console.log("\nYou added "+answer.product+" to the database\n")
        })
        retry();
    });
}

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
