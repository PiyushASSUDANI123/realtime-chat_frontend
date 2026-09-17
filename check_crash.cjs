const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('https://chat.tiflo.in', { waitUntil: 'networkidle0' });
  
  // Click New Note
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('New Note'));
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // Type in the title input
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="Note Title"]');
    if (input) {
      input.value = 'password - piyush';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  console.log('Test completed.');
  
  await browser.close();
})();
