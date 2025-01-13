import ImageSearch from "@/components/image-search";

function App() {
  return (
    <main className="flex h-full flex-col items-center p-12">
      <div className="flex flex-col items-center justify-center">
        <h1 className="mb-2 text-center text-3xl font-bold sm:text-5xl">
          Pokémon Card Finder
        </h1>
        <h2 className="mb-4 text-center text-lg sm:text-xl">
          Upload an image of a Pokémon card to find prices and other details.
        </h2>
      </div>

      <div className="mt-16 sm:mt-24">
        <ImageSearch />
      </div>
    </main>
  );
}

export default App;
