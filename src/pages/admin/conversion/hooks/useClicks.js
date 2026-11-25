import { useQuery } from '@tanstack/react-query';
import { getTrackingClicks } from '../../../../services/clickReportApi';

export default function useClicks(filters) {
    return useQuery({
        queryKey: ['admin-clicks', filters],
        queryFn: async () => (await getTrackingClicks(filters)).data.data,
    });
}
