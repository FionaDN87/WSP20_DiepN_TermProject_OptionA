const functions = require('firebase-functions');

const express = require('express')

const path = require('path')

const app = express()



exports.httpReq = functions.https.onRequest(app)

//Use middleware express for POST method
app.use(express.urlencoded({extended:false}))

//For insert images
app.use('/public',express.static(path.join(__dirname , '/static')))

//SET TEMPLACE ENGINE
app.set('view engine','ejs')
//LOCATION OF EJS
app.set('views','./ejsviews')


//Frontend code

function frontendHandler(req,res){
    res.sendFile(__dirname + '/proadmin/proadmin.html')
}

app.get('/login', frontendHandler);
app.get('/home',frontendHandler);
app.get('/add',frontendHandler);
app.get('/show',frontendHandler);

//Backend code
const firebase = require('firebase')
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB48iPuYcKGZC8YYJ9tyrzKINCSEPcamDY",
    authDomain: "diepn-wsp20.firebaseapp.com",
    databaseURL: "https://diepn-wsp20.firebaseio.com",
    projectId: "diepn-wsp20",
    storageBucket: "diepn-wsp20.appspot.com",
    messagingSenderId: "81923847157",
    appId: "1:81923847157:web:8c9f8c8b15764cac3526bc"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  //Define variable
  const Constants = require('./myconstant.js')

app.get('/',async (req,res)=>{
   
   const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
   try{
       let products = []
       const snapshot = await coll.orderBy("name").get()
       snapshot.forEach(doc =>{
           products.push({id: doc.id, data:doc.data()})
       })
       //Display on web browser
            //res.send(JSON.stringify(products))
            res.render('storefront.ejs', {error: false, products})
   }catch(e){
       //res.send(JSON.stringify(e))
        res.render('storefront.ejs',{error: e})  //if error trus, give error message
   }
})

//TEST CODE
//REMEMBER: APP.GET HANDLES GET METHOD ONLY
app.get('/testlogin',(req,res)=>{
    //res.sendFile(path.join(__dirname, '/static/html/login.html'))  //This does not work
    res.sendFile(__dirname + '/static/html/login.html')
})

//APP.POST IS USED FOR POST METHOD
app.post('/testsignIn',(req,res)=>{
    //Read data from input
    const email=req.body.email
    const password=req.body.pass
    //let page =`
    //{POST} You entered: ${email} and ${password}
    //`;
    //res.send(page)   //send String to testsignIn
    const obj = {
        a: email,
        b: password,
        c: '<h1>login success</h1>',
        d: '<h1>login success</h1>',
        start: 1,
        end: 10,
    }
    res.render('home', obj)
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
