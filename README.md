# Daiso Damage & Lost Report (DLR) Web Dashboard

A modern, production-grade web dashboard built for Daiso operations and inventory loss auditing.

## Tech Stack
- **Framework**: [Vite](https://vite.dev) + [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Backend & Database**: [Supabase](https://supabase.com)
- **Excel Export**: [SheetJS (xlsx)](https://docs.sheetjs.com)
- **Icons**: [Lucide React](https://lucide.dev)

---

## Deploying to Vercel

### Option 1: Vercel Web Dashboard (Recommended)

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Vercel will automatically detect **Vite** as the framework preset.
4. Under **Environment Variables**, add the following:
   - `VITE_SUPABASE_URL`: `https://dxncgchzwmfbbgqpnurq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_HU1x_bM4RBTrZpdplO061A_KjFGrSmD`
5. Click **Deploy**.

---

### Option 2: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Deploy to preview
vercel

# 3. Deploy to production
vercel --prod
```

When prompted, link your project and add the environment variables in the project settings.

---

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Build for production
npm run build
```

---

## Key Features

- **Store Code to Store Name Resolution**: Lookup against `data/store.js` directory with store isolation.
- **Strict Department Mapping**: Direct Supabase code parsing (`100` $\rightarrow$ Fashion, `150` $\rightarrow$ Outdoor & GMS, `200` $\rightarrow$ Food & DIY, `250` $\rightarrow$ Houseware, `300` $\rightarrow$ Cleaning, others $\rightarrow$ Unknown).
- **Sub Department Support**: Displays and exports sub-department labels (e.g. `210 · Stationery`).
- **Live Summary Metrics**: Real-time Total Records, Total Quantity $\sum(\text{Qty})$, and Total Loss $\sum(\text{Cost} \times \text{Qty})$ in Philippine Peso ($\text{PHP}$).
- **Image Evidence Slotting**: Displays Quantity, Damage, and Barcode photos with one-click copy links and lightbox modal.
- **Instant Excel (.xlsx) Export**: Exports visible and filtered records with dedicated image URL columns and formatted filenames.
