export function display(value) {
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    if (value == null || value === '') return 'Not set';
    return value;
}

export function dateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return <time dateTime={value} title={value}>{date.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
    })}</time>;
}

