// Inline script to prevent flash of wrong theme on load.
// This is a static string with no user input — safe to inline.
/* eslint-disable react/no-danger */
const THEME_SCRIPT = [
  '(function(){',
  'try{',
  "var t=localStorage.getItem('patchlist-theme');",
  "if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))",
  "{document.documentElement.classList.add('dark')}",
  '}catch(e){}',
  '})()',
].join('')

export function ThemeScript() {
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
}
