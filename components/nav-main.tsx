"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const Navbar = () => {
  return (
    <Card className="m-5 flex items-center justify-between gap-6 rounded-2xl border-0 bg-card px-4 py-3 shadow-indigo-500/40">
      <div className="flex items-center gap-2">
        <Image src="/pokeball.svg" alt="pokemon" height={24} width={24} />
        <p className="text-lg font-bold">Poké Library</p>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </Card>
  );
};

export default Navbar;
