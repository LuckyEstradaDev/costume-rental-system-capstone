import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {LegalDocument} from "@/features/legal/components/LegalDocument";
import {readLegalMarkdown} from "@/features/legal/lib/readLegalMarkdown";

export default function TermsPage() {
  const markdown = readLegalMarkdown("terms.md");

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <Button asChild variant="outline" size="sm" className="mb-8 gap-2">
          <Link href="/">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <LegalDocument markdown={markdown} />
      </div>
    </main>
  );
}
