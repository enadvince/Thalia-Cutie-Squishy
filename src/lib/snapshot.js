const dataUrls = new Map()
async function toDataUrl(href) {
  if (!dataUrls.has(href)) {
    const blob = await (await fetch(href)).blob()
    const url = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
    dataUrls.set(href, url)
  }
  return dataUrls.get(href)
}

// Renders a React <svg> element to an image (for WebGL textures).
// Images inside it (stickers) are inlined, because an SVG used as an image can't load files.
export async function svgToImage(element, size) {
  // Loaded on demand: only Step 4 needs it, so the rest of the app stays small.
  const { renderToStaticMarkup } = await import('react-dom/server')
  let markup = renderToStaticMarkup(element)
  const hrefs = new Set([...markup.matchAll(/href="([^"#][^"]*)"/g)].map((m) => m[1]).filter((h) => !h.startsWith('data:')))
  for (const href of hrefs) markup = markup.replaceAll(`href="${href}"`, `href="${await toDataUrl(href)}"`)
  markup = markup.replace('<svg', `<svg width="${size}" height="${size}"`)
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  await img.decode()
  return img
}
