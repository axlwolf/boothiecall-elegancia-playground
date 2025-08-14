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

echo "<h2>Server Information:</h2>";
echo "<p><strong>Server Software:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p><strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p><strong>Script Filename:</strong> " . $_SERVER['SCRIPT_FILENAME'] . "</p>";
?>
