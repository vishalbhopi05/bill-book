import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }

        button:hover {
          opacity: 0.9;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        input:focus,
        select:focus {
          outline: 2px solid #d32f2f;
        }
      `}</style>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
            style: {
              border: '2px solid #4CAF50',
            },
          },
          error: {
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
            style: {
              border: '2px solid #f44336',
            },
          },
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
