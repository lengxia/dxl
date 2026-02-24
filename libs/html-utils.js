/**
 * HTML 工具函数
 * 提供 HTML 实体转义、纯文本提取等功能
 */

/**
 * HTML 反转义
 * 将 HTML 实体（&lt;, &gt;, &amp; 等）转换回正常字符
 * @param {string} str - 包含 HTML 实体的字符串
 * @returns {string} - 反转义后的字符串
 */
export function unescapeHtml(str) {
  if (!str) return ''
  
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * 从富文本 HTML 中提取纯文本
 * @param {string} html - HTML 字符串
 * @returns {string} - 提取的纯文本
 */
export function getPlainText(html) {
  if (!html) return ''
  
  // 先反转义 HTML 实体
  html = unescapeHtml(html)
  
  // 移除 HTML 标签
  let text = html.replace(/<[^>]+>/g, '')
  
  // 移除多余空白
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

/**
 * 格式化富文本内容用于预览
 * 限制长度并添加省略号
 * @param {string} html - HTML 字符串
 * @param {number} maxLength - 最大长度，默认 100
 * @returns {string} - 格式化后的文本
 */
export function formatPreviewText(html, maxLength = 100) {
  const text = getPlainText(html)
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}