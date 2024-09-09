type Props = {
    color?: string,
    className?: string,
    version?: "network"|"nodes"
}

export default function NetImg({color, className, version}:Props) {
    if (version === "network" || version === undefined) {
        return (
            <svg id="network" xmlns="http://www.w3.org/2000/svg" viewBox="-4 -2 370 910" style={{stroke: color ? color : 'white', fill: 'none', strokeWidth: '6px'}} className={className}>
                <circle cx="80.87" cy="80.87" r="80.37"/>
                <circle cx="80.87" cy="266.48" r="80.37"/>
                <circle cx="80.87" cy="452.1" r="80.37"/>
                <circle cx="80.87" cy="637.86" r="80.37"/>
                <circle cx="80.87" cy="823.61" r="80.37"/>
                <line x1="365.93" y1="266.48" x2="161.24" y2="80.87"/>
                <line x1="365.93" y1="452.1" x2="161.24" y2="80.87"/>
                <line x1="365.93" y1="637.86" x2="161.24" y2="80.87"/>
                <line x1="365.93" y1="823.61" x2="161.24" y2="80.87"/>
                <line x1="365.93" y1="80.87" x2="161.24" y2="266.48"/>
                <line x1="365.93" y1="266.48" x2="161.24" y2="266.48"/>
                <line x1="365.93" y1="452.1" x2="161.24" y2="266.48"/>
                <line x1="365.93" y1="637.86" x2="161.24" y2="266.48"/>
                <line x1="365.93" y1="823.61" x2="161.24" y2="266.48"/>
                <line x1="365.93" y1="80.87" x2="161.24" y2="452.1"/>
                <line x1="365.93" y1="266.48" x2="161.24" y2="452.1"/>
                <line x1="365.93" y1="452.1" x2="161.24" y2="452.1"/>
                <line x1="365.93" y1="637.86" x2="161.24" y2="452.1"/>
                <line x1="365.93" y1="823.61" x2="161.24" y2="452.1"/>
                <line x1="365.93" y1="80.87" x2="161.24" y2="637.86"/>
                <line x1="365.93" y1="266.48" x2="161.24" y2="637.86"/>
                <line x1="365.93" y1="452.1" x2="161.24" y2="637.86"/>
                <line x1="365.93" y1="637.86" x2="161.24" y2="637.86"/>
                <line x1="365.93" y1="823.61" x2="161.24" y2="637.86"/>
                <line x1="365.93" y1="80.87" x2="161.24" y2="823.61"/>
                <line x1="365.93" y1="266.48" x2="161.24" y2="823.61"/>
                <line x1="365.93" y1="452.1" x2="161.24" y2="823.61"/>
                <line x1="365.93" y1="637.86" x2="161.24" y2="823.61"/>
            </svg>
        )
    }
    else {
        return (
            <svg id="networkNodes" xmlns="http://www.w3.org/2000/svg" viewBox="365 -2 164 910" style={{stroke: color ? color : 'white', fill: 'none', strokeWidth: '6px'}} className={className}>
                <circle cx="446.3" cy="80.87" r="80.37"/>
                <circle cx="446.3" cy="266.48" r="80.37"/>
                <circle cx="446.3" cy="452.1" r="80.37"/>
                <circle cx="446.3" cy="637.86" r="80.37"/>
                <circle cx="446.3" cy="823.61" r="80.37"/>
            </svg>
        )
    }
}