import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { Cd, Bt, Md, ConfirmMd, Bg } from '../components/UI'
import { ROLE_COLORS, ROLES } from '../theme'
import api from '../services/api'

export default function Users({ theme, isDark }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.changeUserRole(userId, newRole)
      loadUsers()
      setShowRoleModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error changing role:', error)
    }
  }

  const handleRevokeUser = async (userId) => {
    try {
      await api.revokeUser(userId)
      loadUsers()
      setConfirmAction(null)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error revoking user:', error)
    }
  }

  const handleReactivateUser = async (userId) => {
    try {
      await api.reactivateUser(userId)
      loadUsers()
      setConfirmAction(null)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error reactivating user:', error)
    }
  }

  if (loading) {
    return <div style={{ color: theme.tM }}>Loading users...</div>
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: theme.tD, marginBottom: '24px' }}>
        Users ({users.length})
      </h2>

      {users.length === 0 ? (
        <Cd style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: theme.tM }}>No users found</p>
        </Cd>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.bdr}` }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>Department</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: `1px solid ${theme.bdr}`,
                    backgroundColor: selectedUser?.id === user.id ? theme.pL : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px', fontSize: '13px', color: theme.tD, fontWeight: 500 }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: theme.tM }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Bg
                      text={user.role}
                      bg={ROLE_COLORS[user.role] + '20'}
                      color={ROLE_COLORS[user.role]}
                      size="sm"
                    />
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: theme.tM }}>
                    {user.department}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: user.status === 'active' ? '#D1FAE5' : '#F3F4F6',
                        color: user.status === 'active' ? '#065F46' : '#374151',
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {user.status === 'active' && (
                        <>
                          <Bt
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setSelectedRole(user.role)
                              setShowRoleModal(true)
                            }}
                          >
                            <Ic name="edit" size={12} color={theme.p} />
                          </Bt>
                          <Bt
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setConfirmAction('revoke')
                            }}
                          >
                            <Ic name="x" size={12} color="white" />
                          </Bt>
                        </>
                      )}
                      {user.status === 'revoked' && (
                        <Bt
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setConfirmAction('reactivate')
                          }}
                        >
                          <Ic name="check" size={12} color="white" />
                        </Bt>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change role modal */}
      <Md
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false)
          setSelectedUser(null)
          setSelectedRole('')
        }}
        title="Change User Role"
        size="sm"
        actions={[
          <Bt
            key="cancel"
            variant="ghost"
            onClick={() => {
              setShowRoleModal(false)
              setSelectedUser(null)
              setSelectedRole('')
            }}
          >
            Cancel
          </Bt>,
          <Bt
            key="save"
            onClick={() => handleChangeRole(selectedUser.id, selectedRole)}
          >
            Change Role
          </Bt>,
        ]}
      >
        <p style={{ fontSize: '13px', color: theme.tM, marginBottom: '16px' }}>
          Select a new role for {selectedUser?.name}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: selectedRole === role.id ? `2px solid ${theme.p}` : `1px solid ${theme.bdr}`,
                backgroundColor: selectedRole === role.id ? theme.pL : theme.card,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: selectedRole === role.id ? 600 : 500,
                color: theme.tD,
              }}
            >
              {role.name}
            </button>
          ))}
        </div>
      </Md>

      {/* Confirm revoke */}
      <ConfirmMd
        isOpen={confirmAction === 'revoke'}
        title="Revoke User Access"
        message={`Are you sure you want to revoke access for ${selectedUser?.name}? They will not be able to log in.`}
        onConfirm={() => handleRevokeUser(selectedUser.id)}
        onCancel={() => {
          setConfirmAction(null)
          setSelectedUser(null)
        }}
        isDangerous={true}
      />

      {/* Confirm reactivate */}
      <ConfirmMd
        isOpen={confirmAction === 'reactivate'}
        title="Reactivate User"
        message={`Are you sure you want to reactivate ${selectedUser?.name}? They will be able to log in again.`}
        onConfirm={() => handleReactivateUser(selectedUser.id)}
        onCancel={() => {
          setConfirmAction(null)
          setSelectedUser(null)
        }}
      />
    </div>
  )
}
