export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```[span_3](start_span)[span_3](end_span)

And here is **`components.json`** on its own so you can create it as its own separate file in your repository root[span_4](start_span)[span_4](end_span):

### `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```[span_5](start_span)[span_5](end_span)
