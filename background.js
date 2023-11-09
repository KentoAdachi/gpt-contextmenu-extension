// コンテキストメニュー表示名とプロンプトの配列
const defaultContextMenuItems = [
  {
    contextMenuName: "日本語に翻訳する",
    prompt: "Translate the following English text to Japanese:",
  },
  {
    contextMenuName: "レビューする",
    prompt: "コードをレビューして、改善点を簡潔にまとめてください。",
  },
  {
    contextMenuName: "コードの説明",
    prompt: "簡潔にコードの説明をしてください。",
  },
];

// chrome.storage.localに保存されたユーザー設定のコンテキストメニューを取得する
async function fetchUserContextMenuItems() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["contextMenuItems"], function (data) {
      resolve(data.contextMenuItems);
    });
  });
}

// chrome.storage.localに保存された設定を取得する
async function fetchOptions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiKey", "gptVersion"], function (data) {
      resolve(data);
    });
  });
}

// chatGPT API
async function getChatGPTResponse(
  API_KEY,
  systemPrompt,
  userText,
  gptVersion = "gpt-3.5-turbo"
) {
  const URL = "https://api.openai.com/v1/chat/completions";
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: gptVersion,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error("API call failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Context Menu
async function handleContextMenuClick(info, tab) {
  // ユーザー設定のコンテキストメニューを取得する
  const userContextMenuItems = await fetchUserContextMenuItems();

  // デフォルトのコンテキストメニューとユーザー設定のコンテキストメニューを結合する
  const contextMenuItems = defaultContextMenuItems.concat(userContextMenuItems);

  // idに対応したプロンプトをセットする、セットできない場合はreturn
  const systemPrompt = contextMenuItems[Number(info.menuItemId)]?.prompt;
  if (!systemPrompt) {
    return;
  }
  const selectedText = info.selectionText;
  console.log("selectedText:", selectedText);
  console.log("systemPrompt:", systemPrompt);

  // chrome.storage.localに保存された設定を取得する
  const { apiKey, gptVersion } = await fetchOptions();

  // もしAPIキーが設定されていない場合は、オプションページを開く
  if (!apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }

  try {
    const responseText = await getChatGPTResponse(
      apiKey,
      systemPrompt,
      selectedText,
      gptVersion
    );

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showAlert,
      args: [responseText],
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function showAlert(responseText) {
  window.alert(responseText);
}

async function updateContextMenu() {
  defaultContextMenuItems.forEach((item, index) => {
    chrome.contextMenus.create({
      id: index.toString(),
      title: item.contextMenuName,
      contexts: ["selection"],
    });
  });

  // chrome.storage.localに保存されたユーザー設定のコンテキストメニューを取得する
  const userContextMenuItems = await fetchUserContextMenuItems();
  if (userContextMenuItems) {
    userContextMenuItems.forEach((item, index) => {
      chrome.contextMenus.create({
        id: (index + defaultContextMenuItems.length).toString(),
        title: item.contextMenuName,
        contexts: ["selection"],
      });
    });
  }
}

console.log("background.js");
chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled....");
  updateContextMenu();
});

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
