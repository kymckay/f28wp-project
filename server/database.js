var mysql = require ('mysql');

//creating a connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});

// Connect and create database
con.connect(function(err) {
    if (err) throw err;
    console.log("connected");
    con.query(sql,function(err,result) {
        if (err) throw err;
        console.log("Database Dreated");
});
