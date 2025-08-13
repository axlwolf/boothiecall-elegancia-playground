# GoDaddy Deployment Guide - Frontend React App

This guide will help you deploy the BoothieCall Elegancia React frontend to your GoDaddy shared hosting account at `https://boothiecall.net/playground/`.

## Prerequisites

- GoDaddy shared hosting account with Apache server
- cPanel access or FTP access
- Domain `boothiecall.net` configured and pointing to your hosting

## Step 1: Build the Application

1. **Ensure you're on the correct branch with the latest fixes:**
   ```bash
   git checkout staging
   git pull origin staging
   ```

2. **Build the production version:**
   ```bash
   npm run build
   ```

3. **Verify the build completed successfully:**
   ```bash
   ls -la dist/
   # Should show index.html, .htaccess, assets/, icons/, etc.
   ```

## Step 2: Prepare Files for Upload

The `dist/` folder contains all the files needed for deployment:

```
dist/
├── index.html              # Main entry point
├── .htaccess              # Apache server configuration (CRITICAL)
├── assets/                # JS, CSS, and other bundled assets
├── icons/                 # PWA icons
├── fonts/                 # Custom fonts
├── images/               # Static images
├── manifest.json         # PWA manifest
├── favicon.ico           # Site favicon
└── other static files
```

## Step 3: Upload to GoDaddy

### Option A: cPanel File Manager (Recommended)

1. **Log into your GoDaddy cPanel**
2. **Open File Manager**
3. **Navigate to the correct directory:**
   - If `boothiecall.net` is your main domain: go to `public_html/playground/`
   - If it's an addon domain: go to the appropriate domain folder, then `playground/`
4. **Create the playground directory if it doesn't exist**
5. **Upload all files from the `dist/` folder:**
   - Select all files in `dist/` (including hidden `.htaccess`)
   - Upload to `public_html/playground/`
   - Extract if you uploaded a zip file

### Option B: FTP Upload

1. **Use an FTP client like FileZilla:**
   ```
   Host: ftp.boothiecall.net (or your FTP hostname)
   Username: your_cpanel_username
   Password: your_cpanel_password
   Port: 21
   ```

2. **Upload all files from `dist/` to the `/public_html/playground/` directory**

## Step 4: Set File Permissions (CRITICAL)

**Using cPanel File Manager:**

1. **Select all uploaded files and folders**
2. **Set permissions:**
   ```
   Directories: 755
   - playground/ - 755
   - assets/ - 755
   - icons/ - 755
   - fonts/ - 755
   - images/ - 755
   
   Files: 644
   - index.html - 644
   - .htaccess - 644 (VERY IMPORTANT)
   - manifest.json - 644
   - All other files - 644
   ```

**Using FTP client:**
- Right-click files/folders → Properties → Permissions
- Set directories to 755 (rwxr-xr-x)
- Set files to 644 (rw-r--r--)

## Step 5: Verify Deployment

1. **Test the main URL:**
   ```
   https://boothiecall.net/playground/
   ```
   Should load the BoothieCall Playground landing page.

2. **Test React Router routing:**
   ```
   https://boothiecall.net/playground/admin/login
   ```
   Should load the admin login page (not a 404).

3. **Check browser console:**
   - No 403 Forbidden errors
   - No missing asset errors
   - Application loads completely

## Troubleshooting

### 403 Forbidden Error

**Cause:** Incorrect file permissions or missing `.htaccess` file.

**Solutions:**
1. **Verify `.htaccess` file exists** in the playground directory
2. **Check file permissions:**
   - `.htaccess` must be 644
   - `index.html` must be 644
   - Directories must be 755
3. **Ensure `.htaccess` was uploaded correctly** (it's a hidden file)

### 404 Not Found for Routes

**Cause:** Apache server not redirecting SPA routes to `index.html`.

**Solutions:**
1. **Verify `.htaccess` contains the correct rewrite rules**
2. **Check that mod_rewrite is enabled** on your hosting (most GoDaddy plans have it)
3. **Ensure RewriteBase is set correctly** to `/playground/`

### Assets Not Loading (CSS/JS 404s)

**Cause:** Incorrect base path or missing files.

**Solutions:**
1. **Verify all files from `dist/assets/` were uploaded**
2. **Check that file paths in `index.html` are correct**
3. **Ensure no files were corrupted during upload**

### PWA/Manifest Issues

**Cause:** Incorrect paths or HTTPS requirements.

**Solutions:**
1. **Ensure SSL certificate is active** on boothiecall.net
2. **Verify manifest.json paths are correct**
3. **Check that all icon files were uploaded**

## Security Notes

The `.htaccess` file includes:
- **Security headers** to prevent XSS and clickjacking
- **File protection** for sensitive files (package.json, etc.)
- **Compression** for better performance
- **Caching headers** for static assets

## File Structure After Deployment

Your GoDaddy hosting should look like:
```
public_html/
└── playground/
    ├── index.html
    ├── .htaccess
    ├── assets/
    │   ├── index-[hash].js
    │   ├── vendor-[hash].js
    │   ├── ui-[hash].js
    │   └── index-[hash].css
    ├── icons/
    ├── fonts/
    ├── images/
    └── manifest.json
```

## Support

If you continue to experience issues:

1. **Check GoDaddy error logs** in cPanel
2. **Verify your hosting plan supports** `.htaccess` and mod_rewrite
3. **Contact GoDaddy support** for server-specific configuration issues
4. **Test with a simple HTML file first** to verify basic hosting functionality

---

**Note:** This deployment method is optimized for GoDaddy shared hosting with Apache server. The `.htaccess` file is specifically configured for GoDaddy's environment and includes all necessary security headers and rewrite rules.
