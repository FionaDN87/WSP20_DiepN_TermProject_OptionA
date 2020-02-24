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

//TEST CODE
app.get('/testlogin',(req,res)=>{
    //res.sendFile(path.join(__dirname, '/static/html/login.html'))  //This does not work
    res.sendFile(__dirname + '/static/html/login.html')
})

app.get('/testsignIn',(req,res)=>{
    //Read data from input
    const email=req.query.email
    const password=req.query.pass
    let page =`
    You entered: ${email} and ${password}
    `;
    res.send(page)   //send String to testsignIn
})



//Client connect to /test
app.get('/test',(req,res)=>{
    const time = new Date().toString()   //Server side => Serve time is read
    let page =`
    <h1>Current time at Server: ${time}</h1>
    `;
    res.header('refresh',1)   //Connect client again in 1 second => client connects to server every second
    res.send(page)
})

//Client connect to /test2
app.get('/test2',(req,res)=>{
    res.redirect('http://www.uco.edu')  //Forwarding to another website
})
