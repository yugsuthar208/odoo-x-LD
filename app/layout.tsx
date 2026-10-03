import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Commons — Your campus, in sync",
  description: "A connected home for campus clubs, events, volunteering and student life.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  if (typeof window === 'undefined') return;
  try {
    var ce = console.error;
    console.error = function() {
      var msg = '';
      for (var i = 0; i < arguments.length; i++) {
        msg += ' ' + String(arguments[i]);
      }
      if (msg.indexOf('bis_skin_checked') !== -1 || msg.indexOf('bis_') !== -1) {
        return;
      }
      return ce.apply(console, arguments);
    };
    var origSet = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, val) {
      if (name && name.indexOf('bis_') === 0) return;
      return origSet.apply(this, arguments);
    };
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === 'attributes' && m.attributeName && m.attributeName.indexOf('bis_') === 0) {
            m.target.removeAttribute(m.attributeName);
          }
        }
      }).observe(document.documentElement, { attributes: true, subtree: true });
    }
  } catch(e) {}
})();
`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
