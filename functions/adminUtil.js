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
    res.render('signin.ejs',{page: 'signin', user: false, error:'Account created: Sign In Please! '})
    }catch (e){
    res.render('signup.ejs',{error: e, user: false, page:'signup'})
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
module.exports = {
    createUser,
    listUsers,
}   //Export an object

