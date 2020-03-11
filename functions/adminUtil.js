var admin = require("firebase-admin");

var serviceAccount = require("./diepn-wsp20-firebase-adminsdk-39m6c-8b83a9963b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diepn-wsp20.firebaseio.com"
});

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
    res.send('Create!')
    }catch (e){
        res.send(JSON.stringify(e))
    }
}
module.exports = {
    createUser
}   //Export an object

