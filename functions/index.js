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
        resave: false,
        secure: true,
        maxAge: 1000*60*60*2, //(2 hours)
        rolling: true,    //Reset maxAge at every response
    }
))


//************************************/



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
  const adminUtil = require('./adminUtil.js')

app.get('/',auth,async (req,res)=>{
    console.log('================', req.decodedIdToken ? req.decodedIdToken.uid : 'no user')
    //------
    let cart;
        if(!req.session.cart){
            // first time add to cart
            //Create new shopping cart object
            cart = new ShoppingCart()
        }else {
            cart = ShoppingCart.deserialize(req.session.cart)
        }
        //const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try{
        //Get stored items for currently signed in UID
        const storedItems = await adminUtil.getStoredBasket(req.decodedIdToken)
        //console.log("==================LENGTH STOREDBASKET="+ storedItems.length)
        storedItems.forEach(stored => {
            for (let i = 0; i< stored.cart.length; i++){  //each cart is 1 stored item
                console.log("*************"+ stored.cart[i].product.name)
                var id = stored.cart[i].product.id
                var name = stored.cart[i].product.name
                var price = stored.cart[i].product.price
                var summary = stored.cart[i].product.summary
                var image = stored.cart[i].product.image
                var image_url = stored.cart[i].product.image_url
                var qty = stored.cart[i].qty
                //const doc = collection.doc(stored.cart[i].product.id).get()
                //const {name,price,summary,image,image_url} = doc.data()
                cart.addfromDB({id, name, price, summary, image, image_url},qty)
                 
            } 
        }) 
        //update shopping cart into session
        req.session.cart = cart.serialize()

        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');       
    }catch(e){
        console.log('==============',e)
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');  
    }
    //------
    const cartCount  = req.session.cart ? req.session.cart.length : 0
    const cartCountW  = req.session.cartW ? req.session.cartW.length : 0
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)

    console.log("~~~~~~~~~~~~~~~~~~~~~~CARTCOUNT="+cartCount)
    
   try{
       let products = []
       const snapshot = await coll.orderBy("name").get()
       snapshot.forEach(doc =>{
           products.push({id: doc.id, data:doc.data()})
       })
       var pages=(Math.ceil(products.length/10));
       //Display on web browser
            //res.send(JSON.stringify(products))
            
            //Fix bug deploying to make add to cart work
            res.setHeader('Cache-Control','private');
            //-----------------------------------------
            res.render('storefront.ejs', {error: false, products:products.slice(0,10),user:req.decodedIdToken,cartCount,cartCountW,pages,current:1})
   }catch(e){
       //Fix bug deploying to make add to cart work
       res.setHeader('Cache-Control','private');
       //-----------------------------------------
       //res.send(JSON.stringify(e))
        res.render('storefront.ejs',{error: e,user:req.decodedIdToken,cartCount,cartCountW,pages,current:1})  //if error true, give error message
   }
})

app.get('/b/about',auth,(req,res)=>{
    const cartCount  = req.session.cart ? req.session.cart.length : 0
    const cartCountW  = req.session.cartW ? req.session.cartW.length : 0
    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------

    res.render('about.ejs',{user:req.decodedIdToken,cartCount, cartCountW})
})

app.get('/b/contact',auth,(req,res)=>{
    const cartCount  = req.session.cart ? req.session.cart.length : 0
    const cartCountW  = req.session.cartW ? req.session.cartW.length : 0
    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------

    res.render('contact.ejs',{user:req.decodedIdToken,cartCount,cartCountW})
})

app.get('/b/signin',(req,res)=>{

    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------
    

    res.render('signin.ejs',{error: false,user:req.decodedIdToken,cartCount:0,cartCountW:0})
})

app.post('/b/signin', async (req,res)=>{
   
    const email = req.body.email
    const password = req.body.password
    const auth = firebase.auth()
    try{
        //Cookie persistent setting
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
        const userRecord = await auth.signInWithEmailAndPassword(email,password)
        const idToken = await userRecord.user.getIdToken()  //return incoded idToken
        await auth.signOut()    //signout

        req.session.idToken = idToken   //each user has different session, store idToken into session variable
      
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
        res.render('signin',{error:e,user:null,cartCount:0,cartCountW:0})
    }
})


