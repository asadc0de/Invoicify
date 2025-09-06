import React, { useCallback, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { useInvoice } from './hooks/useInvoice';
import InvoiceTextView from './components/InvoiceTextView';
import { SkeletonSection } from './components/Skeleton';
import Lenis from 'lenis'

// Lazy load components for better performance
const InvoiceForm = React.lazy(() => import('./components/InvoiceForm').then(module => ({ default: module.InvoiceForm })));
const InvoiceList = React.lazy(() => import('./components/InvoiceList').then(module => ({ default: module.InvoiceList })));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-dark flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);


  

const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InvoiceForm
        invoiceId={id}
        onBack={handleBack}
      />
    </Suspense>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { createInvoice } = useInvoice();
  const navigate = useNavigate();

  const handleCreateInvoice = useCallback(async () => {
    if (!user) return;
    
    try {
      const invoiceId = await createInvoice(user.uid);
      navigate(`/invoice/${invoiceId}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  }, [user, createInvoice, navigate]);

  const handleSelectInvoice = useCallback((invoiceId: string) => {
    navigate(`/invoice/${invoiceId}`);
  }, [navigate]);

  if (!user) {
    return <Auth />;
  }

  return (
  <div className="min-h-screen bg-dark">
      <div className="pb-10">
        <Auth />
        <Suspense fallback={<LoadingSpinner />}>
          <InvoiceList
            userId={user.uid}
            onCreateInvoice={handleCreateInvoice}
            onSelectInvoice={handleSelectInvoice}
          />
        </Suspense>
      </div>
    </div>
  );
};

function App() {

  // Lenis Scroll
useEffect(() => {
  const lenis = new Lenis()
  function raf(time: number){
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
})
  const { loading } = useAuth();

  if (loading) {
    return (
  <div className="min-h-screen bg-dark flex items-center justify-center">
        <SkeletonSection />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
        <Route path="/invoice/:id/text" element={<InvoiceTextView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;