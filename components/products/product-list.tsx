"use client";

import {
  useState,
} from "react";

import {
  Pencil,
  Trash2,
  Package,
} from "lucide-react";

import {
  ProductEdit,
} from "@/components/products/product-edit";


type Product = {
  id: string;
  name: string;
  price: number;
  category?: {
    id: string;
    name: string;
  } | null;
};


type ProductListProps = {
  products: Product[];
  onDelete: (id: string) => void;
  onSuccess?: () => void;
};



export function ProductList({
  products,
  onDelete,
  onSuccess,
}: ProductListProps) {


  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(null);



  if (products.length === 0) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-dashed
          bg-muted/30
          p-12
          text-center
        "
      >

        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-3xl
            bg-primary/10
            text-primary
          "
        >

          <Package size={32} />

        </div>



        <h3
          className="
            mt-5
            text-lg
            font-semibold
          "
        >
          No products yet
        </h3>



        <p
          className="
            mt-2
            text-sm
            text-muted-foreground
          "
        >
          Create your first menu item
        </p>


      </div>

    );

  }




  return (

    <div
      className="
        grid
        grid-cols-1
        gap-5
        lg:grid-cols-2
      "
    >

      {
        products.map((product) => (

          <div
            key={product.id}
            className="
              group
              rounded-3xl
              border
              bg-card
              p-5
              transition-all
              hover:-translate-y-0.5
              hover:shadow-lg
            "
          >


            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >


              <div
                className="
                  flex
                  min-w-0
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary/10
                    text-primary
                  "
                >

                  <Package size={26} />

                </div>



                <div
                  className="
                    min-w-0
                  "
                >

                  <h3
                    className="
                      truncate
                      text-base
                      font-semibold
                    "
                  >
                    {product.name}
                  </h3>



                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        rounded-full
                        bg-muted
                        px-3
                        py-1
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {
                        product.category?.name ??
                        "Uncategorized"
                      }
                    </span>

                  </div>


                </div>


              </div>





              <div
                className="
                  text-right
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                  "
                >
                  ฿{product.price.toLocaleString()}
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  per item
                </p>


              </div>


            </div>





            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                border-t
                pt-4
              "
            >


              <p
                className="
                  text-xs
                  text-muted-foreground
                "
              >
                Product ID
              </p>



              <div
                className="
                  flex
                  gap-2
                "
              >


                <button
                  onClick={() =>
                    setEditingProduct(product)
                  }
                  className="
                    flex
                    h-9
                    items-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    text-sm
                    transition
                    hover:bg-muted
                  "
                >

                  <Pencil size={15} />

                  Edit

                </button>




                <button
                  onClick={() => {

                    if (
                      window.confirm(
                        "Delete this product?"
                      )
                    ) {

                      onDelete(product.id);

                    }

                  }}
                  className="
                    flex
                    h-9
                    items-center
                    gap-2
                    rounded-xl
                    text-sm
                    text-red-500
                    transition
                    hover:bg-red-500/10
                  "
                >

                  <Trash2 size={15} />

                  Delete

                </button>


              </div>


            </div>





            {
              editingProduct?.id === product.id && (

                <div
                  className="
                    mt-6
                    border-t
                    pt-6
                  "
                >

                  <ProductEdit

                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      categoryId:
                        product.category?.id ?? "",
                    }}

                    onSuccess={() => {

                      setEditingProduct(null);

                      onSuccess?.();

                    }}

                  />

                </div>

              )
            }



          </div>

        ))
      }


    </div>

  );

}