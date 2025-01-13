"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <Card className="m-5 flex items-center justify-between gap-6 rounded-2xl border-0 bg-card px-4 py-3 shadow-indigo-500/40">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/pokeball.svg" alt="pokemon" height={24} width={24} />
        <span className="text-lg font-bold">Poké Finder</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="https://github.com/dsouza95/poke-finder" target="_blank">
          <Github className="p-0.5" />
        </Link>
        <ThemeToggle />
      </div>
    </Card>
  );
};

export default Navbar;
