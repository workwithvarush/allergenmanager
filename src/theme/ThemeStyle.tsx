import { themes, tokens } from "./tokens";

function declarations(entries: Record<string, string>): string {
  return Object.entries(entries)
    .map(([name, value]) => `--${name}:${value};`)
    .join("");
}

const css = [
  `:root{${declarations(tokens)}}`,
  ...Object.entries(themes).map(
    ([name, overrides]) => `:root[data-theme="${name}"]{${declarations(overrides)}}`,
  ),
].join("\n");

/** Emits every token as a CSS custom property. Render once, inside <head>. */
export function ThemeStyle() {
  return <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: css }} />;
}
