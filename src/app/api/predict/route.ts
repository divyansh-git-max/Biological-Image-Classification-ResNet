import { NextResponse } from 'next/server';
import { Client } from '@gradio/client';

const HUGGING_FACE_SPACE_ID = "divyanshgitmax/dlp-week9-image-classifier";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Securely connect using the server-side environment variable!
    const client = await Client.connect("divyanshgitmax/dlp-week9-image-classifier", {
      hf_token: process.env.HF_TOKEN as `hf_${string}` | undefined
    });

    // Send the image to the ZeroGPU Space
    const result = await client.predict("/predict", [
      imageFile,
    ]);

    return NextResponse.json({ result: result.data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process image" }, { status: 500 });
  }
}
