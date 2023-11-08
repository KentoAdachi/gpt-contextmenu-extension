document.addEventListener("DOMContentLoaded", function () {
  console.log("hyouzi");
  // 保存されたAPIキーとGPTのバージョンを読み込む
  chrome.storage.local.get(["apiKey", "gptVersion"], function (data) {
    console.log("get");
    if (data.apiKey) {
      document.getElementById("apiKey").value = data.apiKey;
    }
    if (data.gptVersion) {
      document.getElementById("gptVersion").value = data.gptVersion;
    } else {
      document.getElementById("gptVersion").value = "gpt-3.5-turbo"; // デフォルト値
    }
  });

  // Saveボタンにクリックイベントを追加
  document.getElementById("saveButton").addEventListener("click", function () {
    console.log("Button clicked");
    // テキストボックスからAPIキーを読み取る
    const apiKey = document.getElementById("apiKey").value;
    // セレクトボックスからGPTのバージョンを読み取る
    const gptVersion = document.getElementById("gptVersion").value;

    // APIキーとGPTのバージョンをストレージに保存
    chrome.storage.local.set(
      { apiKey: apiKey, gptVersion: gptVersion },
      function () {
        alert("Settings saved.");
      }
    );
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const saveButton = document.getElementById("savePrompt");
  const contextMenuNameInput = document.getElementById("contextMenuName");
  const promptInput = document.getElementById("prompt");

  function populateTable(items) {
    if (!items) {
      return;
    }
    const tableBody = document
      .getElementById("menu-table")
      .getElementsByTagName("tbody")[0];

    items.forEach((item) => {
      const row = document.createElement("tr");
      const contextMenuCell = document.createElement("td");
      contextMenuCell.textContent = item.contextMenuName;
      const promptCell = document.createElement("td");
      promptCell.textContent = item.prompt;

      row.appendChild(contextMenuCell);
      row.appendChild(promptCell);

      tableBody.appendChild(row);
    });
  }

  chrome.storage.local.get(["contextMenuItems"], function (data) {
    populateTable(data.contextMenuItems);
  });

  saveButton.addEventListener("click", function () {
    // 入力された値を取得
    const newItem = {
      contextMenuName: contextMenuNameInput.value,
      prompt: promptInput.value,
    };

    // 既存のアイテムを取得して新しいアイテムを追加
    chrome.storage.local.get(["contextMenuItems"], function (data) {
      var contextMenuItems = data.contextMenuItems;
      if (!contextMenuItems) {
        contextMenuItems = [];
      }
      contextMenuItems.push(newItem);

      // 更新されたリストを保存
      chrome.storage.local.set(
        { contextMenuItems: contextMenuItems },
        function () {
          if (chrome.runtime.lastError) {
            console.error(
              "Error saving to storage: " + chrome.runtime.lastError.message
            );
          } else {
            console.log("New context menu item added.");
            // フィールドをクリア
            contextMenuNameInput.value = "";
            promptInput.value = "";
          }
        }
      );
    });
  });
});
