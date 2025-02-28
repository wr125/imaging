import * as fal from "@fal-ai/serverless-client";
import { NextResponse } from "next/server";

// Log environment variable (without exposing the full key)
const falKey = process.env.FAL_KEY || '';
console.log('FAL_KEY present:', !!falKey, 'Length:', falKey.length);

if (!process.env.FAL_KEY) {
  throw new Error('FAL_KEY environment variable is not set');
}

// Configure FAL.ai client with API key
try {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
  console.log('FAL.ai client configured successfully');
} catch (error) {
  console.error('Error configuring FAL.ai client:', error);
}

interface FalImage {
  url: string;
  width: number;
  height: number;
  content_type: string;
}

interface FalInput {
  prompt: string;
  negative_prompt: string;
  num_inference_steps: number;
  guidance_scale: number;
  width: number;
  height: number;
  seed: number;
  num_images: number;
}

interface FalResponse {
  images: FalImage[];
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

export async function POST(request: Request) {
  console.log('POST request received');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { prompt } = body;
    console.log('Received prompt:', prompt);

    if (!prompt) {
      console.log('No prompt provided');
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log('Making request to FAL.ai...');
    try {
      // Generate images in parallel for better performance
      const results = await Promise.all([
        fal.subscribe<FalResponse, FalInput>("110602490-fast-sdxl", {
          input: {
            prompt,
            negative_prompt: "",
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024,
            seed: Math.floor(Math.random() * 1000000),
            num_images: 1,
          },
          pollInterval: 1000,
          logs: true,
        }),
        fal.subscribe<FalResponse, FalInput>("110602490-fast-sdxl", {
          input: {
            prompt,
            negative_prompt: "",
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024,
            seed: Math.floor(Math.random() * 1000000),
            num_images: 1,
          },
          pollInterval: 1000,
          logs: true,
        }),
        fal.subscribe<FalResponse, FalInput>("110602490-fast-sdxl", {
          input: {
            prompt,
            negative_prompt: "",
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024,
            seed: Math.floor(Math.random() * 1000000),
            num_images: 1,
          },
          pollInterval: 1000,
          logs: true,
        }),
        fal.subscribe<FalResponse, FalInput>("110602490-fast-sdxl", {
          input: {
            prompt,
            negative_prompt: "",
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 1024,
            height: 1024,
            seed: Math.floor(Math.random() * 1000000),
            num_images: 1,
          },
          pollInterval: 1000,
          logs: true,
        })
      ]);

      console.log('FAL.ai responses received');

      // Validate all results have images
      if (results.some(result => !result?.images)) {
        throw new Error('Some images failed to generate');
      }

      // Combine all images
      const allImages = results.flatMap(result => result.images);
      console.log('Total images generated:', allImages.length);

      if (allImages.length === 0) {
        throw new Error('No images generated');
      }

      const imageUrls = allImages.map(img => img.url);
      console.log('Generated image URLs:', imageUrls);

      return NextResponse.json({ imageUrls });
    } catch (falError) {
      console.error('FAL.ai API error:', {
        error: falError,
        message: falError instanceof Error ? falError.message : 'Unknown FAL.ai error',
        stack: falError instanceof Error ? falError.stack : undefined
      });
      throw falError;
    }
  } catch (error) {
    console.error('Request processing error:', {
      error,
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error generating image',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 