import React from 'react';
import {Button} from "react-bootstrap";

const Home = ({connect}) => {
    return (
        <div className="d-flex justify-content-center flex-column text-center bg-black min-vh-100">
            <div className="mt-auto text-light mb-5">
                <div
                    className=" ratio ratio-1x1 mx-auto mb-2"
                    style={{maxWidth: "320px"}}
                >
                </div>
                <h1>{"Algo Polls"}</h1>
                <p>Please connect your wallet to continue.</p>
                <Button
                    onClick={() => connect()}
                    variant="outline-light"
                    className="rounded-pill px-3 mt-3"
                >
                    Connect Wallet
                </Button>
            </div>
            <p className="mt-auto text-secondary">Powered by Algorand</p>
        </div>
    );
};

export default Home;