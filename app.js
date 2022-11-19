const csv = require('csv-parser')
const fs = require("fs");
const puppeteer = require("puppeteer");
const express = require("express");
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
app.options('*', cors())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post("/post", (req, res) => {
    const body = req.body;
    let { username, password } = JSON.parse(Object.keys(body)[0])
    res.redirect("/");
    (async () => {

        if (!fs.existsSync("screenshots")) {
            fs.mkdirSync("screenshots");
        }

        let browser = null;




        const results = [];

        await fs.createReadStream('datas.csv')
            .pipe(csv())
            .on('data', async (data) => await results.push(data))
            .on('end', async () => {
                try {
                    browser = await puppeteer.launch({
                        headless: false,
                        ignoreHTTPSErrors: true,
                        args: ['--start-maximized'],
                        defaultViewport: {
                            width: 1366,
                            height: 768
                        }
                    });
                    for (const { url, filename } of results) {
                        const page = await browser.newPage();
                        await page.goto(url);
                        await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36")
                        await page.goto(url, { waitUntil: 'networkidle0' });
                        await page.addStyleTag({
                            content: `
                                      * {
                                        transition: none !important;
                                        animation: none !important;
                                      }
                                    `,
                        });
                        await page.screenshot({ path: `screenshots/${filename}.jpeg`, fullPage: true });
                    }
                } catch (err) {
                    console.log(`Error: ${err.message}`);
                } finally {
                    if (browser) {
                        await browser.close();
                    }
                    console.log(`${results.length} screenshots captured.`);
                }
            });


        // for (const { filename, url } of results) {
        //     await page.goto(url);
        //     await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36")
        //     // await page.waitForSelector('#textinput-1');
        //     // await page.waitForSelector('#textinput-2');
        //     // await page.waitForSelector('button[type="submit"]');
        //     // await page.type('#textinput-1', 'athinkstudy@gmail.com');
        //     // await page.type('#textinput-2', 'Welc0me$');
        //     // await page.click('button[type="submit"]');
        //     // await page.goto(url, { waitUntil: 'networkidle0' });
        //     // await page.goto(url, { waitUntil: 'networkidle2' });
        //     // await page.waitForTimeout(5000)

        //     // console.log(url)
        //     // await page.pdf({
        //     //     path: `screenshots/${id}.pdf`
        //     // });
        //     await page.addStyleTag({
        //         content: `
        //               * {
        //                 transition: none !important;
        //                 animation: none !important;
        //               }
        //             `,
        //     });
        //     await page.screenshot({ path: `screenshots/${filename}.jpeg`, fullPage: true });
        //     console.log(`${filename} - (${url})`);
        // }


    })()


    // res.send(req.body);
});

app.listen(8080, () => console.log(`Started server at http://localhost:8080!`));