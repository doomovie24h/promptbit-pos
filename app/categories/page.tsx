"use client";

import {
  useEffect,
  useState,
} from "react";


import {
  Card,
} from "@/components/ui/card";


import {
  PosShell,
} from "@/components/layout/pos-shell";


import {
  CategoryForm,
} from "@/components/categories/category-form";


import {
  CategoryList,
} from "@/components/categories/category-list";



type Category = {

  id:string;

  name:string;

};






export default function CategoriesPage(){


  const [
    categories,
    setCategories
  ] =
  useState<Category[]>([]);



  const [
    loading,
    setLoading
  ] =
  useState(true);



  const [
    editingCategory,
    setEditingCategory
  ] =
  useState<Category | null>(null);








  async function loadCategories(){


    try{


      setLoading(true);



      const res =
        await fetch(

          "/api/categories",

          {
            cache:"no-store",
          }

        );



      const json =
        await res.json();





      if(json.success){

        setCategories(
          json.data
        );

      }



    }catch(error){


      console.error(
        error
      );


    }finally{


      setLoading(false);


    }


  }







  useEffect(()=>{


    let ignore = false;



    async function initialLoad(){


      try{


        setLoading(true);



        const res =
          await fetch(

            "/api/categories",

            {
              cache:"no-store",
            }

          );



        const json =
          await res.json();




        if(
          json.success &&
          !ignore
        ){

          setCategories(
            json.data
          );

        }



      }catch(error){


        console.error(
          error
        );


      }finally{


        if(!ignore){

          setLoading(false);

        }


      }


    }





    void initialLoad();





    return ()=>{

      ignore = true;

    };



  },[]);









  async function deleteCategory(
    id:string
  ){



    const confirmDelete =
      window.confirm(
        "Delete this category?"
      );



    if(!confirmDelete){

      return;

    }







    try{


      const res =
        await fetch(

          `/api/categories/${id}`,

          {

            method:"DELETE",

          }

        );





      const json =
        await res.json();





      if(!res.ok){


        alert(
          json.message
        );


        return;


      }





      await loadCategories();





    }catch(error){


      console.error(
        error
      );


      alert(
        "Delete failed"
      );


    }



  }











  return (


    <PosShell>


      <div

        className="
        space-y-8
        "

      >



        <header>


          <h1

            className="
            text-3xl
            font-semibold
            "

          >

            Categories

          </h1>





          <p

            className="
            mt-2
            text-muted-foreground
            "

          >

            Manage product categories

          </p>


        </header>









        <Card

          className="
          rounded-3xl
          p-6
          "

        >



          <CategoryForm



            editingCategory={
              editingCategory
            }



            onCancelEdit={()=>{


              setEditingCategory(
                null
              );


            }}



            onSuccess={()=>{


              void loadCategories();


            }}



          />



        </Card>









        <Card

          className="
          rounded-3xl
          p-6
          "

        >





          <div

            className="
            mb-5
            flex
            items-center
            justify-between
            "

          >



            <h2

              className="
              text-lg
              font-semibold
              "

            >

              Category List

            </h2>




            <span

              className="
              text-sm
              text-muted-foreground
              "

            >

              {categories.length} items

            </span>




          </div>









          {

            loading

            ?



            <div

              className="
              py-10
              text-center
              text-muted-foreground
              "

            >

              Loading categories...

            </div>





            :





            <CategoryList


              categories={
                categories
              }



              onDelete={
                deleteCategory
              }



              onEdit={

                (category)=>{


                  setEditingCategory(
                    category
                  );



                  window.scrollTo({

                    top:0,

                    behavior:"smooth",

                  });


                }

              }



            />



          }





        </Card>





      </div>



    </PosShell>


  );


}