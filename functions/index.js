const functions = require('firebase-functions');

const express = require('express')

const path = require('path')

const app = express()



exports.httpReq = functions.https.onRequest(app)

//Use middleware express for POST method
app.use(express.urlencoded({extended:false}))

//For insert images
app.use('/public',express.static(path.join(__dirname , '/static')))

//SET TEMPLATE ENGINE
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
const session = require('express-session')
app.use(session(
    {
        secret: 'anysecrestring.fjkdlsaj!!!',
        saveUninitialized: false,
        resave: false
    }
))

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

app.get('/',auth,async (req,res)=>{
   
   const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
   try{
       let products = []
       const snapshot = await coll.orderBy("name").get()
       snapshot.forEach(doc =>{
           products.push({id: doc.id, data:doc.data()})
       })
       //Display on web browser
            //res.send(JSON.stringify(products))
            res.render('storefront.ejs', {error: false, products,user:req.user})
   }catch(e){
       //res.send(JSON.stringify(e))
        res.render('storefront.ejs',{error: e,user:req.user})  //if error trus, give error message
   }
})

app.get('/b/about',auth,(req,res)=>{
    res.render('about.ejs',{user:req.user})
})

app.get('/b/contact',auth,(req,res)=>{
    res.render('contact.ejs',{user:req.user})
})

app.get('/b/signin',(req,res)=>{
    res.render('signin.ejs',{error: false,user:req.user})
})

app.post('/b/signin', async (req,res)=>{
    const email = req.body.email
    const password = req.body.password
    const auth = firebase.auth()
    try{
        const userRecord = await auth.signInWithEmailAndPassword(email,password)
        if(userRecord.user.email === Constants.SYSADMINEMAIL) {
            //If userRecord is sysadmind email
            //Direct to system admin page
            res.redirect('/admin/sysadmin')
        }else{
            //Direct to regular page
            res.redirect('/')
        }
        res.redirect('/')
    }catch(e){
        res.render('signin',{error:e,user:req.user})
    }
})


app.get('/b/signout', async (req,res)=>{
    try{
        await firebase.auth().signOut()
        res.redirect('/')
    }catch(e){
        res.send('ERROR: sign out!!!')
    }
})

app.get('/b/profile',auth, (req,res)=>{
   if(!req.user) {   //if not signin, direct to signin page
        res.redirect('/b/signin')
   } else {
       res.render('profile',{user: req.user})
   }
})

app.get('/b/cart',auth, (req,res)=>{
    if(!req.user) {   //if not signin, direct to signin page
         res.redirect('/b/signin')
    } else {
        res.render('cart',{user: req.user})
    }
 })

 //CREATIVITY------------------------------------------------------
 app.get('/b/products',auth, async (req,res)=>{
    if(!req.user) {   //if not signin, direct to signin page
         res.redirect('/b/signin')
    } else {

    //Retrieve specific item from products-------
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
                            //.where('cat'), isEqualTo: 'products'
                            .where("cat", "==","products")

    try{
        let products = []
        const snapshot = await coll.get()
        snapshot.forEach(doc =>{
            products.push({id: doc.id, data:doc.data()})
        })
        //Display on web browser
             //res.send(JSON.stringify(products))
             res.render('products.ejs', {error: false, products,user:req.user})
    }catch(e){
        //res.send(JSON.stringify(e))
         res.render('products.ejs',{error: e,user:req.user})  //if error trus, give error message
    }
    //--------------------------------------------

    }


 })

 app.get('/b/patterns',auth,async (req,res)=>{
    if(!req.user) {   //if not signin, direct to signin page
        res.redirect('/b/signin')
   } else {

   //Retrieve specific item from products-------
   const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
                           //.where('cat'), isEqualTo: 'products'
                           .where("cat", "==","patterns")

   try{
       let patterns = []
       const snapshot = await coll.get()
       snapshot.forEach(doc =>{
           patterns.push({id: doc.id, data:doc.data()})
       })
       //Display on web browser
            //res.send(JSON.stringify(products))
            res.render('patterns.ejs', {error: false, patterns,user:req.user})
   }catch(e){
       //res.send(JSON.stringify(e))
        res.render('patterns.ejs',{error: e,user:req.user})  //if error trus, give error message
   }
   //--------------------------------------------

   }
 })

 app.get('/b/portraits',auth, async (req,res)=>{
    if(!req.user) {   //if not signin, direct to signin page
        res.redirect('/b/signin')
   } else {

   //Retrieve specific item from products-------
   const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
                           //.where('cat'), isEqualTo: 'products'
                           .where("cat", "==","portraits")

   try{
       let portraits = []
       const snapshot = await coll.get()
       snapshot.forEach(doc =>{
           portraits.push({id: doc.id, data:doc.data()})
       })
       //Display on web browser
            //res.send(JSON.stringify(products))
            res.render('portraits.ejs', {error: false, portraits,user:req.user})
   }catch(e){
       //res.send(JSON.stringify(e))
        res.render('portraits.ejs',{error: e,user:req.user})  //if error trus, give error message
   }
   //--------------------------------------------

   }
 })
 //CREATIVITY------------------------------------------------------



app.get('/b/signup',(req,res)=>{
    res.render('signup.ejs',{page:'signup',user: null, error: false})
})



//MIDDLEWARE
function auth(req,res,next){
    req.user = firebase.auth().currentUser
    next()
}

const adminUtil = require('./adminUtil.js')
//ADMIN API
app.post('/admin/signup',(req,res)=>{
    return adminUtil.createUser(req,res)
})

app.get('/admin/sysadmin',authSysAdmin,(req,res)=>{
    res.render('admin/sysadmin.ejs')
})
app.get('/admin/listUsers',authSysAdmin,(req,res)=>{
    //Get all users from DB
    return adminUtil.listUsers(req,res)
})

function authSysAdmin(req,res,next){
    const user = firebase.auth().currentUser
    if(!user || !user.email || user.email !== Constants.SYSADMINEMAIL){
        res.send('<h1>System Admin Page: Access Denied!!!</h1>')
    } else {
        next()
    }
}



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
