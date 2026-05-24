let pipeline = null;
let isLoading = false;
let loadPromise = null;

const loadModel = async () => {
  if (pipeline) return pipeline;
  if (loadPromise) return loadPromise;
  
  loadPromise = (async () => {
    console.log('Loading embedding model...');
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Model loaded!');
    return pipeline;
  })();
  
  return loadPromise;
};

const generateEmbedding = async (text) => {
  const model = await loadModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

module.exports = { generateEmbedding, loadModel };
