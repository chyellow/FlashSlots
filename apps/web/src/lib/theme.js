const storageKey = "vite-ui-theme"

export function getTheme() {
  const saved = localStorage.getItem(storageKey)
  if (saved === "dark" || saved === "light") return saved
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
  localStorage.setItem(storageKey, theme)
}
