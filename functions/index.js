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
    res.sendFile(path.join(__dirname , '/proadmin/proadmin.html'))

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
        name: '__session',
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
    const cartCount  = req.session.cart ? req.session.cart.length : 0
   const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
   try{
       let products = []
       const snapshot = await coll.orderBy("name").get()
       snapshot.forEach(doc =>{
           products.push({id: doc.id, data:doc.data()})
       })
       //Display on web browser
            //res.send(JSON.stringify(products))
            
            //Fix bug deploying to make add to cart work
            res.setHeader('Cache-Control','private');
            //-----------------------------------------


            res.render('storefront.ejs', {error: false, products,user:req.user,cartCount})
   }catch(e){
       //Fix bug deploying to make add to cart work
       res.setHeader('Cache-Control','private');
       //-----------------------------------------
       //res.send(JSON.stringify(e))
        res.render('storefront.ejs',{error: e,user:req.user,cartCount})  //if error trus, give error message
   }
})

app.get('/b/about',auth,(req,res)=>{
    const cartCount  = req.session.cart ? req.session.cart.length : 0

    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------

    res.render('about.ejs',{user:req.user,cartCount})
})

app.get('/b/contact',auth,(req,res)=>{
    const cartCount  = req.session.cart ? req.session.cart.length : 0

    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------

    res.render('contact.ejs',{user:req.user,cartCount})
})

app.get('/b/signin',(req,res)=>{

    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------

    res.render('signin.ejs',{error: false,user:req.user,cartCount:0})
})

app.post('/b/signin', async (req,res)=>{
    const email = req.body.email
    const password = req.body.password
    const auth = firebase.auth()
    try{
        const userRecord = await auth.signInWithEmailAndPassword(email,password)
        if(userRecord.user.email === Constants.SYSADMINEMAIL) {

            //Fix bug deploying to make add to cart work
            res.setHeader('Cache-Control','private');
            //-----------------------------------------
            //If userRecord is sysadmind email
            //Direct to system admin page
            res.redirect('/admin/sysadmin')
        }else{
            if(!req.session.cart){
            //Fix bug deploying to make add to cart work
            res.setHeader('Cache-Control','private');
            //-----------------------------------------
            //Direct to regular page
            res.redirect('/')
            } else {
                //Fix bug deploying to make add to cart work
                res.setHeader('Cache-Control','private');
                //-----------------------------------------
                res.redirect('/b/shoppingcart')
            }
        }
        
    }catch(e){
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        res.render('signin',{error:e,user:req.user,cartCount:0})
    }
})


app.get('/b/signout', async (req,res)=>{
   
    try{
        //Empty cart when signing out
        req.session.cart = null
        await firebase.auth().signOut()
        
        res.redirect('/')
    }catch(e){
        res.send('ERROR: sign out!!!')
    }
})

app.get('/b/profile',authAndRedirectSignIn, (req,res)=>{
 
       const cartCount  = req.session.cart ? req.session.cart.length : 0

       //Fix bug deploying to make add to cart work
       res.setHeader('Cache-Control','private');
       //-----------------------------------------
       res.render('profile',{user: req.user, cartCount,orders: false})
   
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
    res.render('signup.ejs',{page:'signup',user: null, error: false, cartCount:0})
})


const ShoppingCart = require('./model/ShoppingCart.js')
app.post('/b/add2cart', async (req,res)=>{
    const id = req.body.docID
    const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try{
        const doc = await collection.doc(id).get()
        //Store product ID into shopping cart
        let cart;
        if(!req.session.cart){
            // first time add to cart
            //Create new shopping cart object
            cart = new ShoppingCart()
        }else {
            cart = ShoppingCart.deserialize(req.session.cart)
        }
        const {name,price,summary,image,image_url} = doc.data()
        cart.add({id, name, price, summary, image, image_url})

        //update shopping cart into session
        req.session.cart = cart.serialize()

        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        //Redirect to backend
        res.redirect('/b/shoppingcart')
    }catch(e){
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        res.send(JSON.stringify)
    }
})

app.get('/b/shoppingcart',authAndRedirectSignIn, (req, res)=> {
    let cart
    if(!req.session.cart){
        cart = new ShoppingCart()
    } else {
        cart = ShoppingCart.deserialize(req.session.cart)
    }
    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------
    //passing cart into shoppingcart.ejs
    res.render('shoppingcart.ejs',{message: false, cart, user: req.user, cartCount: cart.contents.length})
})

app.post('/b/checkout',authAndRedirectSignIn,async (req,res)=>{
    if(!req.session.cart) {  //NO shopping cart
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        return res.send('Shoping cart is EMPTY')
    }
    // data format to store in firestore
    // collection : orders
    // {uid, timestamp cart}
    // cart = [{products, qty}...]  //Content in shopping cart
    const data = {
        uid: req.user.uid,
        timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        cart: req.session.cart
    }
    try{
        const collection = firebase.firestore().collection(Constants.COLL_ORDERS)
        await collection.doc().set(data)
        req.session.cart = null //empty cart
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        return res.render('shoppingcart.ejs', 
        {message: 'Checked Out Successfully!', cart: new ShoppingCart(), user: req.user, cartCount: 0})
    }catch(e){
        const cart = ShoppingCart.deserialize(req.session.cart)
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        return res.render('shoppingcart.ejs',
        {message: 'Check out FAILED! Try again later!!!', cart, user: req.user, cartCount: cart.contents.length}
        )
       
        //Retain cart when checking out fails
    }
})

app.get('/b/orderhistory',authAndRedirectSignIn,async (req,res)=>{
    try{
        const collection = firebase.firestore().collection(Constants.COLL_ORDERS)
        let orders=[]   //order history
        const snapshot = await collection.where("uid","==",req.user.uid).orderBy("timestamp").get()
        snapshot.forEach(doc => {
            orders.push(doc.data())
        })
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        res.render('profile.ejs', {user: req.user, cartCount:0, orders})       
    }catch(e){
        console.log('==============',e)
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        res.send('<h1>Order History Error!!!!</h1>')
    }
})


//MIDDLEWARE
function authAndRedirectSignIn(req,res,next){
    const user = firebase.auth().currentUser
    if(!user){
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        return res.redirect('/b/signin')
    }else{
        req.user = user
        return next()
    }
}


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
        return res.send('<h1>System Admin Page: Access Denied!!!</h1>')
    } else {
        return next()
    }
}



//TEST CODE
//REMEMBER: APP.GET HANDLES GET METHOD ONLY
app.get('/testlogin',(req,res)=>{
    //res.sendFile(path.join(__dirname, '/static/html/login.html'))  //This does not work
    res.sendFile(path.join(__dirname , '/static/html/login.html'))
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
