<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/dsouza95/poke-finder">
    <img src="https://poke-library-zeta.vercel.app/pokeball.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Poké Finder</h3>

  <p align="center">
    Search for Pokémon cards by image using AI
    <br />
    <br />
    <a href="https://poke-library-zeta.vercel.app">View Demo</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

This project is a web app that allows you to search for Pokémon cards by image using AI. It does so by detecting a Pokémon card in the image, generating embeddings for the card, and then searching for the nearest neighbor in a database. All AI models run locally on the user's browser for cost and speed :rocket:.

### Built With

Many thanks to the several free/freemium, open source projects and services used:

- [Pokémon TCG API](https://pokemontcg.io/) - for the Pokémon card data
- [Pokémon Card Detection Dataset and Model](https://universe.roboflow.com/pokemoncards/pokemon_card) and [Roboflow](https://roboflow.com/) - for the object detection model
- [Transformers.js](https://huggingface.co/docs/transformers.js/index) - for the image embeddings model
- [MongoDB](https://www.mongodb.com/) - for the database
- [Next.js](https://nextjs.org/) - for the web app framework
- [TailwindCSS](https://tailwindcss.com/) - for the styling
- [Shadcn](https://ui.shadcn.com/) - for the UI components

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

If you want to run this project locally, follow these steps:

### Installation

1. Get a free Pokémon API Key at [https://pokemontcg.io/](https://pokemontcg.io/)
2. Setup MongoDB Atlas cluster at [https://www.mongodb.com/atlas/database](https://www.mongodb.com/atlas/database)
3. Clone the repo
   ```sh
   git clone https://github.com/dsouza95/poke-finder
   ```
4. Install PNPM packages
   ```sh
   pnpm install
   ```
5. Copy the .env.local.template file to .env.local and fill in the values from step 1 and 2

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Database

If you want to run locally, you will need to populate your MongoDB Atlas cluster with the Pokémon card data.
This script will fetch all the Pokémon cards from the Pokémon TCG API, calculate embeddings for each card, and then insert the data into the database (:warning: this will take a while).
You can do this by running the `populate-db.js` script.

```sh
pnpm run populate-db
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TODO -->

<!-- USAGE EXAMPLES -->

### Usage

Once the Next.js app is running, you can search for Pokémon cards by uploading an image of a Pokémon card. The app will detect the card, generate embeddings for it, and then search for the nearest neighbor in the database.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
