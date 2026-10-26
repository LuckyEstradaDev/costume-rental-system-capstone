import type {Metadata} from "next";
import NotFoundPage from "@/features/reusable/NotFoundPage";

export const metadata: Metadata = {
  title: "Page not found | Morena Gowns and Barongs",
  description:
    "The page you are looking for does not exist or may have been moved.",
};

export default function NotFound() {
  return <NotFoundPage />;
}
