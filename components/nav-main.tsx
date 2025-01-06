"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const Navbar = () => {
  return (
    <Card className="bg-card shadow-indigo-500/40 py-3 px-4 border-0 flex items-center justify-between gap-6 rounded-2xl m-5">
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
