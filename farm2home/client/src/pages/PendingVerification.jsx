import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function PendingVerification({ status, reason }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
        {status === 'rejected' ? (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Rejected</h2>
            <p className="text-gray-500 text-sm mb-4">Your account has been rejected by the admin.</p>
            {reason && (
              <div className="bg-red-50 rounded-lg p-4 mb-4 text-sm text-red-700">
                <p className="font-medium mb-1">Reason:</p>
                <p>{reason}</p>
              </div>
            )}
            <p className="text-gray-400 text-xs mb-6">Please contact admin for more information.</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Pending Verification</h2>
            <p className="text-gray-500 text-sm mb-4">Your account is under review by the admin.</p>
            <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-sm text-yellow-700">
              <p>You will be able to access the platform once your account is verified. This usually takes a few hours.</p>
            </div>
          </>
        )}
        <button onClick={() => { logout(); navigate('/login') }}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">
          Back to Login
        </button>
      </div>
    </div>
  )
}
