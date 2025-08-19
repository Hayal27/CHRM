import React, { useState, FormEvent } from 'react';

/**
 * GeneralSettingsPage
 * Allows administrators to configure general site settings.
 */
const GeneralSettingsPage: React.FC = () => {
    // --- State for Form Fields ---
    // Replace with actual state management and fetching initial values
    const [siteTitle, setSiteTitle] = useState<string>('My Awesome CMS');
    const [tagline, setTagline] = useState<string>('Just another CMS site');
    const [adminEmail, setAdminEmail] = useState<string>('admin@example.com');
    const [siteUrl, setSiteUrl] = useState<string>('http://92.168.0.111:3000'); // Or your actual URL
    const [timezone, setTimezone] = useState<string>('UTC');
    const [dateFormat, setDateFormat] = useState<string>('F j, Y'); // Example: January 1, 2024
    const [timeFormat, setTimeFormat] = useState<string>('g:i a'); // Example: 1:30 pm
  
    // --- Form Submission Handler ---
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // TODO: Implement API call to save settings
      console.log('Saving settings:', {
        siteTitle,
        tagline,
        adminEmail,
        siteUrl,
        timezone,
        dateFormat,
        timeFormat,
      });
      alert('Settings saved (Placeholder - check console)');
    };
  
    return (
      <div className="container-fluid">
        <div className="d-sm-flex align-items-center justify-content-between mb-4">
          <h1 className="h3 mb-0 text-gray-800">General Settings</h1>
        </div>
  
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Site Configuration</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Site Title */}
              <div className="mb-3">
                <label htmlFor="siteTitle" className="form-label">
                  Site Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="siteTitle"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  required
                />
              </div>
  
              {/* Tagline */}
              <div className="mb-3">
                <label htmlFor="tagline" className="form-label">
                  Tagline
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
                <div className="form-text">
                  In a few words, explain what this site is about.
                </div>
              </div>
  
              {/* Administration Email Address */}
              <div className="mb-3">
                <label htmlFor="adminEmail" className="form-label">
                  Administration Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="adminEmail"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <div className="form-text">
                  This address is used for admin purposes. If you change this, we will send you an email at your new address to confirm it.
                </div>
              </div>
  
              {/* Site Address (URL) */}
              <div className="mb-3">
                <label htmlFor="siteUrl" className="form-label">
                  Site Address (URL)
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="siteUrl"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  required
                />
              </div>
  
              {/* Timezone */}
              <div className="mb-3">
                <label htmlFor="timezone" className="form-label">
                  Timezone
                </label>
                {/* TODO: Replace with a proper timezone dropdown component */}
                <select
                  className="form-select"
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  {/* Add more timezones as needed */}
                </select>
              </div>
  
              {/* Date Format */}
              <div className="mb-3">
                <label htmlFor="dateFormat" className="form-label">
                  Date Format
                </label>
                {/* TODO: Add radio buttons or select for common formats */}
                <input
                  type="text"
                  className="form-control"
                  id="dateFormat"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                />
                <div className="form-text">
                  Example format codes: F j, Y (January 1, 2024), Y-m-d (2024-01-01)
                </div>
              </div>
  
              {/* Time Format */}
              <div className="mb-3">
                <label htmlFor="timeFormat" className="form-label">
                  Time Format
                </label>
                {/* TODO: Add radio buttons or select for common formats */}
                <input
                  type="text"
                  className="form-control"
                  id="timeFormat"
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value)}
                />
                <div className="form-text">
                  Example format codes: g:i a (1:30 pm), H:i (13:30)
                </div>
              </div>
  
              {/* Submit Button */}
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  export default GeneralSettingsPage;