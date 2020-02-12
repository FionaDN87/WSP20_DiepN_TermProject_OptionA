function auth(email,success,fail_url){
    firebase.auth().onAuthStateChanged(user =>{
        if(user && user.email===email){
            success()
            
        }else { //fail authentication
            window.location.href = fail_url
            
        }
    })
}