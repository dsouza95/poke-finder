import { BrazillianFlag } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Card {
  id: string;
  abilities: {
    name: string;
    text: string;
  }[];
  images: {
    large: string;
  };
  name: string;
  number: number;
  rules: string[];
  set: {
    name: string;
    series: string;
    printedTotal: number;
    ptcgoCode: string;
  };
  supertype: "Pokémon" | "Trainer" | "Energy";
  tcgplayer: {
    url: string;
  };
}

export default async function Home({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const getCardRulesToDisplay = (card: Card) => {
    if (card.supertype === "Trainer") {
      // Remove the last rule for trainers, which is always a redundant, generic rule
      return card.rules.slice(0, -1);
    }
    return card.rules;
  };

  const formatSetNumber = (number: number) => {
    return number.toString().padStart(3, "0");
  };

  const { slug } = await params;
  const { data: card }: { data: Card } = await fetch(
    `https://api.pokemontcg.io/v2/cards/${slug}`,
  ).then((response) => response.json());

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 p-5 sm:flex-row sm:justify-center">
      {/* Card title and set (mobile) */}
      <div className="flex flex-col gap-1 self-start sm:hidden">
        <p className="text-4xl font-bold">
          {card.name}
          <span className="ml-3 text-xl font-normal text-muted-foreground">
            ({card.number}/{card.set.printedTotal})
          </span>
        </p>

        <p className="text-lg text-muted-foreground">
          {card.set.name} - {card.set.series}
        </p>
      </div>

      {/* Card image */}
      <div className="flex flex-1 justify-center">
        <Image
          alt={card.name}
          src={card.images.large}
          width={224}
          height={224}
          className="my-5 self-center sm:hidden"
        />
        <Image
          alt={card.name}
          src={card.images.large}
          width={320}
          height={320}
          className="my-5 hidden self-center sm:block"
        />
      </div>

      <div className="flex flex-1 flex-col gap-5">
        {/* Card title and set (desktop) */}
        <div className="hidden flex-col gap-1 self-start sm:flex">
          <p className="text-4xl font-bold">
            {card.name}
            <span className="ml-3 text-xl font-normal text-muted-foreground">
              ({card.number}/{card.set.printedTotal})
            </span>
          </p>

          <p className="text-lg text-muted-foreground">
            {card.set.name} - {card.set.series}
          </p>
        </div>

        {/* Card rules */}
        {getCardRulesToDisplay(card)?.map((rule) => (
          <blockquote className="text-center sm:text-left" key={rule}>
            <p className="max-w-xl text-xs text-muted-foreground">
              &quot;{rule}&quot;
            </p>
          </blockquote>
        ))}

        {/* Card seller links */}
        <div className="flex flex-row justify-center gap-2 sm:justify-start">
          <Button asChild>
            <Link href={card.tcgplayer.url} target="_blank">
              TCGPlayer
              <Globe />
            </Link>
          </Button>

          <Button asChild>
            <Link
              href={`https://www.ligapokemon.com.br/?view=cards/card&card=${encodeURIComponent(
                card.name,
              )} (${formatSetNumber(card.number)}/${formatSetNumber(
                card.set.printedTotal,
              )})&ed=${card.set.ptcgoCode}&num=${formatSetNumber(card.number)}`}
              target="_blank"
            >
              Liga Pokémon
              <BrazillianFlag />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
