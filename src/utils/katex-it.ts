import katex, { type KatexOptions } from 'katex';
import { type PluginWithOptions } from 'markdown-it';
const KatexIt: PluginWithOptions<KatexOptions> = (md, userOptions) => {
  const options = userOptions ?? {};

  md.inline.ruler.push('math', (state, silent) => {
    if (state.src[state.pos] !== '$') {
      return false;
    }
    if (silent) {
      return true;
    }
    const nextChar = state.src.slice(state.pos + 1, state.pos + 2);
    const mark = nextChar === '$' ? '$$' : '$';
    const d = mark.length;
    for (let pos = state.pos + d; pos < state.posMax; pos++) {
      if (state.src.slice(pos, pos + d) === mark) {
        const content = state.src.slice(state.pos + d, pos);
        const type = mark === '$$' ? 'math_block' : 'math_inline';
        const token = state.push(type, 'math', 0);
        token.markup = mark;
        token.content = content.trim();
        state.pos = pos + d;
        return true;
      } else if (state.src[pos] === '\n') {
        return false;
      } else if (state.src[pos] === '\\') {
        pos++;
      }
    }
    return false;
  });

  md.renderer.rules.math_inline = (tokens, idx) => {
    try {
      return katex.renderToString(tokens[idx].content, {
        ...options,
        displayMode: false,
      });
    } catch (e) {
      if (e instanceof katex.ParseError) {
        return `<span class="katex-error" title="${e.message}">${e.message}</span>`;
      }
      return `<span class="katex-error" title="KaTeX Error">KaTeX Error</span>`;
    }
  };

  md.renderer.rules.math_block = (tokens, idx) => {
    try {
      return `<p>${katex.renderToString(tokens[idx].content, {
        ...options,
        displayMode: true,
      })}</p>\n`;
    }
    catch (e) {
      if (e instanceof katex.ParseError) {
        return `<p><span class="katex-error" title="${e.message}">${e.message}</span></p>\n`;
      }
      return `<p><span class="katex-error" title="KaTeX Error">KaTeX Error</span></p>\n`;
    }
  };
};

export default KatexIt;
