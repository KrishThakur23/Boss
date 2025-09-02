import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './Header';
import Footer from './Footer';
import Home from './Home';
import SignIn from './SignIn';
import SignUp from './SignUp';
import AboutUs from './AboutUs';
import Profile from './Profile';
import AdminDashboard from './AdminDashboard';
import Donate from './Donate';
import Partner from './Partner';
import HelpCenter from './HelpCenter';
import OrderTracking from './OrderTracking';
import ShippingInfo from './ShippingInfo';
import ReturnPolicy from './ReturnPolicy';
import FAQ from './FAQ';
import Terms from './Terms';
import PrivacyPolicy from './PrivacyPolicy';
import Disclaimer from './Disclaimer';
import ReportVulnerability from './ReportVulnerability';
import PrescriptionUpload from './PrescriptionUpload';
import Cart from './Cart';
import Medicines from './components/Medicines';
import Products from './Products';
import ProductDetail from './components/ProductDetail';
import Addresses from './Addresses';
import Checkout from './Checkout';
import OrderSuccess from './OrderSuccess';
import MyOrders from './MyOrders';
import CartDebug from './CartDebug';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/shipping-info" element={<ShippingInfo />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/report-vulnerability" element={<ReportVulnerability />} />
                <Route path="/prescription-upload" element={<PrescriptionUpload />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/addresses" element={<Addresses />} />
                                 <Route path="/checkout" element={<Checkout />} />
                 <Route path="/order-success" element={<OrderSuccess />} />
                 <Route path="/my-orders" element={<MyOrders />} />
              </Routes>
            </main>
            <Footer />
            <CartDebug />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
