import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { httpGet } from '../../Services/APIService';
import { API_ENDPOINT } from '../../Constants/Environment.constants';

const DEVICES_API_URI = '/devices';
const BOOKINGS_API_URI = '/bookings';

const Container = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #555;
  display: block;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th`
  background-color: #007bff;
  color: white;
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  background-color: ${(props) => (props.primary ? '#007bff' : '#6c757d')};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
  &:hover {
    opacity: 0.9;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  margin-top: 10px;
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 400px;
  text-align: center;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const CheckOut = () => {
  const [roomNumber, setRoomNumber] = useState('');
  const [_unused, setAllRoomNumbers] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllRoomsData();
  }, []);

  const handleRoomNumberChange = async (event) => {
    const value = event.target.value;
    setRoomNumber(value);

    if (value) {
      try {
        const bookingData = await httpGet(`${API_ENDPOINT}${BOOKINGS_API_URI}/${value}`);
        setBookingDetails(bookingData);
        setRequests(bookingData.requests || []);
        setError(null);
      } catch {
        setError('Invalid room number or no booking found.');
        setBookingDetails(null);
        setRequests([]);
      }
    } else {
      setBookingDetails(null);
      setRequests([]);
      setError(null);
    }
  };

  const getAllRoomsData = async () => {
    const allRoomsData = await httpGet(API_ENDPOINT + DEVICES_API_URI);
    const allRoomNumbers = allRoomsData.map((room) => room.roomId);
    setAllRoomNumbers(allRoomNumbers);
  };

  const handleGuestCheckOut = () => {
    setShowModal(true);
  };

  const confirmCheckOut = () => {
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Container>
      <Title>Guest Check-Out</Title>

      <Label>Room Number:</Label>
      <Input
        type="text"
        placeholder="Enter Room Number"
        value={roomNumber}
        onChange={handleRoomNumberChange}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {bookingDetails && (
        <div>
          <h3>Booking Details</h3>
          <p>
            <strong>Guest Name:</strong> {bookingDetails.guestName}
          </p>
          <p>
            <strong>Check-in Date:</strong> {bookingDetails.checkInDate}
          </p>
          <p>
            <strong>Check-out Date:</strong> {bookingDetails.checkOutDate}
          </p>

          <h3>Requests Placed</h3>
          <Table>
            <thead>
              <tr>
                <TableHeader>Request</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Amount</TableHeader>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={index}>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.status}</TableCell>
                  <TableCell>{request.amount}</TableCell>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button primary onClick={handleGuestCheckOut}>
            Check Out
          </Button>
        </div>
      )}

      {showModal && (
        <>
          <Overlay onClick={closeModal} />
          <ConfirmationModal>
            <p>Are you sure you want to check out this guest?</p>
            <Button primary onClick={confirmCheckOut}>
              Confirm
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ConfirmationModal>
        </>
      )}
    </Container>
  );
};

export default CheckOut;
