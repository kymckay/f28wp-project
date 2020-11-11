var mysql = require ('mysql');

//creating a connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

// Connect and query database
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(sql,function(err,result) {
        if (err) throw err;
        console.log("Result: " + result);
    });
});
