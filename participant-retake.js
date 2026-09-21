(function () {
  const cardId = "ut-participant-retake-card";
  const invitePathPattern = /\/se\/invite\/([0-9a-f-]+)/i;
  const participantCookiePattern = /^sr-dedup-([0-9a-f-]+)-u$/i;

  if (document.getElementById(cardId)) return;

  const audienceIdFromReferrer = (() => {
    if (!document.referrer) return undefined;

    const referrerUrl = new URL(document.referrer);
    return referrerUrl.origin === window.location.origin
      ? referrerUrl.pathname.match(invitePathPattern)?.[1]
      : undefined;
  })();
  const audienceIdsFromCookies = document.cookie
    .split("; ")
    .map((cookie) => cookie.split("=", 1)[0])
    .map((cookieName) => cookieName.match(participantCookiePattern)?.[1])
    .filter(Boolean);
  const audienceId =
    audienceIdFromReferrer ??
    (audienceIdsFromCookies.length === 1 ? audienceIdsFromCookies[0] : undefined);

  // Do not show anything unless this outcome can be tied to exactly one test.
  if (!audienceId) return;

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
  const retakeButton = document.createElement("button");
  retakeButton.type = "button";
  retakeButton.textContent = "Retake as fresh participant";
  retakeButton.addEventListener("click", () => {
    retakeButton.disabled = true;
    retakeButton.textContent = "Starting fresh participant…";

    const cookieName = `sr-dedup-${audienceId}-u`;
    document.cookie = `${cookieName}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

    const inviteUrl = new URL(`/se/invite/${audienceId}`, window.location.origin);
    inviteUrl.searchParams.set("trackingId", crypto.randomUUID());
    window.location.replace(inviteUrl.href);
  });
  card.append(description, retakeButton);
  document.body.appendChild(card);
})();
