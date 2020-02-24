const functions = require('firebase-functions');

const express = require('express')

const app = express()

exports.httpReq = functions.https.onRequest(app)

//Frontend code

function frontendHandler(req,res){
    res.sendFile(__dirname + '/proadmin/proadmin.html')
}

app.get('/login', frontendHandler);
app.get('/home',frontendHandler);
app.get('/add',frontendHandler);
app.get('/show',frontendHandler);

//Backend code
app.get('/',(req,res)=>{
    console.log('====================')
    console.log(req.headers)
    console.log('====================')
    res.send('<h1>My Store (from backend)_DiepNguyen</h1>')
})
