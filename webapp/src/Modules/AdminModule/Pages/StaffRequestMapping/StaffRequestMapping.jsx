import React, { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../../../../Constants/Environment.constants';
import { httpGet, httpPost } from '../../../../Services/APIService';
import Select from 'react-select';
const ROOMS_API_URI = '/devices';
const STAFF_API_URI = '/staff';
const MAPPING_API_URI = '/mapping';

const StaffRequestMapping = () => {
  const [staffMappings, setStaffMappings] = useState([]);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [requestType, setRequestType] = useState('');
  const [managerName, setManagerName] = useState('');
  const [escalationPhone, setEscalationPhone] = useState('');
  const [escalationTime, setEscalationTime] = useState(''); // Escalation time in minutes
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [departments] = useState([
    'House Keeping',
    'Maintenance',
    'Room Service',
    'Front Desk',
    'Security',
  ]);
  const [availableRooms, setAvailableRooms] = useState([]); // Example room numbers
  const [staffList, setStaffList] = useState([]); // Predefined staff list with names and phone numbers
  const [managerList, setManagerList] = useState([]); // Predefined manager list with names and phone numbers

  useEffect(() => {
    const getAllRoomsData = async () => {
      const rooms = await httpGet(API_ENDPOINT + ROOMS_API_URI);
      setAvailableRooms(rooms.sort((b, a) => b.roomId - a.roomId).map((r) => r.roomId));
    };
    const fetchStaffList = async () => {
      const response = await httpGet(API_ENDPOINT + STAFF_API_URI);
      const staffData = response && response.staffData ? response.staffData : [];
      setStaffList(staffData);

      const managerData = staffData.filter(
        (staff) =>
          staff && staff.role && staff.role.toLocaleString().toLocaleLowerCase().includes('manager')
      );
      setManagerList(managerData);
    };
    const getMappings = async () => {
      const { mappingData } = await httpGet(API_ENDPOINT + MAPPING_API_URI, true);
      setStaffMappings(mappingData || []);
    };
    getMappings();
    fetchStaffList();
    getAllRoomsData();
  }, []);

  const handleAddOrUpdateMapping = () => {
    if (!staffName || !staffPhone || selectedRooms.length === 0 || !requestType) {
      alert('All fields are required!');
      return;
    }

    const newMapping = {
      staffName,
      staffPhone,
      rooms: selectedRooms,
      requestType,
      managerName,
      escalationPhone,
      escalationTime,
      isActive: true, // Default to active
    };

    if (isEditing) {
      const updatedMappings = [...staffMappings];
      updatedMappings[editingIndex] = newMapping;
      setStaffMappings(updatedMappings);
      setIsEditing(false);
      setEditingIndex(null);
      httpPost(API_ENDPOINT + MAPPING_API_URI, updatedMappings);
    } else {
      const updatedMappings = [...staffMappings, newMapping];
      setStaffMappings(updatedMappings);
      httpPost(API_ENDPOINT + MAPPING_API_URI, updatedMappings);
    }

    setStaffName('');
    setStaffPhone('');
    setSelectedRooms([]);
    setRequestType('');
    setManagerName('');
    setEscalationPhone('');
    setEscalationTime('');
  };

  const handleEditMapping = (index) => {
    const mapping = staffMappings[index];
    setStaffName(mapping.staffName);
    setStaffPhone(mapping.staffPhone);
    setSelectedRooms(mapping.rooms);
    setRequestType(mapping.requestType);
    setManagerName(mapping.managerName);
    setEscalationPhone(mapping.escalationPhone);
    setEscalationTime(mapping.escalationTime);
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDeleteMapping = (index) => {
    const updatedMappings = staffMappings.filter((_, i) => i !== index);
    setStaffMappings(updatedMappings);
    httpPost(API_ENDPOINT + MAPPING_API_URI, updatedMappings);
  };

  const handleToggleMappingStatus = (index) => {
    const updatedMappings = [...staffMappings];
    updatedMappings[index].isActive = !updatedMappings[index].isActive;
    setStaffMappings(updatedMappings);
    httpPost(API_ENDPOINT + MAPPING_API_URI, updatedMappings);
  };

  const handleRoomSelectionChange = (e) => {
    const selectedOptions = Array.from(e, (option) => Number(option.value));
    setSelectedRooms(selectedOptions);
  };

  const handleStaffNameChange = (e) => {
    const selectedName = e.target.value;
    setStaffName(selectedName);

    // Autofill staff phone number based on the selected name
    const staff = staffList.find((s) => s.name === selectedName);
    if (staff) {
      setStaffPhone(staff.phone);
    } else {
      setStaffPhone(''); // Clear phone number if no match
    }
  };

  const handleManagerNameChange = (e) => {
    const selectedName = e.target.value;
    setManagerName(selectedName);

    // Autofill escalation phone number based on the selected manager's name
    const manager = managerList.find((m) => m.name === selectedName);
    if (manager) {
      setEscalationPhone(manager.phone);
    } else {
      setEscalationPhone(''); // Clear phone number if no match
    }
  };

  const headers = [
    'Staff Name',
    'Phone',
    'Rooms',
    'Department',
    'Manager',
    'Escalation Phone',
    'Escalation Time',
    'Status',
    'Actions',
  ];

  const filterStaffList = () => {
    let filteredStaffList;
    filteredStaffList = staffList.filter(
      (staff) =>
        staff && staff.department && (requestType === '' || staff.department.includes(requestType))
    );
    return filteredStaffList;
  };

  return (
    <div style={containerStyle}>
      <h2
        style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '20px',
        }}
      >
        Staff Request Mapping
      </h2>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Request Type (Department):
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select a Department</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Staff Name:
          <select value={staffName} onChange={handleStaffNameChange} style={selectStyle}>
            <option value="">Select a Staff Member</option>
            {filterStaffList().map((staff, index) => (
              <option key={index} value={staff.name}>
                {staff.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Staff Phone Number:
          <input type="text" value={staffPhone} readOnly style={staffPhoneNumberInputStyle} />
        </label>
        <label
          htmlFor="roomIds"
          style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}
        >
          Room Numbers:
          <Select
            id="roomIds"
            isMulti
            options={availableRooms.map((room) => ({ value: room, label: room }))}
            value={selectedRooms.map((roomId) => ({ value: roomId, label: roomId }))}
            onChange={handleRoomSelectionChange}
            placeholder="Select Roles"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Manager Name (for Escalation):
          <select value={managerName} onChange={handleManagerNameChange} style={selectStyle}>
            <option value="">Select a Manager</option>
            {managerList.map((manager, index) => (
              <option key={index} value={manager.name}>
                {manager.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Escalation Phone Number:
          <input
            type="text"
            value={escalationPhone}
            readOnly
            style={{
              ...selectStyle,
              backgroundColor: '#f0f0f0',
              cursor: 'not-allowed',
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Escalation Time (in minutes):
          <input
            type="number"
            value={escalationTime}
            onChange={(e) => setEscalationTime(e.target.value)}
            style={selectStyle}
          />
        </label>
        <button type="button" onClick={handleAddOrUpdateMapping} style={button4Style}>
          {isEditing ? 'Update Mapping' : 'Add Mapping'}
        </button>
      </form>

      <h3 style={{ textAlign: 'center', color: '#333', marginTop: '20px' }}>Mappings</h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
        }}
      >
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={tdStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staffMappings.map((mapping, index) => (
            <tr key={index}>
              <td style={tdStyle}>{mapping.staffName}</td>
              <td style={tdStyle}>{mapping.staffPhone}</td>
              <td style={tdStyle}>{mapping.rooms.join(', ')}</td>
              <td style={tdStyle}>{mapping.requestType}</td>
              <td style={tdStyle}>{mapping.managerName}</td>
              <td style={tdStyle}>{mapping.escalationPhone}</td>
              <td style={tdStyle}>{mapping.escalationTime || 'N/A'}</td>
              <td
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  color: mapping.isActive ? 'green' : 'red',
                }}
              >
                {mapping.isActive ? 'Active' : 'Inactive'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                <button onClick={() => handleEditMapping(index)} style={button1Style}>
                  Edit
                </button>
                <button onClick={() => handleDeleteMapping(index)} style={button2Style}>
                  Delete
                </button>
                <button
                  onClick={() => handleToggleMappingStatus(index)}
                  style={button3Style(mapping)}
                >
                  {mapping.isActive ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const tdStyle = {
  border: '1px solid #ccc',
  padding: '10px',
};

const button1Style = {
  backgroundColor: '#FFC107',
  color: 'black',
  padding: '5px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  marginRight: '5px',
};

const button2Style = {
  backgroundColor: '#FF4136',
  color: 'white',
  padding: '5px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '12px',
  marginRight: '5px',
};

const button3Style = (mapping) => {
  return {
    backgroundColor: mapping.isActive ? '#6c757d' : '#28a745',
    color: 'white',
    padding: '5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
  };
};

const button4Style = {
  backgroundColor: '#007BFF',
  color: 'white',
  padding: '10px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
};

const containerStyle = {
  fontFamily: "'Arial', sans-serif",
  margin: '20px',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

const selectStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '5px',
};

const staffPhoneNumberInputStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: '#f0f0f0',
  cursor: 'not-allowed',
};

// const roomNumberSelectStyle = {
//   padding: '8px',
//   border: '1px solid #ccc',
//   borderRadius: '5px',
//   height: '100px',
// };

export default StaffRequestMapping;
