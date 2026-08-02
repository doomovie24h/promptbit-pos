import { NextResponse } from "next/server";

import {
  db,
} from "@/lib/db/prisma";

import {
  getAuthCookie,
} from "@/lib/auth/cookie";

import {
  verifyToken,
} from "@/lib/auth/jwt";



export async function POST(){


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



const exists =
await db.category.count({

where:{
storeId:member.storeId,
},

});



if(exists > 0){

return NextResponse.json({

success:true,

message:"Categories already created",

});

}




await db.category.createMany({

data:[

{
name:"Food",
storeId:member.storeId,
},

{
name:"Drink",
storeId:member.storeId,
},

{
name:"Dessert",
storeId:member.storeId,
},

],

});



return NextResponse.json({

success:true,

message:"Categories created",

});



}catch(error){


console.error(error);


return NextResponse.json(

{
success:false,
message:"Seed failed",
},

{
status:500,
}

);


}


}