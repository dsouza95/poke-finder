import phash from "sharp-phash";
import database from "@/database.json";
import hammingDistance from "hamming-distance";

const getClosestCard = async (hash: string) => {
  const distances = database.map((card) => {
    return {
      ...card,
      distance: hammingDistance(hash, card.hash),
    };
  });

  distances.sort((a, b) => a.distance - b.distance);
  return distances[0];
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const imageFile = formData.get("image") as File;
  const imageBuffer = await imageFile.arrayBuffer();

  const hash = await phash(imageBuffer);

  const closestCard = await getClosestCard(hash);

  return new Response(JSON.stringify(closestCard));
}
