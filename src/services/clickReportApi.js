import callApi from './apiService';

export function getTrackingClicks(params) {
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
        if (value != null && value !== '') query.set(name, value);
    }
    return callApi({ endpoint: `admin/clicks?${query}`, method: 'GET' });
}
