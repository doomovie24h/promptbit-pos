"use client";


import Link from "next/link";


import {
  X,
  Package,
  Users,
  BarChart3,
  Settings,
  UserRoundCog,
  Table2,
  QrCode,
  LogOut,
} from "lucide-react";


import {
  useRouter,
} from "next/navigation";






type MobileMoreMenuProps = {

  open:boolean;

  onClose:()=>void;

};









const menu = [


  {
    label:"Products",
    href:"/products",
    icon:Package,
  },


  {
    label:"Customers",
    href:"/customers",
    icon:Users,
  },


  {
    label:"Reports",
    href:"/reports",
    icon:BarChart3,
  },


  {
    label:"Employees",
    href:"/employees",
    icon:UserRoundCog,
  },


  {
    label:"Tables",
    href:"/tables",
    icon:Table2,
  },


  {
    label:"QR Ordering",
    href:"/qr-ordering",
    icon:QrCode,
  },


  {
    label:"Settings",
    href:"/settings",
    icon:Settings,
  },


];









export function MobileMoreMenu({

  open,

  onClose,

}:MobileMoreMenuProps){



const router =
useRouter();






async function logout(){


await fetch(

"/api/auth/logout",

{

method:"POST",

}

);



router.push("/login");


}









if(!open)

return null;









return (



<>


{/* Overlay */}


<div

onClick={onClose}


className="
fixed
inset-0
z-40
bg-black/40
md:hidden
"

/>









{/* Sheet */}



<div

className="
fixed
bottom-0
left-0
right-0
z-50
rounded-t-3xl
bg-background
border-t
p-5
pb-8
md:hidden
animate-in
slide-in-from-bottom
"

>




<div

className="
flex
items-center
justify-between
mb-6
"

>


<h2

className="
text-lg
font-semibold
"

>

More

</h2>




<button

onClick={onClose}

className="
h-9
w-9
rounded-xl
border
flex
items-center
justify-center
hover:bg-muted
"

>

<X size={18}/>


</button>



</div>









<div

className="
grid
grid-cols-2
gap-3
"

>


{

menu.map((item)=>{


const Icon =
item.icon;



return (



<Link


key={item.href}


href={item.href}


onClick={onClose}


className="
rounded-2xl
border
p-4
flex
flex-col
items-center
justify-center
gap-2
hover:bg-muted
transition
"

>


<div

className="
h-10
w-10
rounded-xl
bg-primary/10
text-primary
flex
items-center
justify-center
"

>


<Icon size={20}/>


</div>





<span

className="
text-sm
font-medium
"

>

{item.label}


</span>




</Link>


);



})

}



</div>









<button


onClick={logout}


className="
mt-5
w-full
h-12
rounded-xl
bg-red-500/10
text-red-500
flex
items-center
justify-center
gap-2
font-medium
"

>


<LogOut size={18}/>


Logout


</button>






</div>





</>


);



}