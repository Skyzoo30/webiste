# Trading Terminal - Forex & Crypto Live

Professional trading terminal untuk forex, CFD, dan crypto futures dengan live data real-time.

## 🚀 Deploy ke Vercel (Gratis)

### Cara 1: Deploy via GitHub (Recommended)

1. **Push ke GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/trading-terminal.git
   git push -u origin main
   ```

2. **Buka Vercel:**
   - Kunjungi https://vercel.com
   - Klik "New Project"
   - Import repository GitHub Anda
   - Klik "Deploy"
   - Website akan live dalam 2 menit!

### Cara 2: Deploy via CLI Vercel

```bash
npm i -g vercel
vercel
```

Ikuti instruksi di terminal, website akan langsung live!

### Cara 3: Deploy ke Netlify (Alternatif Gratis)

```bash
npm run build
# Drag & drop folder 'dist' ke https://app.netlify.com/drop
```

## 📋 Fitur

- ✅ **Watchlist 5 Pair Top** - EUR/USD, GBP/USD, BTC/USD, ETH/USD, SPX
- ✅ **Chart Interaktif** - Real-time price movements
- ✅ **Fear & Greed Index** - Sentiment pasar crypto
- ✅ **Market News** - Berita finansial terkini
- ✅ **Market Info** - 24h high/low/volume
- ✅ **Sistem Favorit** - Bookmark pair favorit
- ✅ **Dark Theme** - Profesional & eye-friendly

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Akses di `http://localhost:3000`

### Build Production
```bash
npm run build
```

## 📊 API Sources

- **Crypto Prices**: CoinGecko API (Free)
- **Fear & Greed Index**: Alternative.me (Free)
- **Market News**: CoinGecko News API (Free)

Semua API gratis, tidak perlu API key!

## 🌐 Live Demo

Setelah deploy ke Vercel, Anda akan mendapatkan URL seperti:
```
https://trading-terminal-abc123.vercel.app
```

## 📝 Customization

### Menambah Pair Baru
Edit `src/App.tsx` di array `DEFAULT_PAIRS`:

```typescript
{
  id: 'new-pair',
  symbol: 'NEW/USD',
  name: 'New Pair',
  type: 'crypto', // atau 'forex', 'cfd'
  price: 1000,
  // ... other fields
}
```

### Mengubah Warna
Edit `src/index.css` atau gunakan Tailwind classes di `src/App.tsx`

## 🚀 Next Steps

1. Deploy ke Vercel/Netlify
2. Bagikan URL ke teman
3. Tambahkan fitur: WebSocket real-time, advanced charts, trading alerts
4. Monetisasi dengan premium features

## 📞 Support

Jika ada error, cek:
1. Browser console (F12)
2. Vercel deployment logs
3. Network tab untuk API calls

## 📄 License

MIT - Bebas digunakan untuk personal & commercial
