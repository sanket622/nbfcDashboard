import React, { useState } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const DeleteModal = ({ selectedUser, handleDelete, setDeleteModal }) => {
  const [reason, setReason] = useState('');

  const onReject = () => {
    if (reason.trim() === '') {
      // Optional: inline validation (remove if not needed)
      return;
    }
    handleDelete(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden animate-scale-in">
        <div className="p-4 bg-red-50 flex items-start space-x-3">
          <div className="text-red-500 flex-shrink-0 mt-0.5">
            <WarningAmberIcon />
          </div>
          <div>
            <h3 className="font-medium text-lg text-red-800">Reject Request</h3>
            <p className="text-red-600 mt-1">Are you sure you want to reject this product request?</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="text-sm text-gray-600 mb-2">
            <p className="font-medium">Name: {selectedUser?.name}</p>
          </div>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            rows={4}
            placeholder="Enter rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="p-4 flex space-x-3 justify-end bg-white">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setDeleteModal(false)}
          >
            Cancel
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Reject Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
