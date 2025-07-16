import React from 'react';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const Settings: React.FC = () => {
  return (
    <div>
      <PageHeader title="Settings" description="Configure application-wide settings." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-gold-500">General Settings</CardTitle>
            <CardDescription>Manage basic application configurations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input id="appName" defaultValue="BoothieCall Elegancia" className="bg-gray-700 border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" defaultValue="support@example.com" className="bg-gray-700 border-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-gold-500">Branding</CardTitle>
            <CardDescription>Customize the application's branding.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" defaultValue="/public/logo.png" className="bg-gray-700 border-gray-600" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <Input id="primaryColor" type="color" defaultValue="#D8AE48" className="bg-gray-700 border-gray-600 h-10" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-gold-500">Feature Toggles</CardTitle>
            <CardDescription>Enable or disable specific features.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gifFeature">Enable GIF Creation</Label>
              <Switch id="gifFeature" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="printFeature">Enable Print Option</Label>
              <Switch id="printFeature" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-gold-500 hover:bg-gold-600">Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
