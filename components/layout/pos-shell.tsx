"use client";

import {
  Sidebar,
} from "./sidebar";

import {
  Topbar,
} from "./topbar";

import {
  MobileNav,
} from "./mobile-nav";


export function PosShell({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-muted/20
        text-foreground
      "
    >

      <div
        className="
          flex
          min-h-screen
        "
      >

        <aside
          className="
            fixed
            inset-y-0
            left-0
            z-40
            hidden
            w-64
            xl:flex
          "
        >

          <div
            className="
              flex
              w-full
              border-r
              bg-background
            "
          >

            <Sidebar />

          </div>

        </aside>



        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
            xl:pl-64
          "
        >

          <Topbar />



          <main
            className="
              flex-1
              overflow-y-auto
              px-4
              py-5
              sm:px-6
              lg:px-8
              pb-24
              xl:pb-8
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



      <MobileNav />

    </div>
  );

}