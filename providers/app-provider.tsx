"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ThemeProvider } from "./theme-provider";

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({
  children,
}: AppProviderProps): React.JSX.Element {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}

          <Toaster
            position="top-right"
            richColors
            expand
            closeButton
            duration={3000}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}