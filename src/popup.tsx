import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { GedcomXData, Person } from './gedcomx';
import {
  DataMessage,
  ExtensionMessage,
  Page,
  ResponseMessage,
} from './data_entry';

/** Returns the name of a person to display. */
function getDisplayName(person: Person) {
  const nameForm = person.names[0].nameForms[0];
  if (nameForm.fullText) {
    return nameForm.fullText;
  }
  return nameForm.parts?.map((part) => part.value).join(' ');
}

/** Main popup component. */
const Popup = () => {
  const [gedcomData, setGedcomData] = useState<GedcomXData>();
  const [pageInfo, setPageInfo] = useState<Page>();
  const [response, setResponse] = useState<string>();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /** Handle data received from content script. */
  function onData(message: DataMessage) {
    setGedcomData(message.data);
  }

  /** Run content script on current page and wait for data. */
  useEffect(() => {
    chrome.runtime.onMessage.addListener(onData);
    (async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      setPageInfo({
        url: tab.url!,
        favicon: tab.favIconUrl!,
        title: tab.title!,
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ['js/vendor.js', 'js/content_script.js'],
      });
    })();
    return () => chrome.runtime.onMessage.removeListener(onData);
  }, []);

  /** Handle response message from iframe. */
  function handleMessage(message: MessageEvent<ResponseMessage>) {
    if (message.data?.response) {
      setResponse(message.data.response);
    }
  }

  /** Set up listener for messages from the genealogy-snippets iframe. */
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /**
   * Save scraped contents to local storage by sending it to the
   * genealogy-snippets iframe.
   */
  const saveContent = async () => {
    const data = { page: pageInfo!, data: gedcomData! };
    const message: ExtensionMessage = { message: 'addData', data: [data] };
    iframeRef.current?.contentWindow?.postMessage(message, '*');
  };

  return (
    <>
      <div style={{ marginBottom: 15 }}>
        <button
          onClick={() =>
            chrome.tabs.create({
              url: 'https://pewu.github.io/genealogy-snippets/',
            })
          }
        >
          Open my list
        </button>
      </div>
      <div style={{ width: 500, marginBottom: 15 }}>
        <button
          onClick={saveContent}
          disabled={!gedcomData}
          style={{ marginRight: 20 }}
        >
          Save
        </button>
        {response &&
          (response === 'added'
            ? 'Entry has been added to your list'
            : 'Entry already exists on your list')}
      </div>

      {gedcomData && (
        <>
          Person data extracted:
          <ul>
            {gedcomData.persons.map((person) => (
              <li key={person.id}>{getDisplayName(person)}</li>
            ))}
          </ul>
        </>
      )}

      <iframe
        src="https://pewu.github.io/genealogy-snippets/#/extension-iframe"
        ref={iframeRef}
        style={{ display: 'none' }}
      />
    </>
  );
};

// Main render call.
ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
);
