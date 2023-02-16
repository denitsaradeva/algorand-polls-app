import React, {useState} from "react";
import './App.css';
import MyAlgoConnect from "@randlabs/myalgo-connect";
import Home from "./components/Home";
import Polls from "./components/pollCentre/Polls";

const App = function AppWrapper() {

    const [address, setAddress] = useState(null);

    const connectToMyAlgoWallet = async () => {
      try {
        const accounts = await new MyAlgoConnect().connect();
        const account = accounts[0];
        setAddress(account.address);
      } catch (e) {
        console.log('Problem while trying to connect to MyAlgo wallet');
        console.error(e);
      }
    };

    return (
        <>
            {address ? (
              <Polls address={address}/>
            ) : (
              <Home connect={connectToMyAlgoWallet}/>
            )}
        </>
    );
}

export default App;