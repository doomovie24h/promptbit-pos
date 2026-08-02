import { NextResponse } from "next/server";

import {
  getAuthCookie,
} from "@/lib/auth/cookie";

import {
  verifyToken,
} from "@/lib/auth/jwt";

import {
  db,
} from "@/lib/db/prisma";



export async function GET(
  request:Request
){


  try{


    const token =
      await getAuthCookie();



    if(!token){

      return NextResponse.json(
        {
          success:false,
          message:"Unauthenticated",
        },
        {
          status:401,
        }
      );

    }



    const payload =
      await verifyToken(token);



    const userId =
      payload.userId as string;



    const member =
      await db.storeMember.findFirst({

        where:{
          userId,
        },

      });



    if(!member){

      return NextResponse.json(
        {
          success:false,
          message:"Store not found",
        },
        {
          status:404,
        }
      );

    }




    const {searchParams} =
      new URL(request.url);



    const range =
      searchParams.get("range") ?? "7";



    const days =
      Number(range);



    const startDate =
      new Date();


    startDate.setDate(
      startDate.getDate() - days
    );



    const payments =
      await db.payment.findMany({

        where:{

          storeId:
            member.storeId,


          status:
            "PAID",


          createdAt:{
            gte:startDate,
          },


        },


        select:{


          amount:true,


          createdAt:true,


        },


        orderBy:{

          createdAt:"asc",

        },


      });





    const salesMap =
      new Map<string,number>();



    for(const payment of payments){


      const date =
        payment.createdAt
        .toISOString()
        .split("T")[0];



      const current =
        salesMap.get(date) ?? 0;



      salesMap.set(
        date,
        current + payment.amount
      );


    }




    const result =
      Array.from(
        salesMap.entries()
      ).map(
        ([date,total])=>({

          date,

          total,

        })
      );





    return NextResponse.json({

      success:true,

      data:result,

    });



  }catch(error){


    console.error(
      "Sales chart error:",
      error
    );


    return NextResponse.json(

      {
        success:false,
        message:"Sales chart failed",
      },

      {
        status:500,
      }

    );


  }


}