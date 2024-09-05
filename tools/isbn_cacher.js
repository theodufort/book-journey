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
    const data = fs.readFileSync("./tools/isbn_list.txt", "utf-8");
    const lines = data.trim().split("\n");

    for (const line of lines) {
      console.log(line);
      try {
        await axios.get(
          `http://localhost:3000/api/books/${line.trim()}?useProxy=true`
        );
      } catch {}
    }
  } catch (error) {
    console.log(error);
  }
}
await main();
