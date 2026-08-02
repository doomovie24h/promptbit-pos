"use client";


import {
  Card,
} from "@/components/ui/card";


import {
  PackageOpen,
} from "lucide-react";


import type {
  Product,
} from "@/features/cashier/types/cashier.types";






type Props = {

  products:Product[];

  onAdd:(product:Product)=>void;

};







export function ProductGrid({

  products,

  onAdd,

}:Props){





  if(products.length === 0){


    return (


      <Card

        className="
        rounded-3xl
        border
        bg-card
        p-10
        flex
        flex-col
        items-center
        justify-center
        gap-3
        text-muted-foreground
        "

      >


        <PackageOpen
          size={40}
        />


        <p>

          No products available

        </p>


      </Card>


    );


  }







  return (


    <div

      className="
      grid
      grid-cols-2
      md:grid-cols-3
      xl:grid-cols-4
      gap-4
      "

    >



      {
        products.map(product=>(


          <Card


            key={product.id}


            onClick={()=>onAdd(product)}


            className="
            cursor-pointer
            rounded-3xl
            border
            bg-card
            p-5
            transition
            hover:shadow-md
            active:scale-95
            "


          >



            <div

              className="
              flex
              flex-col
              gap-3
              "

            >



              <div

                className="
                h-12
                w-12
                rounded-2xl
                bg-primary/10
                text-primary
                flex
                items-center
                justify-center
                "

              >


                <PackageOpen
                  size={24}
                />


              </div>





              <div>


                <h3

                  className="
                  font-semibold
                  line-clamp-2
                  "

                >

                  {product.name}

                </h3>



                <p

                  className="
                  mt-2
                  text-sm
                  text-muted-foreground
                  "

                >

                  ฿
                  {product.price.toLocaleString()}

                </p>


              </div>



            </div>



          </Card>


        ))

      }



    </div>


  );


}