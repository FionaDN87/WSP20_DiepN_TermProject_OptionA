function show_page(){
    //glPageContent.innerHTML = '<h1>Show Page</h1>'
    show_page_secured()
   
}
//Global variable
let products;   //list of all products read from db
async function show_page_secured(){
    glPageContent.innerHTML = '<h1>Show Products</h1>'

    glPageContent.innerHTML+=`
    <a href='/home' class="btn btn-outline-primary">Home</a>
    <a href='/add' class="btn btn-outline-primary">Add a Products</a>
    <br/>
    `;
    try{
        products = []   //array of products
        const snapshot = await firebase.firestore().collection(COLLECTION).get()
        snapshot.forEach(doc =>{
            const{name,summary,price,image,image_url} = doc.data()
            const p = {docId: doc.id,name,summary,price, image,image_url}
            products.push(p)
        })
    }catch (e){
        glPageContent.innerHTML='Forestore access error. Try again!!!!' + e
        return
    }
    //console.log(products)

    if (products.length === 0){
        glPageContent += '<h1>No products in the database</h1>'
        return
    }

    for (let index = 0; index < products.length; index++){
        const p = products[index]
        glPageContent.innerHTML +=`
        <div id="${p.docId}" class="card" style="width: 18rem; display: inline-block">
            <img src="${p.image_url}" class="card-img-top" >
            <div class="card-body">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text">${p.price}<br/>${p.summary}</p>

            <button class="btn btn-primary" type ="button"
                onclick="editProduct(${index})">Edit</button>

            <button class="btn btn-danger" type ="button"
                onclick="deleteProduct(${index})">Delete</button>
          
            </div>
        </div>
        
        `;
    }
}