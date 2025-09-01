# 🚀 Frontend Integration Examples

This guide shows how to integrate the Supabase backend services with your React frontend components.

## **📋 Table of Contents**

1. [Authentication Integration](#authentication-integration)
2. [Product Management Integration](#product-management-integration)
3. [Cart & Orders Integration](#cart--orders-integration)
4. [File Upload Integration](#file-upload-integration)
5. [Error Handling & Loading States](#error-handling--loading-states)

---

## **🔐 Authentication Integration**

### **SignUp Component Integration**

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await AuthService.signUp(
        formData.email,
        formData.password,
        {
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        }
      );

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Show success message and redirect
      alert('Account created successfully! Please check your email to confirm.');
      navigate('/signin');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields here */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### **SignIn Component Integration**

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await AuthService.signIn(
        formData.email,
        formData.password
      );

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Redirect to dashboard/home
      navigate('/');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await AuthService.signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields here */}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      <button type="button" onClick={handleGoogleSignIn}>
        Continue with Google
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### **AuthContext Integration**

```jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check current session on mount
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await checkUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: session } = await AuthService.getCurrentSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Check if user is admin
        const { data: adminStatus } = await AuthService.isAdmin(session.user.id);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## **🛍️ Product Management Integration**

### **ProductSections Component Integration**

```jsx
import React, { useState, useEffect } from 'react';
import ProductService from '../services/products';
import { useCart } from '../contexts/CartContext';

const ProductSections = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error: productsError } = await ProductService.getProducts({
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (productsError) {
        setError(productsError.message);
        return;
      }

      setProducts(data || []);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error: categoriesError } = await ProductService.getCategories();
      
      if (categoriesError) {
        console.error('Categories error:', categoriesError);
        return;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // You'll need to get userId from auth context
      const userId = 'user-id-from-auth';
      await addToCart(userId, product.id, 1);
      alert('Product added to cart!');
    } catch (error) {
      alert('Failed to add product to cart');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="product-sections">
      {categories.map(category => {
        const categoryProducts = products.filter(p => p.category_id === category.id);
        
        return (
          <section key={category.id} className="product-section">
            <h2>{category.name}</h2>
            <div className="product-grid">
              {categoryProducts.map(product => (
                <div key={product.id} className="product-card">
                  <img 
                    src={product.image_urls?.[0] || '/placeholder.jpg'} 
                    alt={product.name} 
                  />
                  <h3>{product.name}</h3>
                  <p>₹{product.price}</p>
                  <button onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
```

### **Product Search Integration**

```jsx
import React, { useState } from 'react';
import ProductService from '../services/products';

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await ProductService.searchProducts(term, {
        limit: 20
      });

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search for medicines, supplements..."
        value={searchTerm}
        onChange={handleInputChange}
        className="search-input"
      />
      
      {searching && <div className="searching">Searching...</div>}
      
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map(product => (
            <div key={product.id} className="search-result-item">
              <img src={product.image_urls?.[0]} alt={product.name} />
              <div>
                <h4>{product.name}</h4>
                <p>₹{product.price}</p>
                <p>{product.category?.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## **🛒 Cart & Orders Integration**

### **Cart Component Integration**

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import OrderService from '../services/orders';

const Cart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data, error: cartError } = await OrderService.getUserCart(user.id);
      
      if (cartError) {
        setError(cartError.message);
        return;
      }

      setCart(data);
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      const { error } = await OrderService.updateCartItemQuantity(cartItemId, newQuantity);
      
      if (error) {
        alert('Failed to update quantity');
        return;
      }

      // Refresh cart
      fetchCart();
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const { error } = await OrderService.removeFromCart(cartItemId);
      
      if (error) {
        alert('Failed to remove item');
        return;
      }

      // Refresh cart
      fetchCart();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await OrderService.clearCart(user.id);
      
      if (error) {
        alert('Failed to clear cart');
        return;
      }

      setCart(null);
    } catch (err) {
      alert('Failed to clear cart');
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return <div className="empty-cart">Your cart is empty</div>;
  }

  const totals = OrderService.getCartTotal(cart);

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      
      {cart.items.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.product.image_urls?.[0]} alt={item.product.name} />
          <div>
            <h3>{item.product.name}</h3>
            <p>₹{item.product.price}</p>
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        </div>
      ))}
      
      <div className="cart-totals">
        <p>Subtotal: ₹{totals.subtotal}</p>
        <p>Discount: ₹{totals.discount}</p>
        <p><strong>Total: ₹{totals.total}</strong></p>
      </div>
      
      <div className="cart-actions">
        <button onClick={clearCart}>Clear Cart</button>
        <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </div>
    </div>
  );
};
```

### **Checkout Component Integration**

```jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import OrderService from '../services/orders';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    paymentMethod: 'cod'
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Validate cart before checkout
      const { data: cart } = await OrderService.getUserCart(user.id);
      const { valid, errors } = await OrderService.validateCartForCheckout(cart);
      
      if (!valid) {
        setError(errors.join(', '));
        return;
      }

      // Create order
      const { data: order, error: orderError } = await OrderService.createOrder(
        user.id,
        orderData
      );

      if (orderError) {
        setError(orderError.message);
        return;
      }

      // Redirect to order confirmation
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError('Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2>Checkout</h2>
      
      <div className="form-group">
        <label>Shipping Address</label>
        <textarea
          value={orderData.shippingAddress}
          onChange={(e) => setOrderData({
            ...orderData,
            shippingAddress: e.target.value
          })}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Payment Method</label>
        <select
          value={orderData.paymentMethod}
          onChange={(e) => setOrderData({
            ...orderData,
            paymentMethod: e.target.value
          })}
        >
          <option value="cod">Cash on Delivery</option>
          <option value="online">Online Payment</option>
        </select>
      </div>
      
      <button type="submit" disabled={processing}>
        {processing ? 'Processing...' : 'Place Order'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

---

## **📁 File Upload Integration**

### **Product Image Upload Integration**

```jsx
import React, { useState } from 'react';
import StorageService from '../services/storage';
import ProductService from '../services/products';

const ProductImageUpload = ({ productId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileUpload = async (files) => {
    try {
      setUploading(true);
      setError('');
      setProgress(0);

      const { urls, error: uploadError } = await StorageService.uploadMultipleProductImages(
        Array.from(files),
        productId
      );

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      // Update product with new image URLs
      const { error: updateError } = await ProductService.updateProduct(productId, {
        image_urls: urls
      });

      if (updateError) {
        setError('Images uploaded but failed to update product');
        return;
      }

      setProgress(100);
      onUploadComplete?.(urls);
      alert('Images uploaded successfully!');
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        disabled={uploading}
      />
      
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{progress}%</span>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

### **Prescription Upload Integration**

```jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StorageService from '../services/storage';

const PrescriptionUpload = ({ orderId, onUploadComplete }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      setError('');

      const { url, error: uploadError } = await StorageService.uploadPrescription(
        file,
        user.id,
        orderId
      );

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      onUploadComplete?.(url);
      alert('Prescription uploaded successfully!');
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="prescription-upload">
      <h3>Upload Prescription</h3>
      <p>Please upload a clear image or PDF of your prescription</p>
      
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={uploading}
      />
      
      {uploading && <div className="uploading">Uploading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

---

## **⚠️ Error Handling & Loading States**

### **Error Boundary Component**

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **Loading Component**

```jsx
import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      {text && <p>{text}</p>}
    </div>
  );
};

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton ${type}`}>
      <div className="skeleton-content" />
    </div>
  ));

  return <div className="skeleton-container">{skeletons}</div>;
};
```

### **Error Display Component**

```jsx
import React from 'react';

const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="error-display">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button onClick={onRetry} className="retry-btn">
            Try Again
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="dismiss-btn">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## **🔧 Integration Checklist**

### **Before You Start:**
- [ ] Set up `.env.local` with Supabase credentials
- [ ] Run the database schema in Supabase
- [ ] Create storage bucket `flickxir_uploads`
- [ ] Configure Google OAuth in Supabase dashboard

### **Authentication:**
- [ ] Replace mock auth with AuthService calls
- [ ] Implement AuthContext with real Supabase auth
- [ ] Add loading states and error handling
- [ ] Test sign up, sign in, and sign out

### **Products:**
- [ ] Replace mock products with ProductService calls
- [ ] Implement product search and filtering
- [ ] Add product detail pages
- [ ] Test admin product management

### **Cart & Orders:**
- [ ] Implement persistent cart with OrderService
- [ ] Add checkout flow
- [ ] Implement order tracking
- [ ] Test complete order lifecycle

### **File Uploads:**
- [ ] Implement image upload for products
- [ ] Add prescription upload functionality
- [ ] Test file validation and compression
- [ ] Verify storage bucket permissions

### **Error Handling:**
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Add user-friendly error messages
- [ ] Test error scenarios

---

## **🚀 Next Steps**

1. **Start with Authentication** - Get user sign up/login working
2. **Replace Mock Data** - Connect product pages to real database
3. **Implement Cart** - Add persistent shopping cart functionality
4. **Add File Uploads** - Enable product images and prescriptions
5. **Test Everything** - Ensure all features work end-to-end

Remember to handle loading states and errors gracefully throughout the user experience!
