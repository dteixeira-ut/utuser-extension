(function () {
  const cardId = "ut-participant-retake-card";
  const storageKey = "ut-retake-recent-invites";
  const invitePathPattern = /\/se\/invite\/([0-9a-f-]{36})/i;
  const participantCookiePattern = /^sr-dedup-([0-9a-f-]{36})-u$/i;

  if (document.getElementById(cardId)) return;

  const cookieNames = () =>
    document.cookie.split("; ").map((cookie) => cookie.split("=", 1)[0]);

  const audienceIdFromReferrer = (() => {
    if (!document.referrer) return undefined;
    try {
      const referrerUrl = new URL(document.referrer);
      return referrerUrl.origin === window.location.origin
        ? referrerUrl.pathname.match(invitePathPattern)?.[1]
        : undefined;
    } catch {
      return undefined;
    }
  })();

  const audienceIdsFromStorage = [window.sessionStorage, window.localStorage]
    .flatMap((store) => {
      try {
        const parsed = JSON.parse(store.getItem(storageKey) ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })
    .filter((entry) => typeof entry?.audienceId === "string")
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
    .map((entry) => entry.audienceId);

  const audienceIdsFromCookies = cookieNames()
    .map((cookieName) => cookieName.match(participantCookiePattern)?.[1])
    .filter(Boolean);

  const candidateIds = [
    ...new Set(
      [audienceIdFromReferrer, ...audienceIdsFromStorage, ...audienceIdsFromCookies].filter(
        Boolean,
      ),
    ),
  ];

  if (!candidateIds.length) return;

  const cookieDomains = (() => {
    const { hostname } = window.location;
    const parentDomain = hostname.split(".").slice(-2).join(".");
    return [undefined, hostname, `.${hostname}`, parentDomain, `.${parentDomain}`];
  })();

  const clearDedupCookie = (audienceId) => {
    const cookieName = `sr-dedup-${audienceId}-u`;
    const expiry = "Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    cookieDomains.forEach((domain) => {
      document.cookie = `${cookieName}=; ${expiry}; path=/${domain ? `; domain=${domain}` : ""}`;
    });
    return !cookieNames().includes(cookieName);
  };

  const style = document.createElement("style");
  style.textContent = `
    #${cardId} {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      width: 280px;
      padding: 16px;
      border: 1px solid #d0d5dd;
      border-radius: 12px;
      background: #fff;
      color: #101828;
      box-shadow: 0 8px 24px rgba(16, 24, 40, 0.16);
      font-family: Arial, sans-serif;
    }
    #${cardId} p { margin: 0 0 12px; font-size: 14px; line-height: 1.4; }
    #${cardId} p.ut-retake-error { color: #b42318; }
    #${cardId} select {
      width: 100%;
      margin-bottom: 12px;
      padding: 8px;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      font-size: 13px;
    }
    #${cardId} button {
      width: 100%;
      padding: 10px 12px;
      border: 0;
      border-radius: 8px;
      background: #305cfd;
      color: #fff;
      cursor: pointer;
      font-weight: 600;
    }
    #${cardId} button:disabled { cursor: wait; opacity: 0.75; }
  `;
  document.head.appendChild(style);

  const card = document.createElement("aside");
  card.id = cardId;

  const description = document.createElement("p");
  description.textContent = "Take this test again with a new participant.";

  const picker = document.createElement("select");
  candidateIds.forEach((candidateId) => {
    const option = document.createElement("option");
    option.value = candidateId;
    option.textContent = candidateId;
    option.title = candidateId;
    picker.appendChild(option);
  });

  const retakeButton = document.createElement("button");
  retakeButton.type = "button";
  retakeButton.textContent = "Retake as fresh participant";
  retakeButton.addEventListener("click", () => {
    const audienceId = picker.value;
    retakeButton.disabled = true;
    retakeButton.textContent = "Starting fresh participant…";

    if (!clearDedupCookie(audienceId)) {
      description.className = "ut-retake-error";
      description.textContent = `Could not clear sr-dedup-${audienceId}-u. Remove it manually, then retry.`;
      retakeButton.disabled = false;
      retakeButton.textContent = "Retake as fresh participant";
      return;
    }

    const inviteUrl = new URL(`/se/invite/${audienceId}`, window.location.origin);
    inviteUrl.searchParams.set("trackingId", crypto.randomUUID());
    window.location.replace(inviteUrl.href);
  });

  card.append(description);
  if (candidateIds.length > 1) card.append(picker);
  card.append(retakeButton);
  document.body.appendChild(card);
})();
