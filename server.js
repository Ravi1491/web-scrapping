const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const locateChrome = require("locate-chrome");

const app = express();
const port = 4000;

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Web Scraping!");
});

app.post("/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("url", url);

    // const executablePath =
    //   (await new Promise((resolve) => locateChrome((arg) => resolve(arg)))) ||
    //   "";

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-http2", "--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Rotate User Agents
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
    );

    // Set other options like viewport and additional headers if necessary
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

    console.log("page 2");
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        console.log("page 3");
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          console.log("page 4");
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    console.log("page 5");
    const pageData = await page.evaluate(() => {
      return {
        title: document.title,
        body: document.body.innerText,
        fullPageContent: document.documentElement.outerHTML,
        pageContent: document.body.textContent,
      };
    });

    console.log("Length: ", pageData.fullPageContent.length);
    await browser.close();
    // return {};
    res.send({ content: pageData.fullPageContent });
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
});

app.post("/scrape-title", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).send("URL is required");
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-http2", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Rotate User Agents
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
    );

    // Set other options like viewport and additional headers if necessary
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });

    const title = await page.title();

    await browser.close();

    res.send(`Page title is: ${title}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
