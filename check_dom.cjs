const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://chat.tiflo.in', { waitUntil: 'networkidle0' });
  
  const counts = await page.evaluate(() => {
    const el = document.querySelector('.subject-header span:last-child');
    return el ? el.textContent : 'Not found';
  });
  
  console.log('NOTE COUNT IN DOM:', counts);
  
  await browser.close();
})();
