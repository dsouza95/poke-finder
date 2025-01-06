import { BrazillianFlag } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: pokemon } = await fetch(
    `https://api.pokemontcg.io/v2/cards/${slug}`
  ).then((response) => response.json());

  return (
    <div className="flex flex-row gap-5 h-full items-center justify-center p-5 w-full">
      <div className="flex flex-1 justify-center">
        <Image
          alt={pokemon.name}
          src={pokemon.images.large}
          width={320}
          height={320}
        />
      </div>

      <div className="flex flex-col flex-1 gap-5">
        <p className="text-3xl font-bold">
          {pokemon.name}
          <span className="ml-3 text-xl font-normal text-muted-foreground">
            ({pokemon.number}/{pokemon.set.printedTotal})
          </span>
        </p>

        <p className="text-base text-muted-foreground">
          {pokemon.set.name} - {pokemon.set.series}
        </p>

        <p className="text-sm text-muted-foreground pe-12">
          &quot;{pokemon.rules[0]}&quot;
        </p>

        <div className="flex flex-row gap-2">
          <Button asChild>
            <Link href={pokemon.tcgplayer.url} target="_blank">
              TCGPlayer
              <Globe />
            </Link>
          </Button>

          <Button asChild>
            <Link
              href={`https://www.ligapokemon.com.br/?view=cards/card&card=${encodeURIComponent(
                pokemon.name
              )}(${pokemon.number}/${pokemon.set.printedTotal})&ed=${
                pokemon.set.ptcgoCode
              }&num=${pokemon.number}`}
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
