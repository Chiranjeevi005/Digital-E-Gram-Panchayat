/**
 * Account Management Functions
 * 
 * This file contains functions for handling account management features:
 * - Downloading account data
 * - Deactivating accounts
 * - Deleting accounts
 */

/**
 * Download user's account data
 */
export async function downloadAccountData() {
  try {
    const response = await fetch('/api/user/account/data')
    
    if (response.ok) {
      const data = await response.json()
      const jsonData = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return { success: true, message: 'Account data downloaded successfully' }
    } else {
      const errorData = await response.json()
      return { success: false, message: errorData.error || 'Failed to download account data' }
    }
  } catch (err) {
    console.error('Error downloading account data:', err)
    return { success: false, message: 'Failed to download account data' }
  }
}

/**
 * Deactivate user's account
 */
export async function deactivateAccount() {
  try {
    const response = await fetch('/api/user/deactivate', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      return { success: true, message: 'Account deactivated successfully' }
    } else {
      const errorData = await response.json()
      return { success: false, message: errorData.error || 'Failed to deactivate account' }
    }
  } catch (err) {
    console.error('Error deactivating account:', err)
    return { success: false, message: 'Failed to deactivate account' }
  }
}

/**
 * Delete user's account
 */
export async function deleteAccount() {
  try {
    const response = await fetch('/api/user/account/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      return { success: true, message: 'Account deleted successfully' }
    } else {
      const errorData = await response.json()
      return { success: false, message: errorData.error || 'Failed to delete account' }
    }
  } catch (err) {
    console.error('Error deleting account:', err)
    return { success: false, message: 'Failed to delete account' }
  }
}