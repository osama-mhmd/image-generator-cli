import { configDotenv } from "dotenv";
import * as fs from "fs";
import * as readline from "readline";

// init
configDotenv();

const colors = {
  white: "\x1b[37m",
  gray: "\x1b[38;2;150;150;150m",
  red: "\x1b[31m",
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const spinner = () => {
  const spinnerChars = ["|", "/", "-", "\\"];
  let index = 0;

  const intervalId = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Generating 🚀... ${spinnerChars[index]}`);
    index = (index + 1) % spinnerChars.length;
  }, 100);

  return () => clearInterval(intervalId);
};

const isValidSize = (size) => {
  const regex = /^(\d+)x(\d+)$/;
  return regex.test(size);
};

rl.question("Enter prompt: ", async (answer) => {
  rl.question(
    `Enter size ${colors.gray}(default: 1024x1024)${colors.white}: `,
    async (size) => {
      process.stdout.write("\n");

      if (size.trim() !== "" && !isValidSize(size)) {
        process.stdout.write(
          `${colors.red}Invalid size. Generating with 1024x1024\n\n${colors.white}`
        );
      }

      rl.close();

      const clearSpinner = spinner();

      const filename = await main(answer, isValidSize() ? size : "1024x1024");

      clearSpinner();

      // outro
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write("Generated ✅ at image-" + filename + ".jpeg\n");
    }
  );
});

// main function
async function main(prompt, size) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.KEY}`,
        "x-use-cache": false,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: Number(size.split("x")[0]),
          height: Number(size.split("x")[1]),
        },
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
