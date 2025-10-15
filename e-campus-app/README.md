# E-Campus - Campus Marketplace Website

A modern, responsive campus marketplace built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit **http://localhost:5173/** to view the app.

## 📋 Features

### 🏪 Marketplace
- Browse student-to-student items
- Category filtering (Textbooks, Electronics, Furniture, Fashion)
- Advanced search functionality
- Product details with image gallery
- Direct seller contact (WhatsApp, Phone, Email)
- Native ad integration

### 🛍️ Official Store
- Campus merchandise and essentials
- Exclusive branded products
- Featured promotions
- Seamless shopping experience

### 📱 Responsive Design
- **Mobile-first** approach
- Hamburger menu for mobile navigation
- Sticky sidebar on desktop
- Touch-optimized controls
- Responsive grid layouts

### 🎨 User Experience
- Smooth animations and transitions
- Keyboard navigation support
- Modal image gallery with thumbnails
- Tab-based navigation
- Loading states and hover effects

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PostCSS** - CSS processing

## 📦 Project Structure

```
e-campus-app/
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.css        # Global styles and animations
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
```

## 🎯 Key Components

### Navigation
- Sticky header with announcement bar
- Desktop menu with "NEW" badge animation
- Mobile hamburger menu
- Smooth tab switching

### Product Cards
- Image display with emoji placeholders
- Price and condition badges
- Category tags
- "View Details" buttons
- Click to open modal

### Product Modal
- Full-screen overlay
- Image gallery with navigation
- Thumbnail strip
- Product information
- Contact options
- Keyboard controls (ESC, Arrow keys)

### Sidebar (Desktop Only)
- Official store promotion
- Advertisement cards
- Sticky positioning

## 🎨 Color Palette

- **Primary Blue**: `#2563eb` - `#1d4ed8`
- **Orange**: `#f97316` - `#ea580c`
- **Success Green**: `#22c55e` - `#16a34a`
- **Warning Yellow**: `#fef3c7` - `#ca8a04`
- **Neutral Gray**: `#f9fafb` - `#1f2937`

## ⌨️ Keyboard Shortcuts

When modal is open:
- `ESC` - Close modal
- `←` - Previous image
- `→` - Next image

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Configuration

The project uses:
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom animations
- **PostCSS** with Tailwind and Autoprefixer plugins

## 📄 Sample Data

The app includes sample data for demonstration:
- 4 Categories
- 6 Marketplace listings
- 4 Official store products
- 3 Native advertisements

## 🚀 Deployment

Build the app for production:

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## 📝 Notes

- Uses `--legacy-peer-deps` flag for npm install due to dependency version conflicts
- Emoji images used as placeholders (replace with real images in production)
- Contact information is sample data only

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your campus marketplace needs!

## 📄 License

MIT License - feel free to use this project as a template for your own campus marketplace.

---

**Built with ❤️ for campus communities**
