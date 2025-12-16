interface Properties {
    width?: number;
    height?: number;
    [key: string]: any;
}

export default function Icon({ width = 150, height = 150, ...rest }: Properties) {
    return (
        <svg width={width} height={height} viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
            <path d="M0 47.3684C0 21.2076 21.2076 0 47.3684 0H102.632C128.792 0 150 21.2076 150 47.3684V102.632C150 128.792 128.792 150 102.632 150H47.3684C21.2076 150 0 128.792 0 102.632V47.3684Z" fill="url(#paint0_linear_11_81)"/>
            <path d="M107.842 70.8553C108.424 69.3468 108.75 67.6974 108.75 65.9774C108.75 58.5056 102.65 52.4436 95.1316 52.4436C92.337 52.4436 89.7268 53.2895 87.5705 54.7274C83.641 47.9605 76.307 43.4211 67.8947 43.4211C55.3544 43.4211 45.1974 53.515 45.1974 65.9774C45.1974 66.3581 45.2116 66.7387 45.2257 67.1194C37.2817 69.8966 31.5789 77.4248 31.5789 86.2782C31.5789 97.4859 40.7288 106.579 52.0066 106.579H104.211C114.24 106.579 122.368 98.5009 122.368 88.5338C122.368 79.8073 116.127 72.5188 107.842 70.8553Z" fill="white"/>
            <defs>
                <linearGradient id="paint0_linear_11_81" x1="75" y1="0" x2="75" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA" />
                    <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
            </defs>
        </svg>
    );
}