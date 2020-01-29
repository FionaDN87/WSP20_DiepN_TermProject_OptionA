

function login_page(){
    firebase.auth().onAuthStateChanged(user =>{
        if(user && user.email==='prodadmin@test.com'){
            window.location.href='/home'
        }else {
            glPageContent.innerHTML = `
        <form class="form-signin">
            <h3>Please Sign In </h3>
            <input type="email" class="form-control" id="email" placeholder = "Email address">
            <input type="password" class="form-control" id="password" placeholder = "Password">
            <button type="submit" class="btn btn-primary">Submit</button>
         </form>
            
            
            `;
        }
    })


}