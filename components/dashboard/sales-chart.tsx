"use client";


import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";



type SalesPoint = {

  date: string;

  total: number;

};



type SalesChartProps = {

  data: SalesPoint[];

};



export function SalesChart({
  data,
}: SalesChartProps) {


  return (

    <div
      className="
        h-72
        w-full
      "
    >

      {
        data.length === 0 ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-sm
              text-muted-foreground
            "
          >

            No sales data

          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />


              <XAxis
                dataKey="date"
                tickLine={false}
              />


              <YAxis
                tickLine={false}
              />


              <Tooltip

                formatter={(value) => (

                  `฿${Number(value).toLocaleString()}`

                )}

                labelClassName="
                  text-sm
                "

              />


              <Line

                type="monotone"

                dataKey="total"

                name="Sales"

                strokeWidth={2}

                dot={false}

              />


            </LineChart>

          </ResponsiveContainer>

        )
      }


    </div>

  );

}