app.get('/b/signout', authAndRedirectSignIn, (req,res)=>{
    const cartCount  = req.session.cart ? req.session.cart.length : 0
    const data = {
        uid: req.decodedIdToken.uid,
        cart: req.session.cart
    }
    if(cartCount!==0){  //Sign Out with something in basket
        //Store cart into Firebase before signing out
       
        //--------
        
        try{
             adminUtil.storeBasket(data)
            
            //Fix bug deploying to make add to cart work
            res.setHeader('Cache-Control','private');
           
        }catch(e){
         
            //Fix bug deploying to make add to cart work
            res.setHeader('Cache-Control','private');
            console.log ('ERROR', e)
           
        }
        //--------

        //Destroy session
        req.session.destroy(err=>{
            if(err){
             console.log('======== session.destroy error: ', err)
             req.session  = null
             res.send('Error: sign out (session.destroy error)')
            }else {
                
                res.redirect('/')
            }
        })

    }else{
        //cart is empty
        //Destroy session
        req.session.destroy(err=>{
            if(err){
             console.log('======== session.destroy error: ', err)
             req.session  = null
             res.send('Error: sign out (session.destroy error)')
            }else {
                
                res.redirect('/')
            }
        })
    }
   
   
})

app.get('/b/profile',authAndRedirectSignIn, (req,res)=>{
 
       const cartCount  = req.session.cart ? req.session.cart.length : 0
       const cartCountW  = req.session.cartW ? req.session.cartW.length : 0

       console.log('========== decodedIdToken', req.decodedIdToken)
       //Fix bug deploying to make add to cart work
       res.setHeader('Cache-Control','private');
       //-----------------------------------------
       res.render('profile',{user: req.decodedIdToken, cartCount,cartCountW,orders: false})
   
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
    res.render('signup.ejs',{page:'signup',user: null, error: false, cartCount:0,cartCountW:0})
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

app.get('/b/shoppingcart',authAndRedirectSignIn,  async (req, res)=> {
    let cart
    console.log("==================SHOPPING CART===================")

    //------


        if(!req.session.cart){
            // first time add to cart
            //Create new shopping cart object
            cart = new ShoppingCart()
        }else {
            cart = ShoppingCart.deserialize(req.session.cart)
        }
        //const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try{
        //Get stored items for currently signed in UID
        const storedItems = await adminUtil.getStoredBasket(req.decodedIdToken)
        //console.log("==================LENGTH STOREDBASKET="+ storedItems.length)
        storedItems.forEach(stored => {
            for (let i = 0; i< stored.cart.length; i++){  //each cart is 1 stored item
                console.log("*************"+ stored.cart[i].product.name)
                var id = stored.cart[i].product.id
                var name = stored.cart[i].product.name
                var price = stored.cart[i].product.price
                var summary = stored.cart[i].product.summary
                var image = stored.cart[i].product.image
                var image_url = stored.cart[i].product.image_url
                var qty = stored.cart[i].qty
                //const doc = collection.doc(stored.cart[i].product.id).get()
                //const {name,price,summary,image,image_url} = doc.data()
                cart.addfromDB({id, name, price, summary, image, image_url},qty)
                 
            } 
        }) 
        //update shopping cart into session
        req.session.cart = cart.serialize()

        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');       
    }catch(e){
        console.log('==============',e)
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');  
    }
    //------

    if(!req.session.cart){
        cart = new ShoppingCart()
    } else {
        cart = ShoppingCart.deserialize(req.session.cart)
    }

    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------
    //passing cart into shoppingcart.ejs
    res.render('shoppingcart.ejs',{message: false, cart, user: req.decodedIdToken, cartCount: cart.contents.length})
})

//----
app.get('/:page', async function(req, res, next) {
    const cartCount  = req.session.cart ? req.session.cart.length : 0
    const cartCountW  = req.session.cartW ? req.session.cartW.length : 0
    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    
    var perPage = 10
    var page = req.params.page || 1


    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    let products = []
       const snapshot =  await coll.orderBy("name").get()
       snapshot.forEach(doc =>{
           products.push({id: doc.id, data:doc.data()})
       })
       
    
    res.render('storefront.ejs', {
        error: false,
        user: req.decodedIdToken,
        products: products.slice(perPage * page - perPage, perPage * page),
        current: page,
        cartCount,
        cartCountW,
        pages: Math.ceil(products.length / perPage),
    })

   
   

})
//----




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
        uid: req.decodedIdToken.uid,
        //timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        cart: req.session.cart
    }
    try{
        await adminUtil.checkOut(data,req.decodedIdToken)
        req.session.cart = null //empty cart
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        return res.render('shoppingcart.ejs', 
        {message: 'Checked Out Successfully!', cart: new ShoppingCart(), user: req.decodedIdToken, cartCount: 0})
    }catch(e){
        const cart = ShoppingCart.deserialize(req.session.cart)
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        console.log ('ERROR', e)
        //-----------------------------------------
        return res.render('shoppingcart.ejs',
        {message: 'Sorry Check out FAILED! Try again later!!!', cart, user: req.decodedIdToken, cartCount: cart.contents.length}
        )
       
        //Retain cart when checking out fails
    }
})

