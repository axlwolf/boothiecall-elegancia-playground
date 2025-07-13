# BoothieCall Elegancia Playground

A sophisticated web-based photobooth application featuring the elegant "Elegancia Nocturna" design system. Built with React, Vite, TypeScript, and Tailwind CSS, this playground allows users to create, customize, and download professional photo strips with luxury dark aesthetics and gold accents.

## 🌟 Features

### 📸 **Photo & GIF Capture**
- **Real-time camera integration** with high-quality photo capture
- **Animated GIF creation** - captures motion during photo sessions
- **Multiple shot layouts**: 1, 3, 4, or 6 photos per strip
- **Countdown timer** with visual feedback for perfect timing
- **Auto-capture** with customizable countdown (3 seconds)
- **Retake functionality** for multiple attempts
- **Dual download options**: Photo strips (PNG) or animated GIF strips

### 🎨 **Design Customization**
- **Multiple design templates** for each layout type
- **Paginated design selection** with visual preview
- **Frame mapping system** for precise photo placement
- **Responsive design** that works on desktop and mobile
- **Smart cropping** with aspect ratio preservation

### 🎭 **Photo Filters**
- **15+ filter effects**: Noir, Vintage, Glam, Pencil Sketch, Extra Sharp, Warm, Cool, Faded, Black & White, Sepia, Brightness, Contrast, Blur, Invert, and more
- **Individual photo filtering** - apply different filters to each photo
- **"All Photos" option** - apply the same filter to all photos at once
- **Real-time preview** - see filter effects on photo thumbnails
- **Paginated filter selection** - browse through all available filters

