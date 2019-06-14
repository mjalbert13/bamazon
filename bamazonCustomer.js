var inquirer = require("inquirer");
var mysql = require("mysql");

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

    connection.connect(function(){
    
        connection.query("SELECT * FROM products", function(err, res){
            if(err) throw err;
            for(var i =0; i< res.length; i++){
                console.log("\nID: "+res[i].item_id+" | Item: "+res[i].product_name+" | Department: "+res[i].department_name+" | Price: "+res[i].price+" | In Stock: "+res[i].stock_quantity+" |\n");
            }
            
            inquirer.prompt([
                {
                    type:"rawlist",
                    name:"product",
                    message: "What product number do you want to buy?",
                    choices: function(value){
                        var productAray=[];
                        for(var i =0; i < res.length; i++){
                            productAray.push(res[i].product_name)
                        }
                        return productAray;
                    }
                },
                {
                    type:"input",
                    name:"quantity",
                    message:"How many units do you want?",
                    validate: function(val){
                        if(isNaN(val)===false){
                            return true;
                        }else{
                            return false;
                        }
                    }
                }
            ]).then(function(answer){
                var product = answer.product;
                var quantity = answer.quantity;
                
                for(var i = 0; i< res.length; i++){
                    if(res[i].product_name === product){
                        var choice = res[i];
                    }
                }
                var stock = parseInt(choice.stock_quantity) - parseInt(answer.quantity);
                
                if(choice.stock_quantity < parseInt(quantity)){
                    console.log("Sorry it looks like we can't fill your order of "+ res[i].product_name);
                    retry();
                } else{
                    connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: stock}, {item_id: choice.item_id}], function(err, res){
                        console.log("Your purchase has been accepted!")
                        var total = parseInt(quantity)*choice.price;
                        console.log("Your total is "+total);
                        retry();
                    });
                }

            })

        });
    });

    
};

function retry() {
    inquirer.prompt([
        {
            type:"list",
            name:"retry",
            message:"Do you want to make another purchase?",
            choices: ["Yes", "Nn"]
        }
    ]).then(function(answer){
        if(answer.retry === "Yes"){
            runBamazon();
        }else{
            console.log("Thanks for stopping by.");
            connection.end();
        }
    })
}