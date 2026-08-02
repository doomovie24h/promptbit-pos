"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Save,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Input,
} from "@/components/ui/input";


type Category = {
  id: string;
  name: string;
};


type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
};


type ProductEditProps = {
  product: Product;
  onSuccess: () => void;
};



export function ProductEdit({
  product,
  onSuccess,
}: ProductEditProps) {


  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);



  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);



  const [
    name,
    setName,
  ] = useState(product.name);



  const [
    price,
    setPrice,
  ] = useState(
    String(product.price)
  );



  const [
    categoryId,
    setCategoryId,
  ] = useState(
    product.categoryId
  );



  const [
    loading,
    setLoading,
  ] = useState(false);





  useEffect(() => {

    let mounted = true;


    async function loadCategories() {

      try {

        const response =
          await fetch(
            "/api/categories",
            {
              cache: "no-store",
            }
          );



        const json =
          await response.json();



        if (!mounted) return;



        if (json.success) {

          setCategories(
            json.data ?? []
          );

        }


      } catch (error) {

        console.error(
          "Load categories failed:",
          error
        );


        toast.error(
          "Failed to load categories"
        );


      } finally {

        if (mounted) {

          setCategoriesLoading(false);

        }

      }

    }



    loadCategories();



    return () => {

      mounted = false;

    };


  }, []);







  async function updateProduct() {


    const trimmedName =
      name.trim();



    const numericPrice =
      Number(price);



    if (
      !trimmedName ||
      !numericPrice ||
      !categoryId
    ) {


      toast.error(
        "Please complete all fields"
      );


      return;

    }





    setLoading(true);



    try {


      const response =
        await fetch(

          `/api/products/${product.id}`,

          {

            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },


            body: JSON.stringify({

              name: trimmedName,

              price: numericPrice,

              categoryId,

            }),

          }

        );



      const json =
        await response.json();





      if (
        !response.ok ||
        !json.success
      ) {


        toast.error(

          json.message ??
          "Update product failed"

        );


        return;


      }





      toast.success(
        "Product updated"
      );



      onSuccess();



    } catch (error) {


      console.error(
        "Update product failed:",
        error
      );


      toast.error(
        "Something went wrong"
      );


    } finally {


      setLoading(false);


    }


  }






  return (

    <div
      className="
        space-y-5
      "
    >



      <div>

        <h3
          className="
            font-semibold
          "
        >
          Edit Product
        </h3>


        <p
          className="
            text-sm
            text-muted-foreground
          "
        >
          Update product information
        </p>


      </div>





      <Input

        value={name}

        onChange={(event) =>
          setName(
            event.target.value
          )
        }

        placeholder="Product name"

      />





      <Input

        type="number"

        min="0"

        value={price}

        onChange={(event) =>
          setPrice(
            event.target.value
          )
        }

        placeholder="Price"

      />






      <select

        value={categoryId}

        disabled={categoriesLoading}

        onChange={(event) =>
          setCategoryId(
            event.target.value
          )
        }

        className="
          h-12
          w-full
          rounded-xl
          border
          bg-background
          px-4
          text-sm
          outline-none
          transition
          focus:ring-2
          focus:ring-primary/20
          disabled:opacity-50
        "

      >

        <option value="">

          {
            categoriesLoading

            ? "Loading categories..."

            : "Select category"

          }

        </option>




        {
          categories.map(
            (category) => (

              <option

                key={
                  category.id
                }

                value={
                  category.id
                }

              >

                {
                  category.name
                }

              </option>

            )
          )
        }



      </select>







      <button

        disabled={loading}

        onClick={updateProduct}

        className="
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-primary
          px-5
          py-3
          text-sm
          font-medium
          text-primary-foreground
          transition
          hover:opacity-90
          disabled:opacity-50
        "

      >

        <Save size={17} />


        {
          loading

          ? "Updating..."

          : "Update Product"
        }


      </button>



    </div>

  );

}