import { useQuery } from '@tanstack/react-query';
import { getConversions } from '../../../../services/AppService';

export default function useConversions(filters) {
    return useQuery({
        queryKey: ['admin-conversions', filters],
        queryFn: async () => (await getConversions(filters)).data.data,
    });
}
