export default function Step3ConversionSettings({ form, onChange, disabled }) {
    return (
        <fieldset disabled={disabled} className="rounded-lg border border-slate-200 p-4 text-sm">
            <legend className="px-1 font-medium">Conversion settings</legend>
            <label className="mt-3 block">Approval
                <select className="ml-2" value={form.conversionApproval} onChange={e => onChange('conversionApproval', e.target.value)}>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                </select>
            </label>
            <label className="mt-2 block"><input type="checkbox" checked={form.sameClickIpBlock}
                onChange={e => onChange('sameClickIpBlock', e.target.checked)} /> Block duplicate click IPs</label>
            <label className="mt-2 block"><input type="checkbox" checked={form.sameConversionIpBlock}
                onChange={e => onChange('sameConversionIpBlock', e.target.checked)} /> Block duplicate conversion IPs</label>
        </fieldset>
    );
}
