import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Modal from 'react-modal';

// Initialize a default state for a donation
const initialDonation = {
  donationId: '',
  isbn: '',
  bookName: '',
  author: '',
  donationType: '',
};

Modal.setAppElement('#root');

function App() {
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState(initialDonation);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDonations = async (donationId) => {
    try {
      const response = await axios.get(`http://localhost:8080/donations/${donationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting donation with ID: ${donationId}`, error);
      alert('Error retrieving donation by ID');
    }
  };
// This code checks if `selectedDonation` is correctly set when the modal is opened
const handleGetDetails = async () => {
  const donationId = searchTerm.trim();
  if (donationId) {
    const donation = await fetchDonations(donationId);
    if (donation) {
      console.log("Fetched Donation:", donation); // Debugging line
      setSelectedDonation(donation);
      setModalIsOpen(true);
    } else {
      alert("Donation not found.");
    }
  } else {
    alert("Please enter a valid Donation ID.");
  }
};

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setSelectedDonation((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/donations', form);
      setDonations([...donations, response.data]);
      alert('Donation created successfully');
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Error creating donation');
    }
  };

  const handleUpdateDonation = async () => {
    if (selectedDonation) {
      const donationId = selectedDonation.donationId || selectedDonation.id; // Adjust this line to the correct field
      if (!donationId) {
        console.error("Invalid Donation ID for update", selectedDonation);
        alert("Invalid Donation ID for update");
        return;
      }
  
      try {
        await axios.put(`http://localhost:8080/donations/${donationId}`, selectedDonation);
        alert('Donation updated successfully');
      } catch (error) {
        console.error(`Error updating donation with ID: ${donationId}`, error);
        alert('Error updating donation');
      }
    } else {
      console.error("No donation selected for update");
      alert("No donation selected for update");
    }
  };
  
  
  const handleDelete = async (donationId) => {
    try {
      await axios.delete(`http://localhost:8080/donations/${donationId}`);
      setDonations((prev) => prev.filter((d) => d.id !== donationId)); // Remove deleted donation from state
      alert('Donation deleted successfully');
    } catch (error) {
      console.error(`Error deleting donation with ID: ${donationId}`, error);
      alert('Error deleting donation');
    }
  };

  const filteredDonations = donations.filter((d) =>
    d.bookName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <h1>Donation Management</h1>

      <div className="donation-box">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            placeholder="ISBN"
            required
          />
          <input
            type="text"
            name="bookName"
            value={form.bookName}
            onChange={handleChange}
            placeholder="Book Name"
            required
          />
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Author"
            required
          />
          <select
            name="donationType"
            value={form.donationType}
            onChange={handleChange}
          >
            <option value="">Select Donation Type</option>
            <option value="Cash">Cash</option>
            <option value="Book">Book</option>
          </select>
          <button type="submit" className="blue-btn">Donate</button>
        </form>

        <button onClick={handleGetDetails} className="blue-btn">Get Donation Details</button>
        <input
          type="text"
          placeholder="Search by Donation ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul>
        {filteredDonations.map((d) => (
          <li key={d.id}>
            {d.bookName} by {d.author} ({d.donationType}) - ISBN: {d.isbn}
            <button onClick={() => handleDelete(d.id)} className="blue-btn">Cancel Order</button>
          </li>
        ))}
      </ul>

      <Modal
  isOpen={modalIsOpen}
  onRequestClose={() => setModalIsOpen(false)}
>
  <h2>Donation Details</h2>
  {selectedDonation ? (
    <form>
      <div>
        <label><strong>ISBN:</strong></label>
        <input
          type="text"
          name="isbn"
          value={selectedDonation.isbn || ''}
          onChange={handleChange}
        />
      </div>
      <div>
        <label><strong>Book Name:</strong></label>
        <input
          type="text"
          name="bookName"
          value={selectedDonation.bookName || ''}
          onChange={handleChange}
        />
      </div>
      <div>
        <label><strong>Author:</strong></label>
        <input
          type="text"
          name="author"
          value={selectedDonation.author || ''}
          onChange={handleChange}
        />
      </div>
      <div>
        <label><strong>Donation Type:</strong></label>
        <select
          name="donationType"
          value={selectedDonation.donationType || ''}
          onChange={handleChange}
        >
          <option value="">Select Donation Type</option>
          <option value="Cash">Cash</option>
          <option value="Book">Book</option>
        </select>
      </div>
    </form>
  ) : (
    <p>No donation details found.</p>
  )}

  <div>
    <button
      onClick={() => setModalIsOpen(false)}
      style={{ backgroundColor: 'green', color: 'white' }}
    >
      Close
    </button>
    <button
      onClick={handleUpdateDonation}
      style={{ backgroundColor: 'green', color: 'white' }}
    >
      Update
    </button>
  </div>
</Modal>

    </div>
  );
}

export default App;
