// Converts an on-screen <svg> into a PNG file and downloads it.
// Copies the computed colors/fonts inline so CSS variables survive the export.
export function downloadSvgAsPng(svgEl, filename = "chart.png", scale = 3) {
  const clone = svgEl.cloneNode(true);
  const src = svgEl.querySelectorAll("*");
  const dst = clone.querySelectorAll("*");
  const props = [
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "font-size",
    "font-family",
    "font-weight",
    "opacity",
  ];
  src.forEach((el, i) => {
    const cs = getComputedStyle(el);
    props.forEach((p) => dst[i].style.setProperty(p, cs.getPropertyValue(p)));
  });

  const { width, height } = svgEl.viewBox.baseVal;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);

  const bg =
    getComputedStyle(document.documentElement).getPropertyValue(
      "--surface-1",
    ) || "#ffffff";
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = bg.trim();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    }, "image/png");
  };
  img.src =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(new XMLSerializer().serializeToString(clone));
}
