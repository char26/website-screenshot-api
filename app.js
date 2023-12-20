const express = require('express');
const puppeteer = require('puppeteer');
const { unlinkSync, existsSync, mkdirSync } = require('fs');

const PORT = process.env.PORT || 8080;

const app = express();

if (!existsSync("/tmp/screenshots")) {
    mkdirSync("/tmp/screenshots");
}

app.get('/', (req, res) => {
    res.send('Welcome to Website Screenshot API. To take a screenshot, try the GET /screenshot endpoint.');
});

app.get('/screenshot', (req, res) => {
    (async () => {
        const url = req.query["url"];
        const width = req.query["width"] || 1920;
        const height = req.query["height"] || 1080;

        const uid = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36);
        const filePath = `/tmp/screenshots/${uid}.jpg`;

        const browser = await puppeteer.launch({
            headless: "new"
        });
        const page = await browser.newPage();

        await page.setViewport({ width: width, height: height });
        try {
            await page.goto(url);
        } catch (e) {
            res.status(400).send("Error in URL.");
        }

        try {
            await page.screenshot({ path: filePath });
        } catch (err) {
            console.log(`Error: ${err.message}`);
        } finally {
            await browser.close();
            res.sendFile(filePath, () => {
                unlinkSync(filePath);
            });
        }
    })();
});

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(PORT, () => {
    console.log('Server running on port ', PORT);
});