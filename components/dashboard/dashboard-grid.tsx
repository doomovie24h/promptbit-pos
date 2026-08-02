import type {
  LucideIcon,
} from "lucide-react";

import {
  StatCard,
} from "./stat-card";


export type DashboardStat = {

  title: string;

  value: string;

  icon: LucideIcon;

  description?: string;

};


type DashboardGridProps = {

  stats: DashboardStat[];

};



export function DashboardGrid({
  stats,
}: DashboardGridProps) {


  return (

    <div
      className="
        grid
        gap-4
        md:grid-cols-2
        xl:grid-cols-4
      "
    >

      {
        stats.map((item)=>(


          <StatCard

            key={item.title}

            title={item.title}

            value={item.value}

            icon={item.icon}

            description={item.description}

          />


        ))
      }


    </div>

  );

}