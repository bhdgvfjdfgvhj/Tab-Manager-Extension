function getDomain(url){
    try{
        return new URL(url).hostname;
    } catch(e){
        return "other";
    }
}

function renderTabs(tabs){
    const container = document.getElementById("tab-list");
    container.innerHTML = "";

    const grouped ={};

    tabs.forEach((tab) => {
        const domain = getDomain(tab.url);

        if(!grouped[domain]) {
            grouped[domain] = [];
        }

        grouped[domain].push(tab);
    });

    Object.keys(grouped).forEach((domain) => {
        const heading = document.createElement("div");
        heading.className = "domain-heading";
        heading.textContent = domain;
        container.appendChild(heading);

        grouped[domain].forEach((tab) => {

            const row = document.createElement("div");
            row.className = "tab-row";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "tab-checkbox";
            checkbox.checked = true;
            checkbox.dataset.url = tab.url;
            checkbox.addEventListener("click", (e) => {
                e.stopPropagation();
            });

          const favicon = document.createElement("img");
          favicon.className = "tab-favicon";
          favicon.src = tab.favIconUrl || "";
          favicon.alt = "";

            const title = document.createElement("span");
          title.className = "tab-title";
            title.textContent = tab.title;

            const closeBtn = document.createElement("button");
          closeBtn.textContent = "×";
            closeBtn.className = "tab-close-btn";
          closeBtn.type = "button";

            closeBtn.addEventListener("click", (e) => {

                e.stopPropagation();
                chrome.tabs.remove(tab.id, () => {
                    loadTabs();
                });
            });

            row.addEventListener("click", () => {
                chrome.tabs.update(tab.id, { active: true });
                chrome.windows.update(tab.windowId, { focused: true });
            });

            row.appendChild(checkbox);
            row.appendChild(favicon);
            row.appendChild(title);
            row.appendChild(closeBtn);
         
            container.appendChild(row);
        });

    });
}

function loadTabs(){
  chrome.tabs.query({ currentWindow: true }, renderTabs);
}

document.getElementById("search").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();

  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const filtered = tabs.filter((tab) =>
      (tab.title || "").toLowerCase().includes(query) ||
      (tab.url || "").toLowerCase().includes(query)
    );
    renderTabs(filtered);
  });
});

// Save current tabs as a named session
document.getElementById("save-session").addEventListener("click", () => {
  const nameInput = document.getElementById("session-name");
  const sessionName = nameInput.value.trim();

  if (!sessionName) return; // don't save unnamed sessions

  const urls = Array.from(document.querySelectorAll(".tab-checkbox:checked"))
    .map((checkbox) => checkbox.dataset.url);

  if (!urls.length) return;

  chrome.storage.local.get({ sessions: {} }, (data) => {
    data.sessions[sessionName] = urls;
    chrome.storage.local.set({ sessions: data.sessions }, () => {
      nameInput.value = ""; // clear input
      loadSessions(); // refresh the saved-sessions list
    });
  });
});

// Render the list of saved sessions
function loadSessions() {
  chrome.storage.local.get({ sessions: {} }, (data) => {
    const container = document.getElementById("session-list");
    container.innerHTML = "";

    Object.keys(data.sessions).forEach((name) => {
      const urls = data.sessions[name];
      const row = document.createElement("div");
      row.className = "session-row";

      const header = document.createElement("div");
      header.className = "session-header";

      const label = document.createElement("span");
      label.className = "session-name";
      label.textContent = `${name} (${urls.length} tabs)`;

      const actions = document.createElement("div");
      actions.className = "session-actions";

      const restoreBtn = document.createElement("button");
      restoreBtn.textContent = "Restore";
      restoreBtn.className = "restore-session";
      restoreBtn.addEventListener("click", () => {
        urls.forEach((url) => chrome.tabs.create({ url }));
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "delete-session";
      deleteBtn.addEventListener("click", () => {
        const savedUrls = data.sessions[name];
        delete data.sessions[name];

        chrome.storage.local.set({ sessions: data.sessions }, () => {
          chrome.tabs.query({ currentWindow: true }, (tabs) => {
            const matchingTabIds = tabs
              .filter((tab) => savedUrls.includes(tab.url))
              .map((tab) => tab.id);

            const refreshLists = () => {
              loadSessions();
              loadTabs();
            };

            if (matchingTabIds.length) {
              chrome.tabs.remove(matchingTabIds, refreshLists);
            } else {
              refreshLists();
            }
          });
        });
      });

      actions.appendChild(restoreBtn);
      actions.appendChild(deleteBtn);
      header.appendChild(label);
      header.appendChild(actions);
      row.appendChild(header);

      const urlList = document.createElement("div");
      urlList.className = "session-url-list";

      urls.forEach((url, index) => {
        const urlRow = document.createElement("div");
        urlRow.className = "session-url-row";

        const urlLabel = document.createElement("span");
        urlLabel.textContent = getDomain(url) || url;
        urlLabel.title = url;

        urlRow.addEventListener("click", () => {
          chrome.tabs.create({ url });
        });

        const removeUrlBtn = document.createElement("button");
        removeUrlBtn.type = "button";
        removeUrlBtn.className = "remove-url-btn";
        removeUrlBtn.textContent = "×";
        removeUrlBtn.setAttribute("aria-label", `Remove ${url}`);
        removeUrlBtn.addEventListener("click", (e) => {
          e.stopPropagation();

          chrome.storage.local.get({ sessions: {} }, (latestData) => {
            const sessionUrls = latestData.sessions[name] || [];
            sessionUrls.splice(index, 1);

            if (sessionUrls.length) {
              latestData.sessions[name] = sessionUrls;
            } else {
              delete latestData.sessions[name];
            }

            chrome.storage.local.set(
              { sessions: latestData.sessions },
              () => {
                chrome.tabs.query({ currentWindow: true }, (tabs) => {
                  const matchingTabIds = tabs
                    .filter((tab) => tab.url === url)
                    .map((tab) => tab.id);

                  const refreshLists = () => {
                    loadSessions();
                    loadTabs();
                  };

                  if (matchingTabIds.length) {
                    chrome.tabs.remove(matchingTabIds, refreshLists);
                  } else {
                    refreshLists();
                  }
                });
              }
            );
          });
        });

        urlRow.appendChild(urlLabel);
        urlRow.appendChild(removeUrlBtn);
        urlList.appendChild(urlRow);
      });

      row.appendChild(urlList);
      container.appendChild(row);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTabs();
  loadSessions();
});

