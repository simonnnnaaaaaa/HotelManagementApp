import React, { useState } from 'react';
import HashLoader from "react-spinners/HashLoader";

function Loader() {
    let [loading, setLoading] = useState(true);

    return (
        <div style={{
            display: 'flex',           
            justifyContent: 'center',  
            alignItems: 'center',      
            height: '100vh'            
        }}>
            <div className="sweet-loading">
                <HashLoader
                    color='#000'
                    loading={loading}
                    size={80}
                />
            </div>
        </div>
    );
}

export default Loader;
