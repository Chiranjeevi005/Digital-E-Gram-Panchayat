import { downloadAccountData, deactivateAccount, deleteAccount } from '@/lib/accountManagement';

async function testAccountEndpoints() {
  console.log('Testing account management endpoints...');
  
  // Test download account data
  console.log('Testing download account data...');
  try {
    const downloadResult = await downloadAccountData();
    console.log('Download result:', downloadResult);
  } catch (error) {
    console.error('Error downloading account data:', error);
  }
  
  // Test deactivate account
  console.log('Testing deactivate account...');
  try {
    const deactivateResult = await deactivateAccount();
    console.log('Deactivate result:', deactivateResult);
  } catch (error) {
    console.error('Error deactivating account:', error);
  }
  
  // Test delete account
  console.log('Testing delete account...');
  try {
    const deleteResult = await deleteAccount();
    console.log('Delete result:', deleteResult);
  } catch (error) {
    console.error('Error deleting account:', error);
  }
  
  console.log('Account management endpoint tests completed.');
}

testAccountEndpoints();