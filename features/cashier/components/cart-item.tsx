"use client";


import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react";


import type {
  CartItem as CartItemType,
} from "@/features/cashier/types/cashier.types";






type Props = {


  item:CartItemType;


  onIncrease:(id:string)=>void;


  onDecrease:(id:string)=>void;


  onRemove:(id:string)=>void;


};








export function CartItem({


  item,


  onIncrease,


  onDecrease,


  onRemove,


}:Props){





  return (



    <div

      className="
      rounded-2xl
      border
      bg-card
      p-4
      space-y-3
      "

    >





      <div

        className="
        flex
        items-start
        justify-between
        gap-3
        "

      >



        <div>


          <h4

            className="
            font-medium
            "

          >

            {item.name}

          </h4>



          <p

            className="
            mt-1
            text-sm
            text-muted-foreground
            "

          >

            ฿
            {item.price.toLocaleString()}

          </p>


        </div>





        <button


          onClick={()=>onRemove(item.id)}


          className="
          rounded-lg
          p-2
          text-destructive
          hover:bg-destructive/10
          "

        >


          <Trash2

            size={18}

          />


        </button>




      </div>









      <div

        className="
        flex
        items-center
        justify-between
        "

      >



        <div

          className="
          flex
          items-center
          gap-3
          rounded-xl
          border
          px-2
          py-1
          "

        >



          <button


            onClick={()=>onDecrease(item.id)}


            className="
            h-8
            w-8
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-muted
            "

          >


            <Minus

              size={16}

            />


          </button>





          <span

            className="
            min-w-6
            text-center
            font-semibold
            "

          >

            {item.quantity}

          </span>





          <button


            onClick={()=>onIncrease(item.id)}


            className="
            h-8
            w-8
            rounded-lg
            flex
            items-center
            justify-center
            hover:bg-muted
            "

          >


            <Plus

              size={16}

            />


          </button>




        </div>







        <p

          className="
          font-bold
          "

        >

          ฿
          {(
            item.price *
            item.quantity
          ).toLocaleString()}


        </p>





      </div>





    </div>


  );


}