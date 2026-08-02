"use client";


import {
  Trash2,
} from "lucide-react";


import {
  useState,
} from "react";





export function ProductDelete({

  productId,

  onSuccess,

}:{

  productId:string;

  onSuccess:()=>void;

}){



  const [
    loading,
    setLoading
  ] =
  useState(false);







  async function handleDelete(){


    const confirmed =
      window.confirm(
        "Delete this product?"
      );



    if(!confirmed){

      return;

    }




    try{


      setLoading(true);




      const res =
        await fetch(

          `/api/products/${productId}`,

          {

            method:"DELETE",

          }

        );





      const json =
        await res.json();





      if(!res.ok){


        alert(
          json.message ??
          "Delete failed"
        );


        return;

      }







      onSuccess();





    }catch(error){


      console.error(
        "Delete product error:",
        error
      );



      alert(
        "Delete failed"
      );



    }finally{


      setLoading(false);


    }


  }








  return (


    <button


      disabled={loading}


      onClick={handleDelete}


      className="
      rounded-xl
      p-2
      text-red-500
      hover:bg-red-50
      disabled:opacity-50
      "


    >



      <Trash2 size={18}/>



    </button>


  );


}