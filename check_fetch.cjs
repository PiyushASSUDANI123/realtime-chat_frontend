const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://chat.tiflo.in', { waitUntil: 'networkidle0' });
  
  const notes = await page.evaluate(async () => {
    try {
      const res = await fetch('https://chat.piyushassudani.in/api/notes');
      return await res.json();
    } catch (e) {
      return e.toString();
    }
  });
  
  console.log('FETCH RESULT:', notes);
  
  await browser.close();
})();
