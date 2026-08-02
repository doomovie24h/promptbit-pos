import bcrypt from "bcryptjs";

import { db } from "@/lib/db/prisma";

import type { LoginInput } from "../schemas/login.schema";


export async function loginService(
  input: LoginInput
) {

  const user =
    await db.user.findUnique({
      where:{
        email: input.email,
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
    throw new Error(
      "Invalid credentials"
    );
  }


  const passwordMatch =
    await bcrypt.compare(
      input.password,
      user.password
    );


  if(!passwordMatch){
    throw new Error(
      "Invalid credentials"
    );
  }


  return {
    id:user.id,

    email:user.email,

    stores:user.members.map(
      (member)=>({
        id:member.store.id,
        name:member.store.name,
        slug:member.store.slug,
        role:member.role,
      })
    ),
  };
}