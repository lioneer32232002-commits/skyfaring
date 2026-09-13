export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

// contentHtml 裡常見的 HTML entity，來源是 remark/rehype 的字元跳脫
// （中文與一般標點不會被跳脫，只有這幾個保留字元會）。
const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeEntities(text: string): string {
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITY_MAP[m]);
}

/**
 * 從文章的 contentHtml（remark → rehype-slug → rehype-stringify 產生）
 * 抓出 `<h2 id="…">`／`<h3 id="…">` 當作本文目錄的資料來源。
 *
 * - 只認帶 id 的 h2/h3（rehype-slug 會幫每個標題加 id，理論上不會有例外）。
 * - 標題內文字先去掉內層標籤（例如 `<code>`、`<a>`），再解碼常見 HTML entity。
 * - 純函式，不碰 DOM，可以在 server 端與測試裡直接呼叫。
 */
export function extractHeadings(html: string): Heading[] {
  const headingRegex = /<h([23])[^>]*\sid="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g;
  const headings: Heading[] = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null) {
    const [, levelStr, id, innerHtml] = match;
    if (!id) continue;

    const text = decodeEntities(innerHtml.replace(/<[^>]+>/g, "")).trim();
    if (!text) continue;

    headings.push({
      id,
      text,
      level: levelStr === "3" ? 3 : 2,
    });
  }

  return headings;
}
