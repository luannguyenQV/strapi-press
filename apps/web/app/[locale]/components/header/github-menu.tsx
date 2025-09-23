import { Github } from "lucide-react";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";

export const GithubMenu = () => {
  return (
    <Button variant="ghost" asChild>
      <Link href="https://github.com/strapi/strapi"
        target="_blank">
        <Github />
      </Link>
    </Button>
  );
};