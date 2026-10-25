import type {Metadata} from "next";

import Footer from "@/features/landing-page/components/Footer";
import Header from "@/features/landing-page/components/Header";
import {NotFoundView} from "@/features/reusable/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found | Morena Gowns and Barongs",
  description:
    "The page you are looking for does not exist or may have been moved.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12 md:px-8">
        <div className="w-full max-w-3xl">
          <NotFoundView
            description="The link may be broken, or the page may have been removed. Check the address or return to the collection."
            className="border-0 bg-transparent shadow-none"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
