"use client";


import {
  useMemo,
} from "react";


import {
  create,
} from "zustand";


import type {
  CartItem,
  Product,
} from "@/features/cashier/types/cashier.types";





type CartStore = {

  items: CartItem[];


  addItem(
    product: Product
  ): void;


  removeItem(
    productId: string
  ): void;


  increaseQuantity(
    productId: string
  ): void;


  decreaseQuantity(
    productId: string
  ): void;


  clearCart(): void;

};







const useCartStore =
create<CartStore>((set)=>({


  items: [],





  addItem(product){


    set((state)=>{


      const existing =
        state.items.find(
          item =>
            item.id === product.id
        );



      if(existing){


        return {

          items:

            state.items.map(
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


        items:[

          ...state.items,

          {

            ...product,

            quantity:1,

          },

        ],

      };


    });


  },








  removeItem(productId){


    set((state)=>({


      items:

        state.items.filter(

          item =>
            item.id !== productId

        ),


    }));


  },








  increaseQuantity(productId){


    set((state)=>({


      items:

        state.items.map(

          item =>


            item.id === productId

            ?

            {

              ...item,

              quantity:
                item.quantity + 1,

            }

            :

            item


        ),


    }));


  },








  decreaseQuantity(productId){


    set((state)=>({


      items:

        state.items

        .map(

          item =>


            item.id === productId

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


    }));


  },








  clearCart(){


    set({

      items: [],

    });


  },



}));









export function useCart(){



  const items =
    useCartStore(
      (state)=>
        state.items
    );



  const addItem =
    useCartStore(
      (state)=>
        state.addItem
    );



  const removeItem =
    useCartStore(
      (state)=>
        state.removeItem
    );



  const increaseQuantity =
    useCartStore(
      (state)=>
        state.increaseQuantity
    );



  const decreaseQuantity =
    useCartStore(
      (state)=>
        state.decreaseQuantity
    );



  const clearCart =
    useCartStore(
      (state)=>
        state.clearCart
    );







  const total =

    useMemo(

      ()=>


        items.reduce(

          (

            sum,

            item

          )=>


            sum +

            (

              item.price *

              item.quantity

            ),


          0

        ),


      [items]

    );








  const itemCount =

    useMemo(

      ()=>


        items.reduce(

          (

            sum,

            item

          )=>


            sum +

            item.quantity,


          0


        ),


      [items]

    );







  return {


    items,


    addItem,


    removeItem,


    increaseQuantity,


    decreaseQuantity,


    clearCart,


    total,


    itemCount,


  };


}