### 🌈 **Elegancia Nocturna Design System**
- **Luxury dark theme** with sophisticated gold accents (#D8AE48)
- **Premium typography** using Cinzel (headings) and Montserrat (body)
- **Elegant cursor design** with custom golden styling
- **Gallery background collage** showcasing photo examples
- **Animated dark gradients** for premium feel
- **Sophisticated color palette** optimized for luxury aesthetics

### 🖼️ **Photo Processing**
- **Smart image cropping** with aspect ratio preservation
- **Frame overlay system** with precise positioning
- **Border radius support** for rounded photo frames
- **High-quality output** suitable for printing
- **GIF compositing** with frame overlays for animated strips

### 📱 **User Experience**
- **Beautiful landing page** with animated elements and shooting star cursor
- **Step-by-step workflow** with clear navigation
- **Responsive interface** optimized for all screen sizes
- **Interactive hover effects** and smooth transitions
- **Help system** with usage instructions
- **Pagination controls** that hide when not needed

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/axlwolf/boothiecall-elegancia-playground.git
   cd boothiecall-elegancia-playground
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173/` to access the BoothieCall Elegancia Playground

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🏗️ Project Structure

```
boothiecall-elegancia-playground/
├── public/
│   ├── favicon.ico         # App favicon
│   ├── placeholder.svg      # Placeholder image
│   └── robots.txt          # SEO robots file
├── src/
│   ├── assets/             # Static assets
│   │   └── hero-gallery.jpg # Gallery background image
│   ├── components/
│   │   ├── AppLayout.tsx       # Main layout wrapper with shooting star
│   │   ├── CameraCapture.tsx   # Camera capture logic with GIF support
│   │   ├── FilterSelection.tsx # Photo filter options with "All Photos"
│   │   ├── FinalResult.tsx     # Final photo strip display
│   │   ├── Landing.tsx         # Welcome page with animations
│   │   ├── LayoutSelection.tsx # Layout selection interface
│   │   ├── Photobooth.tsx      # Main photobooth logic
│   │   └── ui/                 # shadcn UI components
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
└── vite.config.ts         # Vite build configuration
```

## 🎯 How It Works

### 1. **Landing Page**
- Elegant BoothieCall branding with premium logo display
- Gallery background collage showcasing photo examples
- Sophisticated Elegancia Nocturna dark theme with gold accents
- Interactive hover animations with sample photo strips
- "Start Playground" button to begin the photobooth experience

### 2. **Layout Selection**
- Choose from 4 different photo strip layouts:
  - **1 Shot**: Single photo layout
  - **3 Shot**: Vertical 3-photo strip
  - **4 Shot**: Vertical 4-photo strip  
  - **6 Shot**: 2x3 grid layout
- Visual preview of each layout option
- Responsive grid layout for mobile devices

### 3. **Photo Capture**
- Camera access with real-time preview
- Countdown timer with visual feedback
- Automatic photo capture after countdown
- **GIF capture** during photo sessions for animated strips
- Progress indicator showing current photo number
- Retake option for multiple attempts
- Theme-aware camera interface

### 4. **Filter Selection**
- **15+ filter effects** with real-time preview
- **Individual photo filtering** - apply different filters to each photo
- **"All Photos" option** - apply the same filter to all photos at once
- **Paginated filter selection** - browse through all available filters
- **Smart highlighting** - shows which photos have which filters

### 5. **Design Selection**
- Multiple available design templates for each layout
- Browse through available design templates
- Paginated interface with visual preview
- Responsive grid layout
- Theme-aware design cards

### 6. **Download Options**
- **Photo Strip (PNG)**: Static photo strip with selected design
- **GIF Strip (Animated)**: Animated strip with captured GIFs
- Automatic photo positioning using frame mappings
- High-quality output suitable for printing
- Direct download to device

## 🛠️ Technical Details

### **Core Technologies**
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework with custom Elegancia Nocturna theme
- **shadcn/ui** - High-quality UI components built with Radix UI and Tailwind
- **MediaRecorder API** - For GIF capture functionality
- **gifshot** - GIF creation and compositing
- **Google Fonts** - Cinzel and Montserrat for premium typography

### **Key Dependencies**
- `gifshot` - GIF creation capabilities
- `react-router-dom` - Application routing
- `tailwindcss-animate` - Animation utilities
- `lucide-react` - Icon system
- `class-variance-authority` - Component style variants

### **Elegancia Nocturna Design System**
- **Sophisticated color palette** with luxury dark backgrounds and gold accents
- **Premium typography system** with elegant serif headings
- **Custom Tailwind configuration** with brand-specific colors and spacing
- **Gallery background integration** using dynamic image collages
- **Refined cursor experience** with subtle gold styling

### **Filter System**
- **CSS filter effects** applied in real-time
- **Individual photo targeting** with smart UI
- **"All Photos" bulk application** for efficiency
- **Paginated filter selection** for better UX
- **Visual feedback** showing applied filters

### **GIF System**
- **MediaRecorder integration** for motion capture
- **Frame-by-frame processing**
- **GIF compositing** with design overlays
- **Optimized file sizes** for web sharing
- **Cross-browser compatibility**

### **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements
- Optimized camera viewport handling
- Responsive pagination controls

## 🎨 Customization

### **Adding New Designs**
1. Add design images to `src/assets/designs/`
2. Update design templates in the Photobooth component
3. Add frame mapping in the appropriate component
4. Test positioning and adjust coordinates

### **Adding New Filters**
1. Add filter definition to the filters array in FilterSelection component
2. Test filter effects on different photo types
3. Ensure cross-browser compatibility

### **Modifying Layouts**
- Edit the LayoutSelection component to add new layout options
- Update preview images in assets directory
- Adjust frame mappings accordingly

### **Theme Customization**
- Modify theme colors in tailwind.config.ts
- Update CSS animations in global styles
- Customize shooting star behavior in AppLayout component

## 🌐 Deployment

The application can be deployed to various platforms:

```bash
# Build the project
npm run build

# Preview the build locally
npm run preview
```

## 📱 Browser Compatibility

- **Chrome/Edge**: Full support with all features
- **Firefox**: Full support with all features
- **Safari**: Full support with all features
- **Mobile browsers**: Responsive design with camera access
- **GIF features**: Supported in all modern browsers

## 🎉 Recent Updates

- ✅ **Elegancia Nocturna design system** implementation
- ✅ **Premium typography** with Cinzel and Montserrat fonts
- ✅ **Luxury gold color palette** (#D8AE48) throughout the app
- ✅ **Gallery background collage** using dynamic photo examples
- ✅ **Sophisticated cursor design** with elegant golden styling
- ✅ **BoothieCall branding** integration with custom logo
- ✅ **Enhanced user experience** with refined dark aesthetics
- ✅ **TypeScript implementation** for type safety

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🛠️ Git Configuration for Multiple GitHub Accounts

If you're using multiple GitHub accounts and encounter authentication issues when pushing to this repository, follow these steps:

1. **Check your SSH configuration**:
   ```bash
   # View your SSH config
   cat ~/.ssh/config
   ```

2. **Configure SSH for multiple accounts** (if not already done):
   ```bash
   # Edit SSH config
   nano ~/.ssh/config
   ```
   
   Add configuration like this:
   ```
   # Main account
   Host github.com
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_rsa
   
   # Secondary account (axlwolf)
   Host github-axlwolf
       HostName github.com
       User git
       IdentityFile ~/.ssh/id_ed25519_axlwolf
   ```

3. **Set the correct remote URL for this repository**:
   ```bash
   # Remove existing remote
   git remote remove origin
   
   # Add remote with the correct host alias
   git remote add origin git@github-axlwolf:axlwolf/boothiecall-elegancia-playground.git
   ```

4. **Push to the repository using the configured remote**:
   ```bash
   git push -u origin main
   ```

This configuration allows Git to use the correct SSH key for each GitHub account.

## 🙏 Acknowledgments

- Built with React, TypeScript, and Vite
- UI components from shadcn/ui
- Styling with Tailwind CSS
- Design inspiration from luxury photography experiences

---

**Created with ❤️ by Axel Lanuza for BoothieCall.net**
