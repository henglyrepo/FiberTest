# FiberTest - Fast & Free Internet Speed Test

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)](https://tailwindcss.com/)

A lightweight, free and open-source **internet speed test** web application built with Next.js. Test your **download speed**, **upload speed**, **ping**, and **jitter** - completely free, no registration required.

> **Fast, accurate, and private** - Measure your network bandwidth in seconds with our HTML5-based speed test.

##

![FiberTest Speed Test](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=FiberTest+-+Internet+Speed+Test)

## Features

- ⚡ **Download Speed Test** - Measure your download bandwidth in Mbps
- 📤 **Upload Speed Test** - Measure your upload bandwidth in Mbps
- 🏓 **Ping Test** - Check your network latency in milliseconds
- 📊 **Jitter Test** - Measure connection stability
- 🌐 **ISP Detection** - Automatic IP, location, and ISP identification
- 📱 **Mobile Responsive** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean, dark-themed interface with animated gauge
- 🔒 **Privacy First** - No data collection, no registration

## Live Demo

**[Speed Test Demo](https://your-domain.vercel.app)** - Deploy to Vercel and add your URL

## Quick Start

```bash
# Clone the repository
git clone https://github.com/henglyrepo/FiberTest.git
cd FiberTest

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to run a speed test.

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## How It Works

FiberTest measures your internet connection speed using the following methods:

1. **Ping Test**: Sends multiple HTTP HEAD requests to measure latency
2. **Download Test**: Downloads data from multiple CDN endpoints simultaneously to measure bandwidth
3. **Upload Test**: Uploads random data to measure upload throughput
4. **Jitter Calculation**: Analyzes ping variations to determine connection stability

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework for production
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icons
- **Charts**: [Recharts](https://recharts.org/) - Chart library (optional)

## API Endpoints Used

| Service | Purpose | URL |
|---------|---------|-----|
| Cloudflare | Download speed test | speed.cloudflare.com |
| Hetzner | Alternative download | speed.hetzner.de |
| OVH | Alternative download | proof.ovh.net |
| ipapi.co | IP & ISP detection | ipapi.co/json |

## Project Structure

```
FiberTest/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main speed test page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── SpeedGauge.tsx    # Animated speed gauge
│   │   └── ServerInfo.tsx    # ISP information display
│   └── hooks/
│       └── useSpeedTest.ts   # Speed test logic
├── public/                   # Static assets
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Deployment to Vercel

The easiest way to deploy FiberTest is using [Vercel](https://vercel.com):

1. Fork or clone this repository
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

That's it! Your speed test will be live in minutes.

## Configuration

### Adding Custom CDN Endpoints

Edit `src/hooks/useSpeedTest.ts` to add custom test servers:

```typescript
const CDN_ENDPOINTS = [
  "https://your-cdn.com/__down?bytes=10000000",
  // Add more endpoints...
];
```

### Adding Custom Upload Endpoints

```typescript
const UPLOAD_ENDPOINTS = [
  "https://your-upload-server.com/upload",
  // Add more endpoints...
];
```

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenSpeedTest](https://openspeedtest.com/) - Inspiration for speed test implementation
- [LibreSpeed](https://librespeed.org/) - Open source speed test project
- [Cloudflare](https://www.cloudflare.com/) - CDN for speed testing
- [Next.js Team](https://nextjs.org/) - Amazing framework

## Related Projects

- [OpenSpeedTest](https://github.com/openspeedtest/Speed-Test) - Free & Open-Source HTML5 Speed Test
- [LibreSpeed](https://github.com/librespeed/speedtest) - Self-hosted Speed Test
- [speedtest-cli](https://github.com/sivel/speedtest-cli) - Command line speed test

## Keywords

internet speed test, speed test, download speed, upload speed, bandwidth test, network speed test, ping test, latency, jitter, Mbps, free speed test, open source speed test, HTML5 speed test, self-hosted speed test, Next.js speed test, React speed test

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Built with ❤️ using Next.js

</div>
