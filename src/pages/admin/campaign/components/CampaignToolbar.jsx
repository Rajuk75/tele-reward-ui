import { CampaignSearchDropdown, FilterDropdown } from '../../common/AdminUI';
import { CAMPAIGN_CATEGORIES } from '../hooks/useCampaigns';

export default function CampaignToolbar({
    selectedCampaign,
    onSelectCampaign,
    onClearCampaign,
    filterStatus,
    onChangeStatus,
    filterCategory,
    onChangeCategory,
    tc
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[300px]">
                <CampaignSearchDropdown
                    selectedCampaign={selectedCampaign}
                    onSelect={onSelectCampaign}
                    onClear={onClearCampaign}
                    tc={tc}
                />
            </div>

            <FilterDropdown
                options={[
                    { value: '', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ]}
                value={filterStatus}
                onChange={onChangeStatus}
                placeholder="All Status"
                tc={tc}
                className="w-40"
            />

            <FilterDropdown
                options={[
                    { value: '', label: 'All Categories' },
                    ...CAMPAIGN_CATEGORIES.map((cat) => ({
                        value: cat,
                        label: cat.charAt(0).toUpperCase() + cat.slice(1)
                    }))
                ]}
                value={filterCategory}
                onChange={onChangeCategory}
                placeholder="All Categories"
                tc={tc}
                className="w-48"
            />
        </div>
    );
}
