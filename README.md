# Tab Manager

A lightweight Chrome extension for organizing, searching, and saving open browser tabs.

## Demo

![Demo](demo.gif)

## Features

- View all open tabs, automatically grouped by domain.
- Switch to or close any tab directly from the popup.
- Search and filter open tabs live by title or URL.
- Select specific tabs with checkboxes and save them as a named session instead of saving every open tab.
- Restore an entire saved session at once, or open an individual URL from a session.
- Delete an entire session or remove a single URL from a session. If the tab is currently open, it closes automatically in either case.
- Persist all data locally with `chrome.storage.local`; no external server or account is required.

## Tech Stack

- JavaScript (ES6+)
- HTML5
- CSS3
- Chrome Extension APIs: `chrome.tabs`, `chrome.storage`, and `chrome.windows`
- Chrome Extension Manifest V3

## How to Install & Use Locally

This extension is not currently published on the Chrome Web Store. To install it locally:

```text
1. Clone this repository.
2. Open Chrome and go to chrome://extensions.
3. Enable Developer mode using the toggle in the top-right corner.
4. Click Load unpacked and select the cloned project folder.
5. Pin the extension from the puzzle-piece icon in the toolbar for easy access.
6. Click the Tab Manager icon to open the popup and start using it.
```

## How to Use

1. Open the Tab Manager popup to view your current window's open tabs, grouped by domain.
2. Use the search field to filter tabs by their title or URL.
3. Click a tab row to switch to it, or click its close button to close it.
4. Select the tabs you want to keep with the checkboxes, enter a session name, and save the session.
5. Click Restore on a saved session to open all of its URLs, or click an individual URL to open only that tab.
6. Click Delete to remove a complete session. To remove just one saved URL, use the remove button next to it. If a matching tab is open, it closes automatically.

## Project Structure

```text
Tab-Manager-Extension/
├── manifest.json    # Chrome extension configuration (Manifest V3)
├── popup.html       # Popup markup
├── popup.css        # Popup styles
├── popup.js         # Tab and session management logic
├── icons/           # Optional extension icon assets
└── README.md        # Project documentation
```

Icon assets are not currently included in the repository. If added later, place them in an `icons/` directory and reference them from `manifest.json`.

## Design Decisions

Tabs are grouped by domain automatically to make large collections easier to scan without requiring users to maintain manual folders. The extension uses `chrome.storage.local` for a simple, local-first experience that requires no account and avoids the added complexity of synchronization. Sessions support both bulk restoration and individual URL actions so users can recover a full workflow or open only the tab they need.

## Future Improvements

- Publish the extension to the Chrome Web Store.
- Add drag-and-drop tab reordering.
- Add a dark/light theme toggle.
- Add keyboard shortcuts.
