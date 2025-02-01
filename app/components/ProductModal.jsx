import React from 'react';

const ProductModal = ({ product, closeModal }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 overflow-auto bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-11/12 sm:w-1/2 relative shadow-lg">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 sm:h-64 object-cover rounded-md mb-4"
        />

        {/* Product Name */}
        <h2 className="text-lg sm:text-xl font-bold text-black mb-2">{product.name}</h2>

        {/* Product Description */}
        <div
          className="text-gray-700 leading-5 sm:leading-6 mb-4 text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: product.description }}
        ></div>

        {/* Close Button - Stays at Bottom for All Devices */}
        <button
          onClick={closeModal}
          className="mt-4 w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
