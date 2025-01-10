import { pipeline } from "@huggingface/transformers";

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static task = "image-feature-extraction";
  static model = "Xenova/clip-vit-base-patch32";
  static instance = null;

  static async getInstance(progress_callback) {
    this.instance ??= await pipeline(this.task, this.model, {
      progress_callback,
    });
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  // Retrieve the feature extraction pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  const featureExtractor = await PipelineSingleton.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    self.postMessage(x);
  });

  if (!event.data.uri) return;

  const output = await featureExtractor(event.data.uri);

  self.postMessage({
    status: "complete",
    output: output.data,
  });
});
