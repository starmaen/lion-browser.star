chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchWithLion",
    title: "Search with Lion Browser",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchWithLion") {
    const query = encodeURIComponent(info.selectionText);
    chrome.tabs.create({
      url: `https://www.google.com/search?q=${query}`
    });
  }
});
