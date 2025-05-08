(function () {
  if (document.getElementById("ut-user-details-pop-up")) return;

  const style = document.createElement("style");
  style.textContent = `
    .ut-user-details {
      position: fixed;
      top: 10px;
      right: 20px;
      background: #fff;
      color: #333;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 1px 10px rgba(0,0,0,0.3);
      z-index: 10000;
      transition: opacity 0.3s ease;
      text-align: center;
    }
    .ut-user-details h2 {
      margin: 0 0 10px; color: #4285f4;
    }
    .ut-user-details button {
      margin-top: 15px;
      padding: 8px 16px;
      border: none;
      border-radius: 10px;
      background: #305CFD;
      color: #fff;
      cursor: pointer;
      font-weight: bold;
    }
    .ut-user-details pre {
      text-align: left;
      white-space: pre-wrap;
      margin-top: 10px;
      font-size: 14px;
    }

    .details {
      font-weight: bold;
    }
    
    #user, #workspace, #account {
      display: block;
      padding: 2px 10px;
      font-weight: normal;
    }

    #user:hover, #workspace:hover, #account:hover {
      background-color: #f7f7f7;
      cursor: pointer;
    }

    .copyable {
      position: relative; 
    }
    .copy-popup {
      position: absolute;
      left: 50%;           
      transform: translateX(-50%);
      bottom: 100%;      

      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      opacity: 1;
      transition: opacity 0.5s ease-out;
      pointer-events: none;
    }
    .copy-popup.fade-out {
      opacity: 0;
    }

    #close-popup:hover {
      background-color: #0014cd
    }
  `;
  document.head.appendChild(style);

  const html = `
    <div class="ut-user-details" id="ut-user-details-pop-up">
      <div id="results"></div>
      <button id="close-popup">Close</button>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  const out = document.getElementById("results");
  if (window.utUser) {
    const userDiv = document.createElement("div");
    const userP = document.createElement("p");
    userP.className = "details";
    userP.appendChild(document.createTextNode("Current user: "));

    const userId = document.createElement("span");
    userId.id = "user";
    userId.textContent = window.utUser.current_user_uuid;

    userP.appendChild(userId);
    userDiv.appendChild(userP);
    out.appendChild(userDiv);

    const workspaceDiv = document.createElement("div");
    const workspaceP = document.createElement("p");
    workspaceP.className = "details";
    workspaceP.appendChild(document.createTextNode(`Current workspace: `));

    const workspaceId = document.createElement("span");
    workspaceId.id = "workspace";
    workspaceId.textContent = window.utUser.current_workspace_uuid;

    workspaceP.appendChild(workspaceId);
    workspaceDiv.appendChild(workspaceP);
    out.appendChild(workspaceDiv);

    const accountDiv = document.createElement("div");
    const accountP = document.createElement("p");
    accountP.className = "details";
    accountP.appendChild(document.createTextNode(`Current account: `));

    const accountId = document.createElement("span");
    accountId.id = "account";
    accountId.textContent = window.utUser.current_account_uuid;

    accountP.appendChild(accountId);
    accountDiv.appendChild(accountP);
    out.appendChild(accountDiv);

    function showCopiedPopup(message, visibleMs, event) {
      const targetEl = event.target;
      targetEl.classList.add("copyable");

      const popup = document.createElement("div");
      popup.className = "copy-popup";
      popup.textContent = message;
      targetEl.appendChild(popup);

      setTimeout(() => popup.classList.add("fade-out"), visibleMs);
      setTimeout(() => {
        popup.remove();
        targetEl.classList.remove("copyable");
      }, visibleMs + 500);
    }

    const ids = [
      document.getElementById("user"),
      document.getElementById("workspace"),
      document.getElementById("account"),
    ];
    ids.forEach((id) => {
      id.addEventListener("click", (event) => {
        navigator.clipboard
          .writeText(event.target.textContent)
          .then(() => showCopiedPopup("Copied!", 1000, event));
      });
    });
  } else {
    out.textContent = "No utUser found on window.";
  }

  document.getElementById("close-popup").addEventListener("click", () => {
    const popup = document.getElementById("ut-user-details-pop-up");
    popup.style.opacity = "0";
    setTimeout(() => {
      style.remove();
      popup.remove();
    }, 300);
  });
})();
