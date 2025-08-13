# BoothieCall Elegancia Playground - Admin User Guide

Welcome to the BoothieCall Elegancia Playground Admin Panel! This guide will walk you through the features and functionalities available to manage your photobooth application.

## 1. Login

To access the admin panel, navigate to `/admin/login` in your browser. Enter your credentials (e.g., `admin@example.com` / `password` for mock data) and click "Login".

## 2. Dashboard Overview

The Dashboard provides a quick overview of your system's key metrics and recent activities.

- **Summary Cards**: View total counts for Assets, Users, Designs, and Filters.
- **Charts**: Visualize daily sessions, popular filters, and layout usage trends.
- **Recent Activity**: See lists of recently added assets and users.

## 3. Navigation

The sidebar on the left (or accessible via a hamburger menu on mobile) allows you to navigate between different sections of the admin panel:

- **Dashboard**: System overview.
- **Assets**: Manage logos, images, and other media assets.
- **Filters**: Create, edit, and delete photo filters.
- **Designs**: Manage photo strip templates and layouts.
- **Users**: Administer user accounts and roles.
- **Tenants**: Manage different client organizations (multi-tenant support).
- **Formats**: Configure output options for photo strips (PNG, GIF, Print).
- **Analytics**: Detailed usage statistics.
- **Settings**: General application configurations.

## 4. Asset Management

In the **Assets** section, you can manage all media files used in your photobooth.

- **View Assets**: See a list of all uploaded assets, including their file name, type, and creation date.
- **Upload Asset**: Click the "Upload Asset" button to open a dialog. Select a file and choose its type (Image, Logo, Design Template), then click "Upload".
- **Edit Asset**: Click the "..." (More) icon next to an asset and select "Edit". You can update the file name and type.
- **Delete Asset**: Click the "..." (More) icon next to an asset and select "Delete". Confirm your action in the dialog to permanently remove the asset.

## 5. Filter Management

In the **Filters** section, you can create and manage photo filters.

- **View Filters**: See a list of all configured filters, including their name, CSS properties, and active status.
- **Add Filter**: Click the "Add Filter" button. Provide a name, CSS properties (e.g., `grayscale(100%)`, `sepia(50%)`), and set its active status.
- **Edit Filter**: Click the "..." (More) icon next to a filter and select "Edit". Update its details.
- **Delete Filter**: Click the "..." (More) icon next to a filter and select "Delete". Confirm to remove.

## 6. Design Management

In the **Designs** section, you can manage photo strip templates.

- **View Designs**: See a list of design templates, including their name, layout type, and active status.
- **Add Design**: Click "Add Design". Provide a name, select a layout type (1-shot, 3-shot, etc.), input `Frame Mappings` (a JSON array of objects defining `x`, `y`, `width`, `height`, and optional `borderRadius` for each photo slot), and set active status.
- **Edit Design**: Click the "..." (More) icon next to a design and select "Edit". Update its details.
- **Delete Design**: Click the "..." (More) icon next to a design and select "Delete". Confirm to remove.

## 7. User Management

In the **Users** section, you can manage user accounts and their roles within the system.

- **View Users**: See a list of users, their email, role, and associated tenant.
- **Add User**: Click "Add User". Provide an email, select a role (Super Admin, Tenant Admin, Editor, Viewer), and assign a tenant.
- **Edit User**: Click the "..." (More) icon next to a user and select "Edit". Update their details.
- **Delete User**: Click the "..." (More) icon next to a user and select "Delete". Confirm to remove.

## 8. Tenant Management

In the **Tenants** section, you can manage different client organizations.

- **View Tenants**: See a list of tenants, their name, domain, and settings.
- **Add Tenant**: Click "Add Tenant". Provide a name, domain, and settings (as a JSON object).
- **Edit Tenant**: Click the "..." (More) icon next to a tenant and select "Edit". Update their details.
- **Delete Tenant**: Click the "..." (More) icon next to a tenant and select "Delete". Confirm to remove.

## 9. Output Format Management

In the **Formats** section, you can configure how photo strips are exported.

- **View Formats**: See a list of output formats, including name, file type (PNG, GIF, Print), quality, watermark text, and active status.
- **Add Format**: Click "Add Format". Provide a name, select a file type, set quality (0-100), add optional watermark text, and set active status.
- **Edit Format**: Click the "..." (More) icon next to a format and select "Edit". Update its details.
- **Delete Format**: Click the "..." (More) icon next to a format and select "Delete". Confirm to remove.

## 10. Analytics

In the **Analytics** section, you can view various usage statistics and insights through charts and data.

- **Daily Sessions**: Track the number of photobooth sessions over time.
- **Popular Filters**: See which filters are used most frequently.
- **Layout Usage**: Understand the popularity of different photo strip layouts.

## 11. Settings

The **Settings** section allows you to configure general application-wide parameters.

- **General Settings**: Basic app name and contact information.
- **Branding**: Customize logo URL and primary color.
- **Feature Toggles**: Enable or disable specific features like GIF creation or print options.

This guide covers the main functionalities of the admin panel. For any further assistance, please refer to the project documentation or contact support.