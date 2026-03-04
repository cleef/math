


 node -e '                     
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file:///peipei.html");
  await page.locator(".poster").screenshot({ path: "peipei_resume.png" });
  await browser.close();
})();
' && ls -l "peipei_resume.png"
