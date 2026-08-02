"use client";


import {
  ShoppingCart,
  Trash2,
} from "lucide-react";


import {
  Card,
} from "@/components/ui/card";


import {
  CartItem,
} from "@/features/cashier/components/cart-item";


import {
  useCart,
} from "@/features/cashier/hooks/use-cart";


interface CartPanelProps {
  onCheckout: () => void;
}


export function CartPanel({ onCheckout }: CartPanelProps){



  const {

    items,

    increaseQuantity,

    decreaseQuantity,

    removeItem,

    clearCart,

    total,

  } = useCart();







  return (


    <Card

      className="
      rounded-3xl
      border
      bg-card
      p-6
      flex
      flex-col
      h-full
      "

    >




      <div

        className="
        flex
        items-center
        justify-between
        mb-6
        "

      >



        <div

          className="
          flex
          items-center
          gap-3
          "

        >


          <div

            className="
            h-10
            w-10
            rounded-2xl
            bg-primary/10
            text-primary
            flex
            items-center
            justify-center
            "

          >

            <ShoppingCart
              size={20}
            />


          </div>



          <div>


            <h2

              className="
              font-semibold
              "

            >

              Cart


            </h2>


            <p

              className="
              text-sm
              text-muted-foreground
              "

            >

              {items.length} items


            </p>


          </div>


        </div>







        {
          items.length > 0 && (


            <button

              onClick={clearCart}

              className="
              rounded-xl
              p-2
              text-destructive
              hover:bg-destructive/10
              "

            >

              <Trash2
                size={18}
              />

            </button>


          )
        }





      </div>









      <div

        className="
        flex-1
        space-y-3
        overflow-y-auto
        "

      >




        {
          items.length === 0 ? (



            <div

              className="
              py-12
              text-center
              text-muted-foreground
              "

            >

              Cart is empty


            </div>



          )


          :



          items.map(item=>(



            <CartItem


              key={item.id}


              item={item}


              onIncrease={increaseQuantity}


              onDecrease={decreaseQuantity}


              onRemove={removeItem}


            />



          ))


        }




      </div>









      <div

        className="
        mt-6
        border-t
        pt-5
        space-y-4
        "

      >




        <div

          className="
          flex
          items-center
          justify-between
          "

        >


          <span

            className="
            text-muted-foreground
            "

          >

            Total


          </span>





          <span

            className="
            text-2xl
            font-bold
            "

          >

            ฿
            {total.toLocaleString()}


          </span>



        </div>







        <button

          onClick={onCheckout}

          disabled={
            items.length === 0
          }


          className="
          w-full
          rounded-2xl
          bg-primary
          px-5
          py-3
          font-medium
          text-primary-foreground
          disabled:opacity-50
          "


        >

          Payment


        </button>






      </div>







    </Card>


  );


}