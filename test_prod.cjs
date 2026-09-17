const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
  
  // Click New Note
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('New Note'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Type password and press enter
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if (input) {
      input.value = 'password - piyush';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const ke = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' });
      input.dispatchEvent(ke);
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  if (!html.includes('chat-panel')) {
    console.log('CRASH CONFIRMED in Prod.');
  } else {
    console.log('Chat Panel Rendered Successfully in Prod.');
  }
  
  await browser.close();
})();
