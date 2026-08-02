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


export async function GET(){

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

    const user =
      await db.user.findUnique({

        where:{
          id:userId,
        },

        include:{

          members:{

            include:{
              store:true,
            },

          },

        },

      });

    if(!user){

      return NextResponse.json(

        {
          success:false,
          message:"User not found",
        },

        {
          status:404,
        }

      );

    }

    // กำหนด Type : any ให้กับพารามิเตอร์ member เพื่อป้องกัน Type Error
    const stores =
      user.members.map(
        (member: any)=>({

          id:
          member.store.id,

          name:
          member.store.name,

          slug:
          member.store.slug,

          role:
          member.role,

        })
      );

    const currentStore =
      stores[0] ?? null;

    return NextResponse.json({

      success:true,

      data:{

        id:
        user.id,

        email:
        user.email,

        store:
        currentStore,

        stores,

      },

    });

  }catch(error){

    console.error(error);

    return NextResponse.json(

      {
        success:false,
        message:"Session expired",
      },

      {
        status:401,
      }

    );

  }

}