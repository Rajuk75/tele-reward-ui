import { useQuery } from '@tanstack/react-query';
import { getPayouts } from '../../../../services/AppService';

export default function usePayouts(filters) {
    return useQuery({
        queryKey: ['admin-payouts', filters],
        queryFn: async () => (await getPayouts(filters)).data.data,
    });
}
