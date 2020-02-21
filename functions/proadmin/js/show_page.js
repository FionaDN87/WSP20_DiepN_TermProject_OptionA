function show_page(){

    auth('prodadmin@test.com', show_page_secured,'/login')
    //show_page_secured()
   
}
//Global variable
let products;   //list of all products read from db
let lastVisible;
let limitDisplay = 3;
var pageNumber = 1;
var nextVisible;    //Gloval variable
async function show_page_secured(){
    glPageContent.innerHTML = '<h1>Show Products</h1>'

    glPageContent.innerHTML+=`
    <a href='/home' class="btn btn-outline-primary">Home</a>
    <a href='/add' class="btn btn-outline-primary">Add a Products</a>
    <br/>
    `;
    var totalProducts=[]
    const querySnapshot = firebase.firestore().collection(COLLECTION).get()
    .then(function(querySnapshot){
       querySnapshot.forEach(doc =>{
            const{prodID,name,summary,price,image,image_url} = doc.data()
            const t = {docId: doc.id,prodID,name,summary,price, image,image_url}
            totalProducts.push(t)

        });


    });


    
        try{
        products = []   //array of products

        const snapshot = await firebase.firestore().collection(COLLECTION)
                        //.where("name", "==","Crochet animal")
                        .orderBy("prodID")
                        .limit(limitDisplay)  
                        .startAt(1)
   //Limit certain project/page
                                //Give query
                        .get()
        
        .then(function(snapshot){
            snapshot.forEach(doc =>{
                const{prodID,name,summary,price,image,image_url} = doc.data()
                const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
                products.push(p)

            });
        //Define the last visible product
        lastVisible = products[limitDisplay-1].prodID
        console.log("last visible product index (ShowPageSecured): ", lastVisible);
        
    
        });
        //Display Pagination bar emphasizing this is the first page
        //First page limit displaying 3 items 
        glPageContent.innerHTML+=`
        <nav aria-label="...">
        <ul class="pagination">
          <li class="page-item">
         
            <!--
          </li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item">
            <a class="page-link" href="#">2 <span class="sr-only">(current)</span></a>
          </li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
          <li>
          -->
          <button class="btn btn-danger" type ="button"
          onclick="nextPage(${lastVisible},products)">Next</button>
          </li>
        </ul>
      </nav>
        `;
            

    }catch (e){
        glPageContent.innerHTML='Firestore access error. Try again!!!!' + e
        return
    }
    //console.log(products)

    if (products.length === 0){
        glPageContent.innerHTML += '<h1>No products in the database</h1>'
        return
    }

    for (let index = 0; index < products.length; index++){
        const p = products[index]
        if(!p) continue;
        glPageContent.innerHTML +=`
        <div id="${p.docId}" class="card" style="width: 18rem; display: inline-block">
            <img src="${p.image_url}" class="card-img-top" >
            <div class="card-body">
            <h5 class="card-title">ProductID: ${p.prodID}<br/>${p.name}</h5>
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
//global variable 
let cardOriginal
let imageFile2Update
async function editProduct(index){
    const p = products[index]
    const card = document.getElementById(p.docId)
    cardOriginal = card.innerHTML
    card.innerHTML=`
    <div class = "form-group">
    Name: <input class="form-control" type="text" id="name" value="${p.name}" />
    <p id="name_error" style="color:red;" />
</div>


<div class="form-group">
    Summary:<br>
    <textarea class="form-control" id="summary" cols="40" rows="5">${p.summary}</textarea>
    <p id="summary_error" style="color:red;" />
</div>

<div class="form-group">
    Price:<input class="form-control" type="text" id="price" value=${p.price} />
    <p id="price_error" style="color:red;" />
</div>
Current Image: <br>
<img src="${p.image_url}"><br>
<div class = "form-group">
    New Image: <input type="file" id="imageButton" value="upload" />
    <p id="image_error" style="color:red;" />
</div>
<button class="btn btn-danger" type="button" onclick="update(${index})">Update</button>
<button class="btn btn-secondary" type="button" onclick="cancel(${index})">Cancel</button>
    `;
    const imageButton = document.getElementById('imageButton')
    imageButton.addEventListener('change', e =>{
        imageFile2Update = e.target.files[0]
    })
}

async function update(index){
   const p = products[index]
   const newName = document.getElementById('name').value

   const newSummary = document.getElementById('summary').value

   const newPrice = document.getElementById('price').value

   //Validate new values
   const nameErrorTag = document.getElementById('name_error')
   const summaryErrorTag = document.getElementById('summary_error')
   const priceErrorTag = document.getElementById('price_error')

   nameErrorTag.innerHTML = validate_name(newName)
   summaryErrorTag.innerHTML = validate_summary(newSummary)
   priceErrorTag.innerHTML = validate_price(newPrice)

if(nameErrorTag.innerHTML || summaryErrorTag.innerHTML || priceErrorTag.innerHTML){
    return
}
//Ready to update
let updated = false 
const newInfo = {}
if(p.name!==newName){
    newInfo.name = newName
    updated = true

}

if(p.summary!==newSummary){
    newInfo.summary=newSummary
    updated = true
}

if(p.price!=newPrice){
    newInfo.price=Number(Number(newPrice).toFixed(2))
    updated = true
}

if(imageFile2Update){
    updated = true
}

if(!updated){
    cancel(index)
    return
}

//Update DB
try{
    //Update Image
    if(imageFile2Update){
        //console.log('ref del')
        const imageRef2del = firebase.storage().ref().child(IMAGE_FOLDER + p.image)
        //console.log('del existing')
        await imageRef2del.delete()
        //console.log('diep')
        const image = Date.now() + imageFile2Update.name
        const newImageRef = firebase.storage().ref(IMAGE_FOLDER + image)
        //console.log('task')
        const takeSnapshot = await newImageRef.put(imageFile2Update)
        //console.log('image url')
        const image_url = await takeSnapshot.ref.getDownloadURL()
        newInfo.image=image
        newInfo.image_url = image_url

    }
    //Update Document
    await firebase.firestore().collection(COLLECTION).doc(p.docId).update(newInfo)
    //After update, go to show page
    window.location.href = '/show'

} catch(e){
    glPageContent.innerHTML='Firestore/Storage update error<br>' + JSON.stringify(e)
}
}

function cancel(index){
    const p = products[index]
    const card = document.getElementById(p.docId)
    card.innerHTML=cardOriginal  //no change in image
}


async function deleteProduct(index){
    try{
        const p = products[index]
        //if(!p) continue
        // Delete (1) Firestore doc, (2) Storage image from db
        console.log('await...')
        await firebase.firestore().collection(COLLECTION).doc(p.docId).delete()
        const imageRef = firebase.storage().ref().child(IMAGE_FOLDER + p.image)
        
        console.log('await...')
        await imageRef.delete()

        //Remove card on Show Page web browser
        const card = document.getElementById(p.docId)
        card.parentNode.removeChild(card)

        delete products[index]
    }catch(e){
            glPageContent.innerHTML = 'Delete Error: <br>' + JSON.stringify(e)
        }
    }
let countNext=0;
//NEXT PAGE
    async function nextPage(lastVisible,prevProducts)
    {
       
        //console.log("Prev array: " + prevProducts.length);
        
        //console.log("last visible product ID(topNextPage)", lastVisible);
        //Call firestore, display from previous last visible index
        try{
            //console.log("Prev array 2: " + prevProducts.length);
            products = []   //empty array of products
            if(countNext==0){
            nextVisible = (prevProducts[(prevProducts.length) -1].prodID);
                    const snapshot=await firebase.firestore().collection(COLLECTION)
                        .orderBy("prodID")
                        .limit(limitDisplay)
                        .startAfter(nextVisible).
                        get()
                        .then(function(snapshot){
                        snapshot.forEach(doc => {
                            const{prodID,name,summary,price,image,image_url} = doc.data()
                    const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
                    products.push(p)  
                        })    
                        })
            
            }
            else{
                nextVisible=prevProducts[0].prodID;
                const snapshot=await firebase.firestore().collection(COLLECTION)
                .orderBy("prodID")
                .limit(limitDisplay)
                .startAfter(nextVisible)
                .get()
                .then(function(snapshot){
                snapshot.forEach(doc => {
                    const{prodID,name,summary,price,image,image_url} = doc.data()
            const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
            products.push(p)  

                })    
                })
                countNext=0;
                countPre=0;
            }
           
            //console.log("counted lastVisible: " + lastVisible);
            //console.log("counted nextVisible: " + nextVisible);
            
            //Sorted by prodID
            /*
            const snapshot = await firebase.firestore().collection(COLLECTION)
                            .orderBy("prodID")                  //prodID starts from 1
                            .limit(limitDisplay)  
                            .startAfter(nextVisible)            //Limit certain project/page
                                      //Give query
                            .get()
            
            .then(function(snapshot){
                snapshot.forEach(doc =>{
                    const{prodID,name,summary,price,image,image_url} = doc.data()
                    const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
                    products.push(p)    
                });
              */  
                
                lastVisible=products[products.length-1].prodID

                //console.log("last visible product ID", lastVisible);
                //console.log("Prev array 3: " + prevProducts.length);
                
                //Increase page# by 1 
                pageNumber++;
               
                //Erase previous page html content, display next page content
                glPageContent.innerHTML=`
                <h1>Show Products</h1>         
                <a href='/home' class="btn btn-outline-primary">Home</a>
                <a href='/add' class="btn btn-outline-primary">Add a Products</a>
                <br/>
                `;
                glPageContent.innerHTML+=`Page: `+ pageNumber;       //Indicate which page user is currentl at

                console.log("last visible product ID(2)", lastVisible);
                console.log("Prev array 4: " + prevProducts.length);
                glPageContent.innerHTML+=`
                <nav aria-label="...">
                <ul class="pagination">
                  <li class="page-item">
                  
                  <button class="btn btn-danger" type ="button"
                  onclick="prevPage(${lastVisible},products)">Previous</button>
                  </button>
            </li>
                    <!--
                  </li>
                  <li class="page-item"><a class="page-link" href="#">1</a></li>
                  <li class="page-item">
                    <a class="page-link" href="#">2 <span class="sr-only">(current)</span></a>
                  </li>
                  <li class="page-item"><a class="page-link" href="#">3</a></li>
                  <li>
                  -->
                  <button class="btn btn-danger" type ="button"
                        onclick="nextPage(${lastVisible},products)">Next</button>
                  </li>
                </ul>
              </nav>
              
                `;
                //Display limit products of relevant page
              
                for (let index = 0; index < products.length; index++){
                    const p = products[index]
                    if(!p) continue;
                    glPageContent.innerHTML +=`
                    <div id="${p.docId}" class="card" style="width: 18rem; display: inline-block">
                    <img src="${p.image_url}" class="card-img-top" >
                    <div class="card-body">
                    <h5 class="card-title">ProductID: ${p.prodID}<br/>${p.name}</h5>
                    <p class="card-text">${p.price}<br/>${p.summary}</p>
                    
                    <button class="btn btn-primary" type ="button"
                        onclick="editProduct(${index})">Edit</button>
        
                    <button class="btn btn-danger" type ="button"
                        onclick="deleteProduct(${index})">Delete</button>
                  
                    </div>
                </div>
                   
                    `;
             
               
                }
                
               
                
          //  });
        }catch (e){
            glPageContent.innerHTML='Forestore access error. Try again!!!!' + e
            return
        }

    }
    //Global variables
   let countPre =0;
   let firstPreVisible
    //PREV PAGE
    async function prevPage(lastVisible,curProducts)
    {
        countNext++;
        //console.log(curProducts.length);
    
        //Call firestore, display from previous last visible index
        try{
            products = []   //empty array of products
            
            if(countPre==0)            //First time using Previous Button
                { firstPreVisible = (curProducts[0].prodID);
                    const snapshot=await firebase.firestore().collection(COLLECTION)
                    .orderBy("prodID","desc")
                    .limit(limitDisplay)
                    .startAfter(firstPreVisible).
                    get()
                    .then(function(snapshot){
                    snapshot.forEach(doc => {
                        const{prodID,name,summary,price,image,image_url} = doc.data()
                const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
                products.push(p)  
                    })    
                    })
                countNext++;
                }
                else{               //NOT First time using Previous Button
                firstPreVisible=curProducts[curProducts.length-1].prodID
            
                    const snapshot=await firebase.firestore().collection(COLLECTION)
                    .orderBy("prodID","desc")
                    .limit(limitDisplay)
                    .startAfter(firstPreVisible).
                    get()
                    .then(function(snapshot){
                    snapshot.forEach(doc => {
                        const{prodID,name,summary,price,image,image_url} = doc.data()
                const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
                products.push(p)  
                    })    
                    })
            countPre=0;
            countNext++;
            }
            //Sorted by prodID
            /*
            const snapshot = await firebase.firestore().collection(COLLECTION)
                            .orderBy("prodID","desc")                  //prodID starts from 1
                            .limit(limitDisplay)  
                            
                            .startAfter(firstPreVisible)            //Limit certain project/page
                                      //Give query
                            .get()
            
            .then(function(snapshot){
                snapshot.forEach(doc =>{
                    const{prodID,name,summary,price,image,image_url} = doc.data()
                    const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
                    products.push(p)    
                });
*/
               
                glPageContent.innerHTML=`
                <h1>Show Products</h1>         
                <a href='/home' class="btn btn-outline-primary">Home</a>
                <a href='/add' class="btn btn-outline-primary">Add a Products</a>
                <br/>
                `;
                //Decrease page# by 1 
                pageNumber--;
                countPre++;   //Increase count after first time using Previous Button
                
                //Erase previous page html content, display next page content
                
                glPageContent.innerHTML+=`Page: `+ pageNumber;       //Indicate which page user is currentl at
                
                //COUNT TOTAL PRODUCTS IN DATABASE
                //-----
                totalProducts = []   //array of products
                const snapshot = firebase.firestore().collection(COLLECTION)
                .get()
                .then(function(snapshot){
                    snapshot.forEach(doc =>{
                        const{prodID,name,summary,price,image,image_url} = doc.data()
                        const p = {docId: doc.id,prodID,name,summary,price, image,image_url}
                        totalProducts.push(p)
        
                    }); 
                })
                //-----
                let totalPage = totalProducts.length/3;
                
                
                if(pageNumber==1){ //First Page, only display NEXT button
                    glPageContent.innerHTML+=`
                <nav aria-label="...">
                <ul class="pagination">   
                  <button class="btn btn-danger" type ="button"
                        onclick="nextPage(${firstPreVisible},products)">Next</button>
                  </li>
                </ul>
              </nav>
                `;
                }else{

                //console.log("last visible product ID(2)", lastVisible);
                glPageContent.innerHTML+=`
                <nav aria-label="...">
                <ul class="pagination">
                  <li class="page-item">
                  <button class="btn btn-danger" type ="button"
                  onclick="prevPage(${firstPreVisible},products)">Previous</button>
                </li>
                    
                  <button class="btn btn-danger" type ="button"
                        onclick="nextPage(${firstPreVisible},products)">Next</button>
                  </li>
                </ul>
              </nav>
                `;
                }
                //Display limit products of relevant page
                //Since Prev button display decs array
                for (let index = products.length; index >= 0; index--){
                    const p = products[index]
                    if(!p) continue;
                    glPageContent.innerHTML +=`
                    <div id="${p.docId}" class="card" style="width: 18rem; display: inline-block">
                    <img src="${p.image_url}" class="card-img-top" >
                    <div class="card-body">
                    <h5 class="card-title">ProductID: ${p.prodID}<br/>${p.name}</h5>
                    <p class="card-text">${p.price}<br/>${p.summary}</p>
                    
                    <button class="btn btn-primary" type ="button"
                        onclick="editProduct(${index})">Edit</button>
        
                    <button class="btn btn-danger" type ="button"
                        onclick="deleteProduct(${index})">Delete</button>
                  
                    </div>
                </div>
                    
                    `;
             
               
                }
                
               
                
           // });
        }catch (e){
            glPageContent.innerHTML='Forestore access error. Try again!!!!' + e
            return
        }

    }