import React from 'react'

function Succes({message}) {
    return (
        <div>
            <div className="alert alert-success" role="alert">
                {message}
            </div>
        </div>
    )
}

export default Succes
