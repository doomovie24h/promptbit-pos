"use client";

import {
  useState
} from "react";

import {
  useRouter
} from "next/navigation";


export function LoginForm(){


  const router =
    useRouter();


  const [email,setEmail] =
    useState("");


  const [password,setPassword] =
    useState("");


  const [loading,setLoading] =
    useState(false);



  async function handleSubmit(
    e:React.FormEvent
  ){

    e.preventDefault();


    setLoading(true);



    try{


      const res =
        await fetch(
          "/api/auth/login",
          {
            method:"POST",

            headers:{
              "Content-Type":
              "application/json",
            },

            body:JSON.stringify({
              email,
              password,
            }),

          }
        );



      const data =
        await res.json();



      console.log(
        data
      );



      if(!res.ok){

        alert(
          data.message ??
          "Login failed"
        );

        return;

      }



      router.replace(
        "/dashboard"
      );


      router.refresh();



    }catch(error){

      console.error(error);

      alert(
        "Login error"
      );


    }finally{

      setLoading(false);

    }


  }



  return (

    <form
      onSubmit={handleSubmit}
      className="
      space-y-4
      "
    >


      <input

        className="
        w-full
        rounded-lg
        border
        p-3
        "

        placeholder="Email"

        value={email}

        onChange={
          e=>setEmail(
            e.target.value
          )
        }

      />



      <input

        className="
        w-full
        rounded-lg
        border
        p-3
        "

        placeholder="Password"

        type="password"

        value={password}

        onChange={
          e=>setPassword(
            e.target.value
          )
        }

      />



      <button

        disabled={loading}

        className="
        w-full
        rounded-lg
        bg-black
        p-3
        text-white
        "

      >

        {
          loading
          ?
          "Loading..."
          :
          "Login"
        }


      </button>


    </form>

  );

}