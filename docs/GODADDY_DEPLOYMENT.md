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

## Troubleshooting 403 Forbidden Errors

### Emergency Diagnostic Checklist

If you're getting 403 errors, follow this systematic approach:

1. **[ ] Upload test-basic.html first**
   - Upload `test-basic.html` to `/public_html/playground/`
   - Set permissions to 644
   - Test: `https://boothiecall.net/playground/test-basic.html`
   - If this fails → File permissions or directory structure issue

2. **[ ] Test directory index**
   - Rename `test-basic.html` to `index.html`
   - Test: `https://boothiecall.net/playground/`
   - If this fails → Index file configuration issue

3. **[ ] Test minimal .htaccess**
   - Use `.htaccess-minimal` configuration (see alternative configs below)
   - If this fails → Apache mod_rewrite disabled or .htaccess not allowed

4. **[ ] Check file permissions**
   - Upload `test-permissions.php` and access it
   - Verify all directories are 755, all files are 644

5. **[ ] Progressive .htaccess testing**
   - Start with minimal config, add features one by one
   - Identify which directive causes the 403 error

### Common Causes and Solutions

#### 1. File Permissions Issues
**Most Common Cause**

**Check:**
- `.htaccess` file must be exactly 644 permissions
- `index.html` must be exactly 644 permissions  
- All directories must be exactly 755 permissions
- All other files must be exactly 644 permissions

**Fix:**
```bash
# In cPanel File Manager, select files/folders and set permissions:
Directories: 755 (rwxr-xr-x)
Files: 644 (rw-r--r--)
```

#### 2. Missing or Corrupted .htaccess File
**Second Most Common**

**Check:**
- Verify `.htaccess` file exists in `/public_html/playground/`
- File size should be > 0 bytes
- File should contain RewriteEngine directives

**Fix:**
- Re-upload `.htaccess` file from `dist/` folder
- Ensure file is not renamed during upload
- Check that hidden files are visible in File Manager

#### 3. Directory Structure Issues
**Check:**
```
public_html/
└── playground/          ← Must be exactly this path
    ├── index.html       ← Must be in playground/ root
    ├── .htaccess        ← Must be in playground/ root
    └── assets/          ← Subdirectories are OK
```

**Common Mistakes:**
- Uploading to `public_html/` instead of `public_html/playground/`
- Creating nested directories like `public_html/playground/playground/`
- Missing the `playground/` directory entirely

#### 4. GoDaddy-Specific Apache Configuration
**Check:**
- Verify your hosting plan supports `.htaccess` files
- Ensure `mod_rewrite` is enabled (most GoDaddy plans have this)
- Check if there's a parent `.htaccess` in `public_html/` that conflicts

**Fix:**
- Contact GoDaddy support to verify Apache modules
- Check cPanel → "Apache Modules" if available
- Temporarily rename parent `.htaccess` files to test

#### 5. Index File Configuration
**Check:**
- Verify `index.html` is the default index file
- Check cPanel → "Index Manager" settings

**Fix:**
- In cPanel, go to "Index Manager"
- Navigate to `/playground/` directory
- Ensure `index.html` is listed as a default index file

### Alternative .htaccess Configurations

If the main .htaccess causes 403 errors, try these alternatives:

#### Minimal Configuration (`.htaccess-minimal`)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

#### No Headers Configuration (`.htaccess-no-headers`)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# No security headers - for limited Apache modules
```

### Diagnostic Files Included

The project now includes diagnostic files to help identify the root cause:

- **`test-basic.html`** - Test basic file serving
- **`test-permissions.php`** - Check file permissions and server info
- **`.htaccess-minimal`** - Minimal Apache configuration
- **`.htaccess-no-headers`** - Configuration without security headers

Upload these files to test different aspects of your GoDaddy hosting configuration.

### Advanced Troubleshooting

#### Check Error Logs
1. In cPanel, go to "Error Logs"
2. Look for entries related to `/playground/`
3. Common error patterns:
   - "Permission denied" → File permissions issue
   - "File does not exist" → Missing files or wrong path
   - "Invalid command" → `.htaccess` syntax error or unsupported directive

#### Test with Simple HTML First
Before uploading the full React app:
1. Upload only `test-basic.html`
2. Verify it loads at `https://boothiecall.net/playground/test-basic.html`
3. If this works, the issue is with the React app configuration
4. If this fails, the issue is with basic hosting setup

#### Progressive .htaccess Testing
1. Start with no `.htaccess` file
2. Add minimal `.htaccess` with only `RewriteEngine On`
3. Gradually add directives until you find the problematic one
4. Use alternative configurations if certain directives aren't supported
- Ensure `index.html` is listed as a default index file

### Advanced Troubleshooting

#### Test with Simple HTML File
Create a test file `test.html` in `/public_html/playground/`:
```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Test Page Works</h1></body>
</html>
```

If `https://boothiecall.net/playground/test.html` works but `index.html` doesn't, the issue is with the React app files.

#### Check Error Logs
1. In cPanel, go to "Error Logs"
2. Look for entries related to `/playground/`
3. Common error patterns:
   - "Permission denied" → File permissions issue
   - "File does not exist" → Missing files or wrong path
   - "Invalid command" → `.htaccess` syntax error

#### Minimal .htaccess Test
Try this minimal `.htaccess` first:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /playground/index.html [QSA,L]
```

If this works, gradually add back other directives.

### 404 Not Found for Routes

**Cause:** Apache server not redirecting SPA routes to `index.html`.

**Solutions:**
1. **Verify `.htaccess` contains the correct rewrite rules**
2. **Check that mod_rewrite is enabled** on your hosting (most GoDaddy plans have it)
3. **Test RewriteRule syntax** with minimal configuration first

### Assets Not Loading (CSS/JS 404s)

**Cause:** Incorrect base path or missing files.

**Solutions:**
1. **Verify all files from `dist/assets/` were uploaded**
2. **Check that file paths in `index.html` are correct**
3. **Ensure no files were corrupted during upload**
4. **Verify asset file permissions are 644**

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

## Emergency Checklist for 403 Errors

If you're still getting 403 errors, go through this checklist:

- [ ] **File permissions**: playground/ = 755, all files = 644
- [ ] **Directory structure**: Files in `public_html/playground/` not nested deeper
- [ ] **.htaccess exists**: File is present and not empty
- [ ] **.htaccess permissions**: Exactly 644, not 755 or other
- [ ] **index.html exists**: File is present in playground/ root
- [ ] **index.html permissions**: Exactly 644
- [ ] **Test simple HTML**: Create test.html to verify basic access works
- [ ] **Check error logs**: Look for specific error messages in cPanel
- [ ] **Verify hosting plan**: Confirm .htaccess and mod_rewrite are supported
- [ ] **Parent .htaccess**: Check if `public_html/.htaccess` conflicts

## Support

If you continue to experience issues:

1. **Check GoDaddy error logs** in cPanel
2. **Verify your hosting plan supports** `.htaccess` and mod_rewrite
3. **Contact GoDaddy support** for server-specific configuration issues
4. **Test with a simple HTML file first** to verify basic hosting functionality

---

**Note:** This deployment method is optimized for GoDaddy shared hosting with Apache server. The `.htaccess` file is specifically configured for GoDaddy's environment and includes all necessary security headers and rewrite rules.
