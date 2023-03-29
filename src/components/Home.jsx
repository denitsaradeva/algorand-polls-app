import React, {useState, useEffect} from "react";
import {Button} from "react-bootstrap";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import {getPolls} from "../utils/pollCentre";
import { Link } from 'react-router-dom';
import {indexerClient} from "../utils/constants";
import { ProgressSpinner } from 'primereact/progressspinner';
import '../App.css'

const Home = () => {

    const [address, setAddress] = useState(null);
    const [allPolls, setAllPolls] = useState([]);
    const [isWaiting, setIsWaiting] = useState(false);

    const pollsData = {
        polls: allPolls,
        address: address
    };

    const getPollsUpdate = async (account) => {
        getPolls()
            .then(polls => {
                if (polls) {
                    setAllPolls(polls);
                    setAddress(account.address);
                }
            })
            .catch(error => {
                console.log(error);
            })
    };

    useEffect(() => {
        return () => {
          setAllPolls(allPolls);
        };
    }, [allPolls]);

    const connectToMyAlgoWallet = async () => {
        try {
            setIsWaiting(true);
            const settings = {
                shouldSelectOneAccount: true,
                openManager: true
            }; 

            const accounts = await new MyAlgoConnect().connect(settings);
            const account = accounts[0];
            
            await indexerClient.lookupAccountAssets(account.address).do().then(async (jsonOutput) =>{
                let assetValues = jsonOutput['assets'];
                for (let i =0; i<assetValues.length; i++){
                    if(assetValues[i]['asset-id']===162841058){
                        await getPollsUpdate(account).then(()=>{
                            setIsWaiting(false);
                        })
                        .catch ((error) => {
                            console.log(error);
                        });
                    }
                }
            });
        } catch (e) {
            alert('Problem while trying to connect to MyAlgo wallet');
            setIsWaiting(false);
            console.error(e);
        }
    };

    return (
        <div className="d-flex justify-content-center flex-column poll-footer text-center min-vh-100">
            <div className="  mb-5">
                <div style={{maxWidth: "320px"}}>
                </div>
                <h1 className="text-light display-1">{"Algo Polls"}</h1>
                <Button type="button"
                    onClick={() => connectToMyAlgoWallet()}
                    className="btn btn-light rounded-pill px-3 mt-3"
                >
                    Connect Wallet
                </Button>
                {isWaiting &&
                    <div className="flex justify-content-center waitingSpinner">
                        <ProgressSpinner  style={{width: '50px', height: '50px'}}/>
                    </div>
                } 
                <br></br>
                {address && (
                    <Link to='/polls' state= {pollsData}>
                        <Button type="button"className="btn btn-light rounded-pill px-3 mt-3">
                            Go to Polls
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Home;