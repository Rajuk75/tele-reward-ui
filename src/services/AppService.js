import callApi from './apiService';
import { showNotification } from '../components/Toastify/Toast';

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildQuery(params = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : '';
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  try {
    const response = await callApi({
      endpoint: 'user/login',
      method: 'POST',
      body: { user: { email, password: btoa(password) } },
    });
    const { token, user } = response.data?.data || {};
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || {}));
      showNotification(response.data?.message || "Login successful! Welcome back.", 'success');
    }
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  try {
    return await callApi({
      endpoint: 'admin/dashboard/stats',
      method: 'GET',
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// ── Users & Team ──────────────────────────────────────────────────────────────

export async function getAllUsers(params = {}) {
  try {
    return await callApi({
      endpoint: `user/get-all-users${buildQuery(params)}`,
      method: 'GET',
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function searchUsers(q) {
  try {
    return await callApi({
      endpoint: `admin/user/search?q=${encodeURIComponent(q)}`,
      method: 'GET',
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function createAdmin(data) {
  try {
    const response = await callApi({
      endpoint: 'user/create-admin',
      method: 'POST',
      body: data,
    });
    showNotification(response.data?.message || 'Admin created successfully', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    const response = await callApi({
      endpoint: `admin/users/${userId}`,
      method: 'DELETE'
    });
    showNotification(response.data?.message || 'User deleted', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

export async function createCampaign(data) {
  try {
    const response = await callApi({
      endpoint: 'admin/campaigns',
      method: 'POST',
      body: data,
    });
    showNotification(response.data?.message || 'Campaign created successfully', 'success');
    return response;
  } catch (error) {
    showNotification(error.message || 'Failed to create campaign', 'error');
    throw error;
  }
}

export async function getCampaigns(params = {}) {
  try {
    return await callApi({
      endpoint: `admin/campaigns${buildQuery(params)}`,
      method: 'GET',
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function getCampaignById(id) {
  try {
    return await callApi({
      endpoint: `admin/campaigns/${id}`,
      method: 'GET',
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function getAvailableCampaigns() {
  try {
    return await callApi({
      endpoint: 'admin/campaigns/available',
      method: 'GET',
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function updateCampaign(id, data) {
  try {
    const response = await callApi({
      endpoint: `admin/campaigns/${id}`,
      method: 'PUT',
      body: data,
    });
    showNotification(response.data?.message || 'Campaign updated', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function deleteCampaign(id) {
  try {
    const response = await callApi({
      endpoint: `admin/campaigns/${id}`,
      method: 'DELETE',
    });
    showNotification(response.data?.message || 'Campaign deleted', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function searchCampaigns(q = '') {
  try {
    return await callApi({
      endpoint: `admin/campaigns?search=${encodeURIComponent(q)}&limit=10`,
      method: 'GET',
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// ── Offers ────────────────────────────────────────────────────────────────────

export async function createOffer(data) {
  try {
    const response = await callApi({
      endpoint: 'admin/offers',
      method: 'POST',
      body: data
    });
    showNotification(response.data?.message || 'Offer created successfully', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function getOffers(params = {}) {
  try {
    return await callApi({
      endpoint: `admin/offers${buildQuery(params)}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function searchOffers(q = '') {
  try {
    return await callApi({
      endpoint: `admin/offers/search${buildQuery({ q })}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function deleteOffer(id) {
  try {
    const response = await callApi({
      endpoint: `admin/offers/${id}`,
      method: 'DELETE'
    });
    showNotification(response.data?.message || 'Offer deleted successfully', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function updateOfferStatus(id, data) {
  try {
    const response = await callApi({
      endpoint: `admin/offers/${id}/status`,
      method: 'PATCH',
      body: data
    });
    showNotification(response.data?.message || 'Offer status updated', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function updateOfferBackground(id, backgroundImage) {
  try {
    const response = await callApi({
      endpoint: `admin/offers/${id}/background`,
      method: 'PATCH',
      body: { backgroundImage }
    });
    showNotification(response.data?.message || 'Offer background updated', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// ── Files & Uploads ───────────────────────────────────────────────────────────

export async function uploadFile(file, folder = 'campaigns') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await callApi({
      endpoint: 'upload',
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// ── Conversions & Payouts ─────────────────────────────────────────────────────

export async function getConversionById(id) {
  try {
    return await callApi({
      endpoint: `admin/conversions/${id}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function getConversionSignedUrl(url) {
  try {
    return await callApi({
      endpoint: `admin/conversions/signed-url?url=${encodeURIComponent(url)}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function getS3SignedUrl(url) {
  try {
    return await callApi({
      endpoint: `admin/signed-url?url=${encodeURIComponent(url)}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function getConversions(params = {}) {
  try {
    return await callApi({
      endpoint: `admin/conversions${buildQuery(params)}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function getConversionRevenue(params = {}) {
  try {
    return await callApi({
      endpoint: `admin/conversions/revenue${buildQuery(params)}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function approveConversion(id, adminNote) {
  try {
    const response = await callApi({
      endpoint: `admin/conversions/${id}/approve`,
      method: 'PATCH',
      body: { adminNote }
    });
    showNotification(response.data?.message || 'Conversion approved', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function rejectConversion(id, adminNote) {
  try {
    const response = await callApi({
      endpoint: `admin/conversions/${id}/reject`,
      method: 'PATCH',
      body: { adminNote }
    });
    showNotification(response.data?.message || 'Conversion rejected', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function approveProof(trackingId, eventId, adminNote = '') {
  try {
    const response = await callApi({
      endpoint: 'admin/events/approve-proof',
      method: 'PATCH',
      body: { trackingId, eventId, adminNote }
    });
    showNotification(response.data?.message || 'Proof approved', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

export async function rejectProof(trackingId, eventId, adminNote, reuploadAllowed = false) {
  try {
    const response = await callApi({
      endpoint: 'admin/events/reject-proof',
      method: 'PATCH',
      body: { trackingId, eventId, adminNote, reuploadAllowed }
    });
    showNotification(response.data?.message || 'Proof rejected', 'success');
    return response;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// ── Postback Logs ─────────────────────────────────────────────────────────────

export async function getPostbackLogs(params = {}) {
  try {
    return await callApi({
      endpoint: `admin/postbacks${buildQuery(params)}`,
      method: 'GET'
    });
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}
