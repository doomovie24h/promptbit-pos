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


type Props = {
  onSuccess: () => void;
};



export function ProductForm({
  onSuccess,
}: Props) {


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
  ] = useState("");



  const [
    price,
    setPrice,
  ] = useState("");



  const [
    categoryId,
    setCategoryId,
  ] = useState("");



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

        console.error(error);


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







  async function createProduct() {


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

          "/api/products",

          {

            method: "POST",

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




      if (!response.ok || !json.success) {


        toast.error(

          json.message ??
          "Failed to create product"

        );


        return;


      }




      toast.success(
        "Product created"
      );




      setName("");

      setPrice("");

      setCategoryId("");



      onSuccess();



    } catch (error) {


      console.error(error);


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
        space-y-6
      "
    >


      <div>

        <h3
          className="
            text-base
            font-semibold
          "
        >
          Product Information
        </h3>


        <p
          className="
            mt-1
            text-sm
            text-muted-foreground
          "
        >
          Create a new menu item
        </p>

      </div>





      <div
        className="
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
        "
      >



        <div
          className="
            space-y-2
          "
        >

          <label
            className="
              text-sm
              font-medium
            "
          >
            Product Name
          </label>


          <Input

            value={name}

            onChange={(event) =>
              setName(
                event.target.value
              )
            }

            placeholder="Example: Pad Thai"

          />

        </div>





        <div
          className="
            space-y-2
          "
        >

          <label
            className="
              text-sm
              font-medium
            "
          >
            Price
          </label>


          <Input

            type="number"

            min="0"

            value={price}

            onChange={(event) =>
              setPrice(
                event.target.value
              )
            }

            placeholder="0"

          />

        </div>
                <div
          className="
            space-y-2
            md:col-span-2
          "
        >

          <label
            className="
              text-sm
              font-medium
            "
          >
            Category
          </label>


          <select

            value={categoryId}

            disabled={
              categoriesLoading
            }

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
              disabled:cursor-not-allowed
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


        </div>


      </div>






      <div
        className="
          flex
          justify-end
        "
      >


        <button

          type="button"

          disabled={loading}

          onClick={createProduct}


          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-6
            py-3
            text-sm
            font-medium
            text-primary-foreground
            transition
            hover:opacity-90
            disabled:opacity-50
          "

        >


          <Save
            size={18}
          />



          {
            loading

            ? "Saving..."

            : "Save Product"
          }


        </button>


      </div>


    </div>

  );

}