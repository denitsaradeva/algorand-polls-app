import React, {useState} from "react";
import './App.css';
import MyAlgoConnect from "@randlabs/myalgo-connect";
import {getPolls} from "./utils/pollCentre";

const App = function AppWrapper() {

    const [address, setAddress] = useState(null);
    const [polls, setPolls] = useState([]);

    const connectToMyAlgoWallet = async () => {
      try {
        const accounts = await new MyAlgoConnect().connect();
        const account = accounts[0];
        setAddress(account.address);
        getPolls().then(polls => { //todo getPolls()
            setPolls(polls)
        });
      } catch (e) {
        console.log('Problem while trying to connect to MyAlgo wallet');
        console.error(e);
      }
    };

    return (
        <>
            {address ? (
               polls.map(poll => (
                 <button key={poll}>{poll.title}</button>
               ))
                // polls.forEach((poll) => <button>poll.title</button>)
            ) : (
                <button onClick={connectToMyAlgoWallet}>CONNECT WALLET</button>
            )}
        </>
    );
}

export default App;

//<button>AAA {poll.title}</button>