export function formatBytes(bytes: number): string {
    if (!bytes) return "0 B";

    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const size = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, size)).toFixed(2)} ${sizes[size]}`;
}