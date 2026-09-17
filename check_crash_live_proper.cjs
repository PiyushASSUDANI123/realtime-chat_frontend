const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('https://chat.tiflo.in', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('New Note'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  await page.type('.editor-title-input', 'password - piyush', {delay: 50});
  await page.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  if (html.includes('chat-container')) {
    console.log('Chat Panel Rendered Successfully.');
  } else {
    console.log('CRASH CONFIRMED. HTML:', html.substring(0, 500));
  }
  
  await browser.close();
})();
