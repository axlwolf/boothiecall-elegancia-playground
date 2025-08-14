# GoDaddy Diagnostic Tools for 403 Forbidden Errors

This document provides diagnostic tools and test configurations to identify the root cause of 403 Forbidden errors on GoDaddy shared hosting beyond basic .htaccess issues.

## Diagnostic Test Files

### 1. Basic HTML Test
Create `test-basic.html` in `/public_html/playground/`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Basic Test</title>
</head>
<body>
    <h1>Basic HTML Test Works</h1>
    <p>If you see this, basic file serving is working.</p>
</body>
</html>
```

**Test URL:** `https://boothiecall.net/playground/test-basic.html`

**Expected Result:** Should load without 403 error
**If 403 occurs:** File permissions or directory structure issue

### 2. Directory Index Test
Create `test-index.html` in `/public_html/playground/`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Index Test</title>
</head>
<body>
    <h1>Directory Index Test</h1>
    <p>Testing if index.html is recognized as default file.</p>
</body>
</html>
```

**Test URL:** `https://boothiecall.net/playground/` (should serve test-index.html)

**Expected Result:** Should load test-index.html as default
**If 403 occurs:** Directory index configuration issue

### 3. Minimal .htaccess Test
Create minimal `.htaccess` in `/public_html/playground/`:
```apache
# Minimal test - just enable rewrite engine
RewriteEngine On
```

**Test:** Access `https://boothiecall.net/playground/`
**If 403 occurs:** Apache mod_rewrite is disabled or .htaccess not allowed

### 4. Progressive .htaccess Testing

#### Step 1: Basic Rewrite Test
```apache
RewriteEngine On
RewriteRule ^test$ test-basic.html [L]
```

**Test URL:** `https://boothiecall.net/playground/test`
**Expected:** Should serve test-basic.html
**If 403:** RewriteRule syntax issue

#### Step 2: React Router Simulation
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]
```

**Test URL:** `https://boothiecall.net/playground/nonexistent-route`
**Expected:** Should serve index.html
**If 403:** React Router rewrite logic issue

#### Step 3: Full Configuration Test
Use the complete .htaccess from the project.

### 5. Permission Diagnostic Script
Create `test-permissions.php` (if PHP is available):
```php
<?php
echo "<h1>File Permissions Diagnostic</h1>";

$files = [
    '.',
    './index.html',
    './.htaccess',
    './assets',
    './test-basic.html'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        $perms = fileperms($file);
        $octal = substr(sprintf('%o', $perms), -4);
        $type = is_dir($file) ? 'Directory' : 'File';
        echo "<p><strong>$file</strong> ($type): $octal</p>";
    } else {
        echo "<p><strong>$file</strong>: NOT FOUND</p>";
    }
}

echo "<h2>Current Directory Contents:</h2>";
echo "<pre>";
print_r(scandir('.'));
echo "</pre>";
?>
```

**Test URL:** `https://boothiecall.net/playground/test-permissions.php`

## Diagnostic Checklist

### File Structure Verification
```
public_html/
└── playground/                    ← Must exist, 755 permissions
    ├── index.html                 ← Must exist, 644 permissions
    ├── .htaccess                  ← Must exist, 644 permissions
    ├── test-basic.html            ← Create for testing, 644 permissions
    ├── test-permissions.php       ← Create for testing, 644 permissions
    └── assets/                    ← Must exist, 755 permissions
        └── (React app assets)     ← All files 644 permissions
```

### Permission Requirements Matrix
| Item Type | Required Permission | Octal | Symbolic |
|-----------|-------------------|-------|----------|
| Directories | 755 | 755 | rwxr-xr-x |
| .htaccess | 644 | 644 | rw-r--r-- |
| index.html | 644 | 644 | rw-r--r-- |
| CSS/JS files | 644 | 644 | rw-r--r-- |
| Image files | 644 | 644 | rw-r--r-- |
| All other files | 644 | 644 | rw-r--r-- |

### Common GoDaddy Issues