app.get('/b/orderhistory',authAndRedirectSignIn,async (req,res)=>{
    try{
        //Get list of order history
        const orders = await adminUtil.getOrderHistory(req.decodedIdToken)
    
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        res.render('profile.ejs', {user: req.decodedIdToken, cartCount:0, orders})       
    }catch(e){
        console.log('==============',e)
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        res.send('<h1>Order History Error!!!!</h1>')
    }
})
//************************************************************************/
const WishList = require('./model/WishList.js')
app.post('/b/add2wish', async (req,res)=>{
    const id = req.body.docID
    const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try{
        const doc = await collection.doc(id).get()
        //Store product ID into shopping cart
        let cartW;
        if(!req.session.cartW){
            // first time add to cart
            //Create new shopping cart object
            cartW = new WishList()
        }else {
            cartW = WishList.deserialize(req.session.cartW)
        }
        const {name,price,summary,image,image_url} = doc.data()
        cartW.add({id, name, price, summary, image, image_url})

        //update shopping cart into session
        req.session.cartW = cartW.serialize()

        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        //Redirect to backend
        res.redirect('/b/wishlist')
    }catch(e){
        //Fix bug deploying to make add to cart work
        res.setHeader('Cache-Control','private');
        //-----------------------------------------
        res.send(JSON.stringify)
    }
})

app.get('/b/wishlist',authAndRedirectSignIn, (req, res)=> {
    let cartW
    const cartCount  = req.session.cart ? req.session.cart.length : 0
    const cartCountW  = req.session.cartW ? req.session.cartW.length : 0
    if(!req.session.cartW){
        cartW = new WishList()
    } else {
        cartW = WishList.deserialize(req.session.cartW)
    }
    //Fix bug deploying to make add to cart work
    res.setHeader('Cache-Control','private');
    //-----------------------------------------
    //passing cart into shoppingcart.ejs
    res.render('wishlist.ejs',{message: false, cartW, user: req.decodedIdToken,cartCount, cartCountW: cartW.contents.length})
})

//************************************************************************/

//MIDDLEWARE
async function authAndRedirectSignIn(req,res,next){
    try{
        //get decodedIdToken
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if (decodedIdToken.uid){
            req.decodedIdToken = decodedIdToken
            return next()
        }

    }catch(e)
    {
        console.log('============== authAndRedirect error', e)

    }   
    res.setHeader('Cache-Control', 'private')
    return res.redirect('/b/signin')
 
}


async function auth(req,res,next){

    try{
        if(req.session && req.session.idToken){
            const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
            req.decodedIdToken = decodedIdToken
        } else{  //no sign in yet
            req.decodedIdToken = null
        }

    }catch (e){
        req.decodedIdToken = null

    }
    //req.user = firebase.auth().currentUser   //This is reason why only 1 user used in different browsers/computers
                                            // only last signed-in user is regconized
    next()
}


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

async function authSysAdmin(req,res,next){
    try{
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if(!decodedIdToken || !decodedIdToken.email || decodedIdToken.email !== Constants.SYSADMINEMAIL){
            return res.send('<h1>System Admin Page: Access Denied!!!</h1>')
        }
        if(decodedIdToken.uid){
            req.decodedIdToken = decodedIdToken
            return next()
        }
        return res.send('<h1>System Admin Page: Access Denied!!!</h1>')
    }catch(e){
        return res.send('<h1>System Admin Page: Access Denied!!!</h1>')
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
