import axios from "axios";
import axiosRetry from "axios-retry";
import * as fs from "fs";
axiosRetry(axios, { retries: 5 });
axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});
async function main() {
  try {
    const data = fs.readFileSync("./isbn_list.txt", "utf-8");
    const lines = data
      .trim()
      .split("\n")
      .map((x) => x.replace("\r", ""))
      .reverse();
    console.log(lines);
    for (const line of lines) {
      try {
        await axios.get(
          `https://mybookquest.com/api/books/${line.trim()}?useProxy=true`,
          {
            headers: {
              "Accept-Encoding": "gzip, deflate", // Exclude 'br' (Brotli)
            },
          }
        );
      } catch {}
    }
  } catch (error) {
    console.log(error);
  }
}
await main();
