class WishList{
    //In DB we store
    //product: {id, name,price, summary, image, image_url}

    //In content we store objects
    /*contents = [
        {
            products: {..},
            qty: 2
        }
    ]

    */
    constructor(){
        this.contents = []
    }

    //ADD PRODUCT TO SHOPPING CART
    add(product) {
        let found = false
        for(const item of this.contents){
            if (item.product.id === product.id){
                found = true;
                ++item.qty
            }
        }
        if(!found){
            this.contents.push({product,qty:1})
        }
    }


    //GET TOTAL PRICE IN SHOPPING CART
        getTotal(){
            let sum = 0
            for (const item of this.contents){
                sum += item.qty * item.product.price
            }
            return sum;
        }

    serialize(){
        return this.contents
    }
    

    //obj = ShoppingCart.deserialize(serial_data)
    static deserialize(sdata){
        const cart = new WishList()
        cart.contents = sdata
        return cart
    }
}
module.exports = WishList