import dbClient from "@/lib/database";

const findNearestNeighbor = async (embeddings: number[]) => {
  const cards = dbClient.db("pokemon").collection("cards");
  const searchResults = await cards
    .aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embeddings",
          queryVector: embeddings,
          numCandidates: 20,
          limit: 1,
        },
      },
    ])
    .toArray();

  const { cardId } = searchResults?.[0] ?? {};
  return cardId;
};

export async function POST(req: Request) {
  let nearestCardId;

  try {
    await dbClient.connect();
    const { embeddings } = await req.json();
    nearestCardId = await findNearestNeighbor(Object.values(embeddings));
  } finally {
    await dbClient.close();
  }

  return new Response(JSON.stringify({ id: nearestCardId }));
}
