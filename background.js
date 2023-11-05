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
  // idごとに対応したプロンプトを用意する
  const prompts = {
    translate: "Translate the following English text to Japanese:",
    review: "コードをレビューして、改善点を簡潔にまとめてください。",
  };

  // idに対応したプロンプトをセットする、セットできない場合はreturn
  const systemPrompt = prompts[info.menuItemId];
  if (!systemPrompt) return;

  const selectedText = info.selectionText;
  console.log("selectedText:", selectedText);
  console.log("systemPrompt:", systemPrompt);
  try {
    const responseText = await getChatGPTResponse(
      "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",
      systemPrompt,
      selectedText
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

function setupContextMenu() {
  chrome.contextMenus.create({
    id: "translate",
    title: "日本語に翻訳する",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "review",
    title: "レビューする",
    contexts: ["selection"],
  });
}

console.log("background.js");
chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled....");
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
