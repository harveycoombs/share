export function formatBytes(bytes: number): string {
    if (!bytes) return "0 B";

    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const size = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, size)).toFixed(2)} ${sizes[size]}`;
}

export function generateCode(length: number = 6): number {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
}

export function formatNumber(raw: number): string {
    const formatter = new Intl.NumberFormat("en-US");
    return formatter.format(raw);
}

export function formatTime(ms: number): string {
    const units = [
        { value: 24 * 60 * 60 * 1000, label: "d" },
        { value: 60 * 60 * 1000, label: "h" },
        { value: 60 * 1000, label: "m" },
        { value: 1000, label: "s" },
        { value: 1, label: "ms" }
    ];

    let remaining = ms;
    let result = "";
    let started = false;

    for (let { value, label } of units) {
        const count = Math.floor(remaining / value);
        remaining %= value;
        
        if (count > 0 || started) {
            result += `${count}${label}`;

            if (remaining > 0) result += " ";
            started = true;
        }
    }

    return result.trim().length ? result : "0s";
}