# Deploy

Live site: https://baditaflorin.github.io/pdf-workbench/

Repository settings: https://github.com/baditaflorin/pdf-workbench/settings/pages

## Publishing

GitHub Pages serves the `main` branch from `/docs`.

```bash
npm install
make build
git add docs package.json package-lock.json src public scripts
git commit -m "feat: describe change"
git push
```

Pages normally republishes automatically after the push because the source is `main` `/docs`. No GitHub Actions are used.

## Preview

```bash
make build
make pages-preview
```

Open http://127.0.0.1:4173/pdf-workbench/

## Rollback

Revert the publishing commit and push:

```bash
git revert <commit>
git push
```

## Custom Domain

No custom domain is configured in v1. To add one later:

1. Add `public/CNAME` with the domain.
2. Configure the Pages custom domain at https://github.com/baditaflorin/pdf-workbench/settings/pages
3. Add the required DNS records at the domain provider.
4. Run `make build`, commit `docs/CNAME`, and push.

## Pages Gotchas

- The Vite base path is `/pdf-workbench/`.
- GitHub Pages does not support `_headers` or `_redirects`.
- `docs/404.html` is copied from `docs/index.html` for SPA fallback.
- The service worker scope is `/pdf-workbench/`.
