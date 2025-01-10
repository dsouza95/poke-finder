const { pipeline } = require("@huggingface/transformers");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

async function run() {
  const pipe = await pipeline(
    "image-feature-extraction",
    "Xenova/clip-vit-base-patch32",
  );

  const embeddings = await pipe(
    "https://static.wikia.nocookie.net/pokemon/images/0/0e/Charizard_Base_Set.jpg/revision/latest?cb=20130202134059",
  );

  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();

    const database = client.db("pokemon");
    const collection = database.collection("cards");

    const results = await collection.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embeddings",
          queryVector: Array.from(embeddings.data),
          numCandidates: 20,
          limit: 1,
        },
      },
    ]);

    console.log(await results.toArray());
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
