"use client";


import {
  useState,
} from "react";


import {
  CreditCard,
  Banknote,
  QrCode,
  X,
} from "lucide-react";


import {
  Card,
} from "@/components/ui/card";






type PaymentMethod =

  | "CASH"

  | "PROMPTPAY"

  | "BANK"

  | "CARD";







type Props = {

  open:boolean;

  total:number;

  onClose:()=>void;

  onConfirm:(

    method:PaymentMethod

  )=>void;

};










const methods = [

  {
    id:"CASH",
    label:"Cash",
    icon:Banknote,
  },


  {
    id:"PROMPTPAY",
    label:"PromptPay",
    icon:QrCode,
  },


  {
    id:"BANK",
    label:"Bank Transfer",
    icon:Banknote,
  },


  {
    id:"CARD",
    label:"Card",
    icon:CreditCard,
  },


] as const;









export function PaymentDialog({

  open,

  total,

  onClose,

  onConfirm,

}:Props){





  const [

    selected,

    setSelected

  ] =

  useState<PaymentMethod>("CASH");








  if(!open){

    return null;

  }








  return (


    <div

      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-4
      "

    >



      <Card

        className="
        w-full
        max-w-md
        rounded-3xl
        p-6
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



          <h2

            className="
            text-xl
            font-semibold
            "

          >

            Payment


          </h2>





          <button

            onClick={onClose}

            className="
            rounded-xl
            p-2
            hover:bg-muted
            "

          >

            <X
              size={20}
            />

          </button>



        </div>









        <div

          className="
          mb-6
          rounded-2xl
          bg-muted
          p-5
          "

        >


          <p

            className="
            text-sm
            text-muted-foreground
            "

          >

            Total Amount


          </p>



          <p

            className="
            mt-2
            text-3xl
            font-bold
            "

          >

            ฿
            {total.toLocaleString()}


          </p>


        </div>









        <div

          className="
          grid
          grid-cols-2
          gap-3
          "

        >



          {
            methods.map(method=>{


              const Icon =
                method.icon;



              return (


                <button


                  key={method.id}


                  onClick={()=>


                    setSelected(
                      method.id
                    )

                  }


                  className={`

                  rounded-2xl

                  border

                  p-4

                  flex

                  flex-col

                  items-center

                  gap-2

                  transition

                  ${
                    selected === method.id

                    ?

                    "border-primary bg-primary/10"

                    :

                    "hover:bg-muted"

                  }

                  `}


                >


                  <Icon
                    size={24}
                  />


                  <span

                    className="
                    text-sm
                    "

                  >

                    {method.label}


                  </span>



                </button>


              );


            })

          }



        </div>








        <button


          onClick={()=>{

            onConfirm(
              selected
            );

          }}


          className="
          mt-6
          w-full
          rounded-2xl
          bg-primary
          py-3
          font-medium
          text-primary-foreground
          "


        >

          Confirm Payment


        </button>






      </Card>



    </div>


  );


}