import { configDotenv } from "dotenv";
import * as fs from "fs";
import * as readline from "readline";

// init
configDotenv();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter prompt: ", async (answer) => {
  rl.close();

  const spinnerChars = ["|", "/", "-", "\\"];
  let index = 0;

  // spinner
  const intervalId = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Generating 🚀... ${spinnerChars[index]}`);
    index = (index + 1) % spinnerChars.length;
  }, 100);

  const filename = await main(answer);

  clearInterval(intervalId);

  // outro
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write("Generated ✅ at image-" + filename + ".jpeg");
});

// main function
async function main(prompt) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KEY}`,
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    }
  );

  if (!response.ok) throw new Error("Network error");

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = Math.random().toString(36).substring(2, 10);
  fs.writeFileSync(`image-${filename}.jpeg`, buffer);
  return filename;
}
