import React from 'react';

// Import necessary CSS for layout if needed, e.g., Bootstrap or custom styles
// import './Layout.css'; // Example: if you have custom layout CSS

interface MainLayoutProps {
  children: React.ReactNode; // To render page content
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    // Ensure the main container structure matches your theme's requirements
    // This often involves a wrapper div around VerticalNavbar and the main content area
    <div
      className="container-fluid"
      style={{
        minHeight: '100vh',
        paddingTop: 64, // Header height
        paddingBottom: 64, // Footer height
        display: 'flex',
        flexDirection: 'row',
        background: '#f5f6fa',
      }}
    >
      {/* Pass the toggle function to TopNavbar */}
      {/* <TopNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} /> */}

      <div
        className="content-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
        }}
      >
        {/* Pass the state to VerticalNavbar */}
        {/* <VerticalNavbar isSidebarOpen={isSidebarOpen} /> */}

        {/* Main Content Area */}
        <div
          className="content"
          style={{
            flex: 1,
            marginLeft: 200, // Adjust based on sidebar width (collapsed/expanded)
            transition: 'margin-left 0.2s',
            padding: 24,
            background: '#fff',
            minHeight: 'calc(100vh - 128px)', // Header + Footer
            overflow: 'auto',
          }}
        >
          {/* Render the specific page content here */}
          {children}
        </div>
      </div>

      {/* Optional Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default MainLayout;