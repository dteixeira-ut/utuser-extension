# utuser-extension
Provides easy access to the utUser object on app.user.testing.

On supported participant completion pages, the extension automatically shows a
**Retake as fresh participant** card. The invite is identified from the referrer,
from invites recorded when you visited `/se/invite/<audienceId>`, or from the
`sr-dedup-<audienceId>-u` cookies on the page; when more than one candidate
exists the card offers a picker. It clears only the selected test's participant
cookie, creates a new tracking ID, and opens the same invite again. Nothing
appears when no invite can be identified, and the card reports the failure
instead of navigating when the cookie cannot be cleared. Supported participant
hosts are development-use2, staging-use2, and use2.

# How to install

Copy the extension files to a directory of your choice, or you could use the directory of where you cloned it to. head on over to chrome://extensions. After you will need to turn the developer mode on as this is a private extension. After turning on the developer mode you will have the option to load unpacked extensions, simply click on the load unpacked and load up the directory where the extension lives. A UserTesting icon should show under the extensions icon list named Insights Utils.