#### 1. Hidden Files Not Uploaded
**Symptom:** .htaccess exists locally but not on server
**Solution:** 
- In cPanel File Manager, enable "Show Hidden Files"
- Re-upload .htaccess ensuring it's visible
- Verify file size > 0 bytes

#### 2. Nested Directory Structure
**Symptom:** Files uploaded to wrong location
**Common Mistake:** `public_html/playground/playground/index.html`
**Correct Structure:** `public_html/playground/index.html`

#### 3. Parent .htaccess Conflicts
**Check:** Look for `.htaccess` in `public_html/`
**Test:** Temporarily rename parent .htaccess to `.htaccess.backup`

#### 4. Apache Module Limitations
**Common Issues:**
- mod_rewrite disabled
- mod_headers disabled
- Specific directives not allowed

**Test:** Use minimal .htaccess configurations progressively

#### 5. Index File Priority
**Check:** cPanel → Index Manager
**Ensure:** `index.html` is listed as default index file
**Priority Order:** Usually `index.html`, `index.php`, `default.html`

## Error Log Analysis

### Accessing GoDaddy Error Logs
1. cPanel → Error Logs
2. Look for entries with `/playground/` in the path
3. Common error patterns:

#### Permission Denied
```
[error] [client IP] (13)Permission denied: access to /playground/ denied
```
**Solution:** Fix file permissions (755 for directories, 644 for files)

#### File Not Found
```
[error] [client IP] File does not exist: /home/username/public_html/playground/
```
**Solution:** Verify directory structure and file locations

#### Invalid Command
```
[error] [client IP] Invalid command 'Header', perhaps misspelled or defined by a module not included in the server configuration
```
**Solution:** mod_headers not available, remove Header directives from .htaccess

#### Rewrite Error
```
[error] [client IP] Invalid command 'RewriteEngine', perhaps misspelled or defined by a module not included in the server configuration
```
**Solution:** mod_rewrite not available, contact GoDaddy support

## Progressive Troubleshooting Steps

### Step 1: Basic Access Test
1. Upload only `test-basic.html` with 644 permissions
2. Test `https://boothiecall.net/playground/test-basic.html`
3. If 403: File permission or directory structure issue

### Step 2: Directory Index Test
1. Rename `test-basic.html` to `index.html`
2. Test `https://boothiecall.net/playground/`
3. If 403: Index file configuration issue

### Step 3: Minimal .htaccess Test
1. Add minimal .htaccess with only `RewriteEngine On`
2. Test access again
3. If 403: .htaccess not allowed or mod_rewrite disabled

### Step 4: Progressive .htaccess Features
1. Add RewriteRule one by one
2. Test after each addition
3. Identify which directive causes 403

### Step 5: Full React App Test
1. Upload complete React app files
2. Use working .htaccess from previous steps
3. Test React Router navigation

## Alternative .htaccess Configurations

### Configuration A: Minimal (for limited Apache modules)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

### Configuration B: Basic Security (if mod_headers available)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
</IfModule>
```

### Configuration C: Full Featured (current implementation)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /playground/index.html [QSA,L]

<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

## Contact GoDaddy Support Checklist

If all diagnostic tests fail, contact GoDaddy support with:

1. **Hosting Plan Details:** Shared hosting plan name and features
2. **Apache Modules:** Request confirmation of available modules:
   - mod_rewrite
   - mod_headers
   - mod_expires
   - mod_deflate
3. **Error Log Entries:** Specific error messages from diagnostic tests
4. **File Structure:** Confirmation of correct directory structure
5. **Permission Settings:** Verification of file permission requirements

## Success Criteria

The diagnostic process is complete when:
- [ ] Basic HTML file loads without 403 error
- [ ] Directory index serves index.html correctly
- [ ] Minimal .htaccess works without errors
- [ ] React Router rewrite rules function properly
- [ ] All static assets load correctly
- [ ] React app navigation works in production

---

**Note:** These diagnostic tools are specifically designed for GoDaddy shared hosting limitations and Apache server configuration requirements.
