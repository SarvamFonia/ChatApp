import React, { useEffect, useState } from 'react'
import Dashboard from '../Dashboard/Dashboard';

const MobileDashboard = () => {

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div>
            { width>=992 ? <Dashboard></Dashboard> : <></>}
        </div>
    )
}

export default MobileDashboard
