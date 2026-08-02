import {
  create,
} from "zustand";


import type {
  Product,
  CartItem,
} from "@/features/cashier/types/cashier.types";




type CashierStore = {


  cart: CartItem[];


  addProduct(
    product: Product
  ): void;



  increase(
    id:string
  ): void;



  decrease(
    id:string
  ): void;



  remove(
    id:string
  ): void;



  clear(): void;



  total(): number;


};







export const useCashierStore =
create<CashierStore>((set,get)=>({



  cart:[],





  addProduct(product){


    set(
      state=>{


        const exists =
          state.cart.find(
            item =>
              item.id === product.id
          );



        if(exists){


          return {


            cart:

              state.cart.map(

                item =>


                  item.id === product.id


                  ?


                  {


                    ...item,


                    quantity:
                      item.quantity + 1,


                  }


                  :


                  item


              ),


          };


        }





        return {


          cart:[

            ...state.cart,


            {


              ...product,


              quantity:1,


            },


          ],


        };


      }

    );


  },







  increase(id){


    set(

      state=>({


        cart:

          state.cart.map(

            item =>


              item.id === id


              ?


              {


                ...item,


                quantity:
                  item.quantity + 1,


              }


              :


              item


          ),


      })

    );


  },








  decrease(id){


    set(

      state=>({


        cart:


          state.cart

          .map(

            item =>


              item.id === id


              ?


              {


                ...item,


                quantity:
                  item.quantity - 1,


              }


              :


              item


          )


          .filter(

            item =>
              item.quantity > 0

          ),


      })

    );


  },








  remove(id){


    set(

      state=>({


        cart:


          state.cart.filter(

            item =>
              item.id !== id

          ),


      })

    );


  },







  clear(){


    set({

      cart:[],

    });


  },







  total(){


    return get()

      .cart

      .reduce(

        (
          sum,
          item
        ) =>


          sum +

          (

            item.price *

            item.quantity

          ),


        0


      );


  },

}));