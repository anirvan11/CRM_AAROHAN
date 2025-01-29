import React from 'react';

const ProductModal = ({ product, closeModal }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/2 relative">
        <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded mb-4" />
        <h2 className="text-xl font-bold text-black mb-2">{product.name}</h2>
        {/* Updated Description Section */}
        <div
          className="text-gray-700 leading-6 mb-4"
          dangerouslySetInnerHTML={{ __html: product.description }}
        ></div>
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
