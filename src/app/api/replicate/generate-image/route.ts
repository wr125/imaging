import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token not configured" },
      { status: 500 }
    );
  }

  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  try {
    // Generate 4 images in parallel
    const imagePromises = Array(4).fill(null).map(() => 
      replicate.run(
        "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        {
          input: {
            prompt,
            image_dimensions: "768x768",
            num_outputs: 1,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            scheduler: "DPMSolverMultistep",
            // Add some randomness to make each image unique
            seed: Math.floor(Math.random() * 1000000),
          },
        }
      )
    );

    const results = await Promise.all(imagePromises);
    
    // Extract URLs from results
    const imageUrls = results.map(result => {
      const url = Array.isArray(result) ? result[0] : result;
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid response from Replicate API');
      }
      return url;
    });

    return NextResponse.json({ imageUrls }, { status: 200 });
  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
