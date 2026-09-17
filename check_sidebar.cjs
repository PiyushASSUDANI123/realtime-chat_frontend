const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://chat.tiflo.in', { waitUntil: 'networkidle0' });
  
  // Wait a moment for React to fetch and render
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  
  if (html.includes('Kinematics')) {
    console.log('SUCCESS: Notes are rendering!');
  } else {
    console.log('FAIL: Notes are not rendering. HTML Snippet:');
    console.log(html.substring(0, 500));
  }
  
  await browser.close();
})();
