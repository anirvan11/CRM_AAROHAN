'use client';
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const EditCustomerPopup = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({
    Person: '',
    'Company Name': '',
    Phone: '',
    Email: '',
    Products: {},
  });

  const [productOptions, setProductOptions] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load customer data
  useEffect(() => {
    if (customer) {
      const products = customer.Products || {};
      setFormData({
        Person: customer.Person || '',
        'Company Name': customer['Company Name'] || '',
        Phone: customer.Phone || '',
        Email: customer.Email || '',
        Products: products,
      });
      setSelectedProducts(Object.keys(products));
    }
  }, [customer]);

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'Product'));
        const names = snapshot.docs.map(doc => doc.data().name);
        setProductOptions(names);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductToggle = (product) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts(prev => prev.filter(p => p !== product));
      setFormData(prev => {
        const updated = { ...prev.Products };
        delete updated[product];
        return { ...prev, Products: updated };
      });
    } else {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleProductDetailsChange = (product, value) => {
    setFormData(prev => ({
      ...prev,
      Products: {
        ...prev.Products,
        [product]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!customer.id) return;
    try {
      await updateDoc(doc(db, 'Customers', customer.id), {
        Person: formData.Person,
        'Company Name': formData['Company Name'],
        Phone: formData.Phone,
        Email: formData.Email,
        Products: formData.Products,
      });
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4 text-black">
        <h2 className="text-lg font-semibold mb-4">Edit Customer</h2>

        <input
          type="text"
          name="Person"
          value={formData.Person || ''}
          onChange={handleChange}
          placeholder="Person"
          className="w-full p-2 border rounded text-black"
        />
        <input
          type="text"
          name="Company Name"
          value={formData['Company Name'] || ''}
          onChange={handleChange}
          placeholder="Company Name"
          className="w-full p-2 border rounded text-black"
        />
        <input
          type="text"
          name="Phone"
          value={formData.Phone || ''}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 border rounded text-black"
        />
        <input
          type="email"
          name="Email"
          value={formData.Email || ''}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded text-black"
        />

        <label className="block text-black">Products</label>
        <div className="relative mb-4">
          <button
            type="button"
            className="border p-2 w-full text-left bg-gray-100 rounded-md"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {selectedProducts.length > 0
              ? `Selected: ${selectedProducts.length}`
              : 'Select Products'}
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 bg-white border shadow-md rounded-md w-full mt-1 max-h-60 overflow-auto">
              {productOptions.map((product) => (
                <div key={product} className="flex items-center p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product)}
                    onChange={() => handleProductToggle(product)}
                    className="mr-2"
                  />
                  <span className="text-black">{product}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProducts.map((product) => (
          <div key={product} className="mb-2">
            <label className="block text-black">{product} Details:</label>
            <input
              type="text"
              className="border p-2 w-full text-black"
              value={formData.Products[product] || ''}
              onChange={(e) => handleProductDetailsChange(product, e.target.value)}
            />
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-black"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerPopup;
