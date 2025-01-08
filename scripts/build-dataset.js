const { imageHash } = require("image-hash");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const database = [];
let fetchCards = true;
let page = 1;

fs.writeFileSync("database.json", JSON.stringify(database));

const buildDataset = async () => {
  while (fetchCards) {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?page=${page}`,
      {
        headers: {
          "X-Api-Key": process.env.POKEMON_TCG_API_KEY,
        },
      },
    );
    const { count, data, totalCount } = await response.json();
    console.log("fetched page", page, data.length);

    for (const card of data) {
      await new Promise((resolve, reject) => {
        imageHash(card.images.large, 16, true, async (error, data) => {
          if (error) reject(error);

          database.push({
            id: card.id,
            hash: data,
          });
          resolve();
        });
      });
    }

    fs.writeFileSync("database.json", JSON.stringify(database));

    if (totalCount === count) {
      fetchCards = false;
      return;
    }

    page++;
  }
};

buildDataset();
