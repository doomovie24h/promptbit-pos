"use client";


import Link from "next/link";


import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  ChefHat,
  Menu,
} from "lucide-react";


import {
  usePathname,
} from "next/navigation";


import {
  useState,
} from "react";


import {
  MobileMoreMenu,
} from "./mobile-more-menu";









const menu = [


  {
    label:"Home",
    href:"/dashboard",
    icon:LayoutDashboard,
  },



  {
    label:"POS",
    href:"/cashier",
    icon:ShoppingCart,
  },



  {
    label:"Orders",
    href:"/orders",
    icon:ClipboardList,
  },



  {
    label:"Kitchen",
    href:"/kitchen",
    icon:ChefHat,
  },



  {
    label:"More",
    href:"/settings",
    icon:Menu,
  },


];









export function MobileNav(){



const pathname =
usePathname();




const [
  moreOpen,
  setMoreOpen
] =
useState(false);









return (



<>



<nav


className="
fixed
bottom-0
left-0
right-0
z-50
md:hidden
"

>


<div


className="
mx-3
mb-3
rounded-3xl
border
bg-background/95
backdrop-blur-xl
shadow-xl
"

>


<div


className="
h-20
flex
items-center
justify-around
px-2
"

>





{

menu.map((item)=>{



const Icon =
item.icon;




const active =
pathname === item.href ||
pathname.startsWith(
item.href + "/"
);








if(item.label === "More"){


return (



<button


key={item.href}


onClick={()=>setMoreOpen(true)}



className="
flex-1
h-full
flex
flex-col
items-center
justify-center
gap-1
transition
"

>


<div


className="
relative
flex
items-center
justify-center
h-10
w-10
rounded-2xl
text-muted-foreground
"

>


<Icon size={21}/>


</div>






<span


className="
text-xs
font-medium
text-muted-foreground
"

>

{item.label}


</span>




</button>


);



}









return (



<Link


href={item.href}


key={item.href}



className="
flex-1
h-full
flex
flex-col
items-center
justify-center
gap-1
transition
"

>


<div


className={`

relative

flex

items-center

justify-center

h-10

w-10

rounded-2xl

transition-all


${

active

?

"bg-primary text-primary-foreground shadow-sm scale-105"

:

"text-muted-foreground"

}


`}

>


<Icon size={21}/>





{

active && (


<span


className="
absolute
bottom-1
h-1
w-1
rounded-full
bg-primary-foreground
"

/>


)


}



</div>







<span


className={`

text-xs

font-medium


${

active

?

"text-foreground"

:

"text-muted-foreground"

}


`}

>


{item.label}


</span>






</Link>



);



})

}




</div>


</div>





</nav>










<MobileMoreMenu


open={moreOpen}


onClose={()=>setMoreOpen(false)}


/>






</>



);



}