import React, { useEffect, useState } from "react";
import { db } from "../firebase/config"; // Replace with your Firebase config file
import { collection, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";

const AddCustomerForm = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formData, setFormData] = useState({
    Allocation: "",
    Branch: "",
    "Company Name": "",
    Email: "",
    Person: "",
    Phone: "",
    Products: {},
    Status: "Pending",
    createdAt: null,
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const productOptions = [
    "Diesel generating set",
    "Retrofit emission control device (RECD)",
    "Insulated tools",
    "Sparkless tools",
    "Overhead light insulation cover",
    "Firepress high temperature indication system",
    "CME- SERTEC advance lightning system",
    "Cable jointing kits",
    "Heat shrink angle boots",
    "Heat shrink cable repair sleeve",
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs
          .map((doc) => ({
            uid: doc.id,
            Name: doc.data().Name,
            Role: doc.data().Role,
            Branch: doc.data().Branch,
          }))
          .filter((user) => user.Role !== "Admin");
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (formData.Branch) {
      setFilteredUsers(users.filter((user) => user.Branch === formData.Branch));
    } else {
      setFilteredUsers([]);
    }
  }, [formData.Branch, users]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (product) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts((prev) => prev.filter((item) => item !== product));
      setFormData((prev) => {
        const updatedProducts = { ...prev.Products };
        delete updatedProducts[product];
        return { ...prev, Products: updatedProducts };
      });
    } else {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const handleProductDetailsChange = (product, details) => {
    setFormData((prev) => ({
      ...prev,
      Products: {
        ...prev.Products,
        [product]: details,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await setDoc(doc(db, "Customers", formData["Company Name"]), {
        ...formData,
        Quotation: { Left: 0, Paid: 0, Total: 0 },
        createdAt: serverTimestamp(),
      });
      alert("Customer added successfully!");
      setFormData({
        Allocation: "",
        Branch: "",
        "Company Name": "",
        Email: "",
        Person: "",
        Phone: "",
        Products: {},
        Status: "Pending",
        createdAt: null,
      });
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  return (
    <div className="mt-0 p-4 bg-white rounded-lg shadow max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4 text-black">Add Customer</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-black">Organization</label>
        <select
          name="Branch"
          value={formData.Branch}
          onChange={handleChange}
          className="border p-2 w-full mb-4 text-black"
        >
          <option value="">Select an Organization</option>
          <option value="North">3s Sales Corporation</option>
          <option value="North2">3s Enterprises</option>
          <option value="Pune">Aarohan</option>
        </select>

        <label className="block mb-2 text-black">Allocation</label>
        <select
          className="border p-2 w-full mb-4 text-black"
          name="Allocation"
          value={formData.Allocation}
          onChange={handleChange}
        >
          <option value="">Select a user</option>
          {filteredUsers.map((user) => (
            <option key={user.uid} value={user.uid}>
              {user.Name}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-black">Company Name</label>
        <input
          className="border p-2 w-full mb-4 text-black"
          type="text"
          name="Company Name"
          value={formData["Company Name"]}
          onChange={handleChange}
        />

        <label className="block mb-2 text-black">Email</label>
        <input
          className="border p-2 w-full mb-4 text-black"
          type="email"
          name="Email"
          value={formData.Email}
          onChange={handleChange}
        />

        <label className="block mb-2 text-black">Person</label>
        <input
          className="border p-2 w-full mb-4 text-black"
          type="text"
          name="Person"
          value={formData.Person}
          onChange={handleChange}
        />

        <label className="block mb-2 text-black">Phone</label>
        <input
          className="border p-2 w-full mb-4 text-black"
          type="number"
          name="Phone"
          value={formData.Phone}
          onChange={handleChange}
        />

        <label className="block text-gray-700">Products</label>
        <div className="relative mb-4">
          <button
            type="button"
            className="border p-2 w-full text-left bg-gray-100 rounded-md"
            onClick={() => setProductDropdownOpen((prev) => !prev)}
          >
            {selectedProducts.length > 0
              ? `Selected: ${selectedProducts.length} products`
              : "Select Products"}
          </button>
          {productDropdownOpen && (
            <div className="absolute z-10 bg-white border shadow-lg rounded-md w-full mt-1 max-h-60 overflow-auto">
              {productOptions.map((product) => (
                <div key={product} className="flex items-center p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedProducts.includes(product)}
                    onChange={() => handleProductToggle(product)}
                  />
                  <span className="text-gray-800">{product}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedProducts.map((product) => (
          <div key={product} className="flex items-center mb-2">
            <label className="mr-2 text-black">{product} Details:</label>
            <input
              type="text"
              className="border p-2 w-full text-black"
              value={formData.Products[product] || ""}
              onChange={(e) => handleProductDetailsChange(product, e.target.value)}
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Customer
        </button>
      </form>
    </div>
  );
};

export default AddCustomerForm;
