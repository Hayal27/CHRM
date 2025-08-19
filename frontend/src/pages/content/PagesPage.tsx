import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/Auth/AuthContext'; // Assuming API calls might need auth
import './custom.css'
// Define an interface for the Page data structure
interface Page {
  id: string | number; // Use string or number based on your API
  title: string;
  author: string; // Or potentially an author object { id, name }
  status: 'published' | 'draft' | 'trash';
  datePublished: string; // Or Date object
  // Add other relevant fields: slug, content excerpt, etc.
}

const PagesPage: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Get token if needed for API calls

  // Simulate fetching pages from an API
  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Replace with actual API call ---
        // const response = await fetch('/api/pages', {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // if (!response.ok) throw new Error('Failed to fetch pages');
        // const data: Page[] = await response.json();
        // setPages(data);

        // --- Mock Data Simulation ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const mockPages: Page[] = [
          { id: 1, title: 'About Us', author: 'Admin', status: 'published', datePublished: '2023-10-26' },
          { id: 2, title: 'Contact Us', author: 'Admin', status: 'published', datePublished: '2023-10-25' },
          { id: 3, title: 'Privacy Policy', author: 'Editor', status: 'draft', datePublished: '2023-10-27' },
          { id: 4, title: 'Terms of Service', author: 'Admin', status: 'published', datePublished: '2023-09-15' },
        ];
        setPages(mockPages);
        // --- End Mock Data ---

      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching pages.');
        console.error("Fetch Pages Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, [token]); // Re-fetch if token changes (e.g., after login)

  const handleDelete = (pageId: string | number) => {
    // --- Add API call logic here ---
    console.log(`TODO: Implement delete for page ID: ${pageId}`);
    // Example:
    // try {
    //   await fetch(`/api/pages/${pageId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    //   setPages(prevPages => prevPages.filter(page => page.id !== pageId)); // Update state on success
    // } catch (err) {
    //   console.error("Delete Page Error:", err);
    //   alert('Failed to delete page.');
    // }
    alert(`Simulating delete for page ID: ${pageId}. Implement API call.`);
  };


  return (
    <div className="center p-3 p-sm-4">
      {/* Header remains full width */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2>Pages</h2>
        <Link to="/content/pages/new" className="btn btn-primary">
          <i className="fas fa-plus me-1"></i> Add New Page
        </Link>
      </div>

      {/* Wrapper to center the content block */}
      <div className="d-flex justify-content-center">
        <div className="w-100"> {/* Optional: Constrain width if needed, e.g., max-width: 1200px; or use Bootstrap width classes */}
            {/* Loading State */}
            {isLoading && (
                <div className="text-center mt-5"> {/* Added margin top for better spacing when centered */}
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-danger mt-4 w-75 mx-auto" role="alert"> {/* Centered alert */}
                Error: {error}
                </div>
            )}

            {/* Content Table */}
            {!isLoading && !error && (
                <div className="card shadow-sm w-100"> {/* Ensure card takes full width of its centered container */}
                <div className="card-body">
                    <div className="table-responsive">
                    <table className="table table-hover table-sm fs-10">
                        <thead className="table-light">
                        <tr>
                            <th scope="col">Title</th>
                            <th scope="col">Author</th>
                            <th scope="col">Status</th>
                            <th scope="col">Date Published</th>
                            <th scope="col">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pages.length > 0 ? (
                            pages.map((page) => (
                            <tr key={page.id}>
                                <td>
                                <Link to={`/content/pages/edit/${page.id}`}>
                                    <strong>{page.title}</strong>
                                </Link>
                                </td>
                                <td>{page.author}</td>
                                <td>
                                <span className={`badge bg-${page.status === 'published' ? 'success' : page.status === 'draft' ? 'secondary' : 'danger'}`}>
                                    {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                                </span>
                                </td>
                                <td>{page.datePublished}</td>
                                <td>
                                <Link
                                    to={`/content/pages/edit/${page.id}`}
                                    className="btn btn-sm btn-outline-primary me-1"
                                    title="Edit"
                                >
                                    <i className="fas fa-pencil-alt"></i>
                                </Link>
                                <button
                                    onClick={() => handleDelete(page.id)}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                                {/* Add View button if applicable */}
                                {/* <Link to={`/page/${page.slug}`} target="_blank" className="btn btn-sm btn-outline-info ms-1" title="View"><i className="fas fa-eye"></i></Link> */}
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan={5} className="text-center">No pages found.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
                {/* Optional: Add pagination controls here */}
                {/* <div className="card-footer">Pagination...</div> */}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PagesPage;