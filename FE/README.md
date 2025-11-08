# Social Media Frontend

A modern social media application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 📱 **Responsive Design**: Mobile-first approach with Facebook-like UI
- 🎨 **Modern UI**: Clean and intuitive interface
- ⚡ **Fast Performance**: Optimized with Next.js 14
- 🔒 **Type Safety**: Full TypeScript support
- 📱 **Mobile Navigation**: Bottom navigation bar for mobile devices
- 🎯 **Touch Friendly**: Optimized for touch interactions

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Linting**: ESLint

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd social-media-fe
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration.

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js 14 App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   ├── page.tsx        # Home page
│   └── [routes]/       # Route pages
├── components/          # Reusable components
│   ├── CreatePosts.tsx
│   ├── Feed.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── lib/                # Utility functions
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Responsive Design

The application features a responsive design that adapts to different screen sizes:

- **Desktop (1024px+)**: Full sidebar navigation
- **Tablet (768px-1023px)**: Optimized layout
- **Mobile (<768px)**: Bottom navigation bar with Facebook-like UI

## Key Features

### Mobile Navigation

- Bottom navigation bar with 5 main sections
- Touch-friendly targets (44px minimum)
- Active state indicators
- Notification badges with animations

### Desktop Experience

- Full sidebar with user profile
- Complete navigation menu
- Traditional desktop layout

### Performance Optimizations

- Next.js Image component for optimized images
- Lazy loading
- Smooth animations
- Efficient re-renders

## Development

### Code Style

- ESLint configuration for code quality
- TypeScript for type safety
- Prettier for code formatting (recommended)

### Adding New Features

1. Create components in `src/components/`
2. Add types in `src/types/`
3. Create API services in `src/services/`
4. Add pages in `src/app/`

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms

1. Build the project: `npm run build`
2. Start production server: `npm run start`
3. Configure your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
