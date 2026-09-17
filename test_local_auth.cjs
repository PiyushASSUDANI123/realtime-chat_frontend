const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  // Set VITE_API_URL dynamically or just use proxy
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('New Note'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Type password
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    // find the one with placeholder "Note title..."
    const input = Array.from(inputs).find(i => i.placeholder.includes('Note title'));
    if (input) {
      input.value = 'password - piyush';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const ke = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' });
      input.dispatchEvent(ke);
    } else {
      console.log('INPUT NOT FOUND');
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  if (html.includes('chat-container')) {
    console.log('Chat Panel Rendered Successfully.');
  } else {
    console.log('CRASH CONFIRMED. HTML:', html.substring(0, 500));
  }
  
  await browser.close();
})();
