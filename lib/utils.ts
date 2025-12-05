import * as fs from "fs/promises";

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
    switch (true) {
        case (ms >= 1000 && ms < 60000):
            return `${Math.floor(ms / 1000)}s`;
        case (ms >= 60000 && ms < 3600000):
            return `${Math.floor(ms / 60000)}m`;
        case (ms >= 3600000 && ms < 86400000):
            return `${Math.floor(ms / 3600000)}h`;
        case (ms >= 86400000):
        default:
            return `${ms}ms`;
    }
}

export async function checkDirectoryExists(path: string): Promise<boolean> {
    if (!path.length) return false;

    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}