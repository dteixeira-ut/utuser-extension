(function () {
  const invitePathPattern = /^\/se\/invite\/([0-9a-f-]{36})/i;
  const storageKey = "ut-retake-recent-invites";
  const maxRecorded = 10;

  const audienceId = window.location.pathname.match(invitePathPattern)?.[1];
  if (!audienceId) return;

  const readEntries = (store) => {
    try {
      const parsed = JSON.parse(store.getItem(storageKey) ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  [window.sessionStorage, window.localStorage].forEach((store) => {
    const entries = readEntries(store).filter((entry) => entry?.audienceId !== audienceId);
    entries.unshift({ audienceId, at: Date.now() });
    try {
      store.setItem(storageKey, JSON.stringify(entries.slice(0, maxRecorded)));
    } catch {}
  });
})();
