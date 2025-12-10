'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dribbble,
  Github,
  Twitch,
  Twitter,
} from "lucide-react";
import Link from "next/link";

interface FooterLink {
  title: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections?: FooterSection[];
  logo?: React.ReactNode;
  description?: string;
  logoUrl?: string;
  companyName?: string;
  socialLinks?: {
    twitter?: string;
    dribbble?: string;
    twitch?: string;
    github?: string;
  };
}

const defaultSections: FooterSection[] = [];

const Footer = ({ 
  sections = defaultSections,
  logo,
  description = "Design amazing digital experiences that create more happy in the world.",
  logoUrl = "/",
  companyName = "Shadcn UI Blocks",
  socialLinks = {}
}: FooterProps) => {
  return (
    <footer className="border-t">
      <div className="max-w-(--breakpoint-xl) mx-auto">
        <div className="py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-8 gap-y-10 px-6">
          <div className="col-span-full xl:col-span-2">
            {/* Logo */}
            {logo}

            <p className="mt-4 text-muted-foreground">
              {description}
            </p>
          </div>

          {sections.map(({ title, links }) => (
            <div key={title}>
              <h6 className="font-medium">{title}</h6>
              <ul className="mt-6 space-y-4">
                {links.map(({ title, href }) => (
                  <li key={title}>
                    <Link
                      href={href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Subscribe Newsletter */}
          <div className="col-span-2">
            <h6 className="font-medium">Newsletters </h6>
            <form className="mt-6 flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="grow max-w-64"
              />
              <Button>Subscribe</Button>
            </form>
          </div>
        </div>
        <Separator />
        <div className="py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6">
          <span className="text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <Link href={logoUrl} target="_blank">
              {companyName}
            </Link>
            . Tous droits réservés .
          </span>

          <div className="flex items-center gap-5 text-muted-foreground">
            <Link href={socialLinks.twitter || "#"} target="_blank">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href={socialLinks.dribbble || "#"} target="_blank">
              <Dribbble className="h-5 w-5" />
            </Link>
            <Link href={socialLinks.twitch || "#"} target="_blank">
              <Twitch className="h-5 w-5" />
            </Link>
            <Link href={socialLinks.github || "#"} target="_blank">
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
