// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module 'pdf-parse-fork';
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse-fork";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CHUNK_SIZE = 400;
const PDF_DIR = path.join(process.cwd(), "scripts/pdfs");

function chunkText(text: string, chunkSize: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    current.push(word);
    if (current.length >= chunkSize) {
      chunks.push(current.join(" "));
      current = [];
    }
  }
  if (current.length > 0) chunks.push(current.join(" "));
  return chunks;
}

async function ingestPDF(filePath: string) {
  const fileName = path.basename(filePath);
  console.log(`\nProcessing: ${fileName}`);

  const buffer = fs.readFileSync(filePath);
  const { text } = await pdfParse(buffer);

  const chunks = chunkText(text, CHUNK_SIZE);
  console.log(`  → ${chunks.length} chunks`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { error } = await supabase.from("document_chunks").upsert({
      content: chunk,
      embedding,
      source: fileName,
      chunk_index: i,
    });

    if (error) {
      console.error(`  ✗ Error on chunk ${i}:`, error.message);
    } else {
      console.log(`  ✓ Chunk ${i + 1}/${chunks.length}`);
    }
  }
}

async function main() {
  const files = fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf"));

  if (files.length === 0) {
    console.log("No PDFs found in scripts/pdfs/");
    return;
  }

  console.log(`Found ${files.length} PDF(s) to process`);

  for (const file of files) {
    await ingestPDF(path.join(PDF_DIR, file));
  }

  console.log("\n✓ Ingestion complete");
}

main().catch(console.error);