import {
  BarChart3,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";


export type SidebarMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};


export type SidebarMenuGroup = {
  title: string;
  items: SidebarMenuItem[];
};



export const sidebarMenuGroups: SidebarMenuGroup[] = [

  {
    title: "SELL",

    items: [
      {
        label: "Cashier",
        href: "/cashier",
        icon: ShoppingCart,
      },

      {
        label: "Orders",
        href: "/orders",
        icon: ClipboardList,
      },

      {
        label: "Tables",
        href: "/tables",
        icon: Utensils,
      },
    ],
  },


  {
    title: "OPERATIONS",

    items: [
      {
        label: "Kitchen",
        href: "/kitchen",
        icon: ChefHat,
      },

      {
        label: "Products",
        href: "/products",
        icon: Package,
      },

      {
        label: "Categories",
        href: "/categories",
        icon: Tags,
      },
    ],
  },


  {
    title: "BUSINESS",

    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },

      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
      },

      {
        label: "Customers",
        href: "/customers",
        icon: Users,
      },
    ],
  },

];