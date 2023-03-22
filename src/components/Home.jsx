import React, {useState} from "react";
import {Button} from "react-bootstrap";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { Link } from 'react-router-dom';
import {indexerClient} from "../utils/constants";

const Home = () => {

    const [address, setAddress] = useState(null);

    const connectToMyAlgoWallet = async () => {
      try {

        const settings = {
            shouldSelectOneAccount: true,
            openManager: true
        }; 

        const accounts = await new MyAlgoConnect().connect(settings);
        console.log('accounts')
        console.log(accounts)
        const account = accounts[0];
        
        await indexerClient.lookupAccountAssets(account.address).do().then((jsonOutput) =>{
            let assetValues = jsonOutput['assets'];
            for (let i =0; i<assetValues.length; i++){
                if(assetValues[i]['asset-id']===162841058){
                    setAddress(account.address);
                }
            }
        });
      } catch (e) {
        console.log('Problem while trying to connect to MyAlgo wallet');
        console.error(e);
      }
    };

    return (
        <div className="d-flex justify-content-center flex-column bg-success text-center min-vh-100">
            <div className="  mb-5">
                <div
                    // className=" ratio ratio-1x1 mx-auto mb-2"
                    style={{maxWidth: "320px"}}
                >
                </div>
                <h1 className="text-dark display-1">{"Algo Polls"}</h1>
                {/* <p className="text-light">Please connect your wallet to continue.</p> */}
                <Button type="button"
                    onClick={() => connectToMyAlgoWallet()}
                    // variant="outline-light"
                    className="btn btn-dark rounded-pill px-3 mt-3"
                >
                    Connect Wallet
                </Button>
                <br></br>
                {address && (
                    <Link to={`/polls?address=${address}`}>
                        <Button type="button"
                            // variant="outline-light"
                            className="btn btn-dark rounded-pill px-3 mt-3"
                        >
                            Go to Polls
                        </Button>
                    </Link>
                )}
            </div>
            {/* <p className="mt-auto text-secondary">Powered by Algorand</p> */}
        </div>
    );
};

export default Home;