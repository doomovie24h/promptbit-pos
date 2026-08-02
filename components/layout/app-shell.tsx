import type {
  ReactNode,
} from "react";

import {
  Sidebar,
} from "./sidebar";

import {
  Topbar,
} from "./topbar";


type AppShellProps = {
  children: ReactNode;
};


export function AppShell({
  children,
}: AppShellProps) {


  return (

    <div
      className="
        min-h-screen
        bg-muted/30
      "
    >

      <Sidebar />


      <div
        className="
          flex
          min-h-screen
          flex-col
          lg:pl-72
        "
      >

        <Topbar />


        <main
          className="
            flex-1
            p-4
            sm:p-6
            lg:p-8
          "
        >

          <div
            className="
              mx-auto
              w-full
              max-w-screen-2xl
            "
          >

            {children}

          </div>

        </main>


      </div>


    </div>

  );

}