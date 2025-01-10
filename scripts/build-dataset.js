const dotenv = require("dotenv");
const { pipeline } = require("@huggingface/transformers");
const { MongoClient } = require("mongodb");

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
const failedCards = [];
let fetchCards = true;
let page = 1;

const buildDataset = async () => {
  await client.connect();

  const pipe = await pipeline(
    "image-feature-extraction",
    "Xenova/clip-vit-base-patch32",
  );
  const database = client.db("pokemon");
  const collection = database.collection("cards");

  try {
    while (fetchCards) {
      console.log("processing page", page);
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?page=${page}`,
        {
          headers: {
            "X-Api-Key": process.env.POKEMON_TCG_API_KEY,
          },
        },
      );
      const { count, data, totalCount } = await response.json();

      for (const card of data) {
        try {
          const tensor = await pipe(card.images.large);

          await collection.updateOne(
            { cardId: card.id },
            { $set: { cardId: card.id, embeddings: Array.from(tensor.data) } },
            { upsert: true },
          );
        } catch {
          failedCards.push(card.id);
          continue;
        }
      }

      if (totalCount === count) {
        fetchCards = false;
        return;
      }

      page++;
    }

    console.log("failed to process cards:", failedCards);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

buildDataset();
