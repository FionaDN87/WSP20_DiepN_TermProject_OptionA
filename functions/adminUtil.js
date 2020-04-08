var admin = require("firebase-admin");

var serviceAccount = require("./diepn-wsp20-firebase-adminsdk-39m6c-8b83a9963b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diepn-wsp20.firebaseio.com"
});
const Constants = require('./myconstant.js')
async function createUser (req,res) {
    //Read info input
    //Predefined constances
    const email = req.body.email
    const password   = req.body.password
    const displayName  = req.body.displayName
    const phoneNumber = req.body.phoneNumber
    const photoURL = req.body.photoURL
    try{
        await admin.auth().createUser (
            {email,password,displayName,phoneNumber,photoURL}
        )
    res.render('signin.ejs',{page: 'signin', user: false,cartCount:0, error:'Account created: Sign In Please! '})
    }catch (e){
    res.render('signup.ejs',{error: e, user: false,cartCount:0, page:'signup'})
    }
}
async function listUsers(req,res){
    //call admin auth function
    try{
        const userRecord = await admin.auth().listUsers()
        res.render('admin/listUsers.ejs',{users: userRecord.users, error: false})
    }catch(e){
        //res.send(JSON.stringify)   //test
        res.render('admin/listUsers.ejs', {users: false, error: e})

    }
}
async function verifyIdToken(idToken){
    try{
        const decodedIdToken = await admin.auth().verifyIdToken(idToken)
        return decodedIdToken
    }catch(e){
        return null

    }
}


async function getOrderHistory(decodedIdToken){
    try{
        const collection = admin.firestore().collection(Constants.COLL_ORDERS)
        let orders=[]   //order history
        console.log('BEGIN QUERY ORDER HISTORY')
       
        const snapshot = await collection.where("uid","==",decodedIdToken.uid).orderBy("timestamp").get()
        snapshot.forEach(doc => {
            orders.push(doc.data())
            
        })
        console.log('END QUERY ORDER HISTORY')
        //console.log('============',orders)
        return orders
    }catch(e){
        console.log('ERROR getOrderHistory:',e)
        return null
    }



}

async function checkOut(data){
    data.timestamp = admin. firestore.Timestamp.fromDate(new Date())
    try{
        const collection = admin.firestore().collection(Constants.COLL_ORDERS)
        await collection.doc().set(data)

    }catch(e){
        throw e
    }
}

module.exports = {
    createUser,
    listUsers,
    verifyIdToken,
    getOrderHistory,
    checkOut,
}   //Export an object

