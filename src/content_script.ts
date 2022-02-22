// The code that is executed in the context of the scraped page.

import genscrape from 'genscrape';

// Scrape current page and send results to extension.
genscrape()
  .on('data', (data: any) =>
    chrome.runtime.sendMessage({ result: 'data', data })
  )
  .on('noMatch', () => chrome.runtime.sendMessage({ result: 'noMatch' }))
  .on('noData', () => chrome.runtime.sendMessage({ result: 'noData' }))
  .on('error', (error: any) =>
    chrome.runtime.sendMessage({ result: 'error', error })
  );
