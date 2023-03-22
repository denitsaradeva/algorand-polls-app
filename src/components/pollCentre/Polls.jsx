import React, {useEffect, useState} from "react";
import {algodClient} from "../../utils/constants";
import Poll from "./Poll";
import {getPolls, castVote, retrieveVotes, retrieveEndTime, Optin} from "../../utils/pollCentre";
import {Row, Button, Modal, Card} from "react-bootstrap";
import { Link, useLocation } from 'react-router-dom';
import PollCreation from './PollCreation';

const Polls = () => {
    const [allPolls, setAllPolls] = useState([]);
    const [showPoll, setShowPoll] = useState(false);
    const [showPollCreation, setShowPollCreation] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const address = searchParams.get('address');

    const [currentTitle, setCurrentTitle] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState('');
    const [currentVotes, setCurrentVotes] = useState({});
    const [currentRound, setCurrentRound] = useState(0);
    const [globalLastRound, setGlobalLastRound] = useState(0);
    const [endTime, setEndTime] = useState(0);

    const [currentPoll, setCurrentPoll] = useState('')
    const [showResultsFl, setShowResultsFl] = useState(false);

    const handleVote = async (choice, appId) => {
        if(choice !== ''){
            Optin(address, appId).then(() => {
                castVote(address, choice, appId)
                    .then(()=> getPollsUpdate())
                    .catch(error => {
                        console.log(error);
                });
            });
            console.log("done handling vote..");
        }  
    };

    const handleResults = async (appId) => {
        await algodClient.status().do().then((value) => {
            console.log('valuee')
            console.log(value)
            setCurrentRound(value[['last-round']]);
        });

        await algodClient.block(currentRound).do().then((value) => {
            console.log('ress')
            console.log(value['block']['ts'])
            setGlobalLastRound(value['block']['ts'])
        });

        await retrieveEndTime(appId).then((value) => {
            console.log('valueee')
            console.log(value)
            setEndTime(value);
        });

        console.log('current')
        console.log(globalLastRound)
        console.log('end time')
        console.log(endTime)

        if(globalLastRound > endTime){
            retrieveVotes(appId).then((value) => {
                setCurrentVotes(value);
                setShowResultsFl(true);
            });

        }else{
            alert('The voting process for the poll hasn\'t ended')
        } 
    };
    
    const handleOpenPoll = async (poll, index) => {
        setCurrentTitle(poll.title);
        setCurrentPoll(poll);
        const inputOptions = poll.options;
        const optionsData = inputOptions.split(",");
        setCurrentOptions(optionsData);
        setCurrentIndex(index);
        setShowPoll(true);
    };
    
    const handleClosePoll = () => {
        setShowPoll(false);
    };

    const handleOpenPollCreation = async () => {
        setShowPollCreation(true);
    };
    
    const handleClosePollCreation = () => {
        setShowPollCreation(false);
    };

    const getPollsUpdate = async () => {
        getPolls()
            .then(polls => {
                if (polls) {
                    setAllPolls(polls);
                }
            })
            .catch(error => {
                console.log(error);
            })
    };

    useEffect(() => {
        getPollsUpdate();
    }, []);

	return (
	    <>
	        <div className="bg-success min-vh-100">
                <h1 className="text-dark display-3 text-center">{"Polls"}</h1>

                <br></br>

                <Row xs={1} sm={2} lg={3} >
                    <>
                        {allPolls.map((poll, index) => (
                            <div key={index}>
                                <Card className="card h-100" style={{ width: '20rem' }} key={index}>
                                    <div className="card text-center">
                                        <div className="card-header">
                                            <h3>{poll.title}</h3>
                                        </div>
                                        <div className="card-body">
                                            <Button variant="secondary" onClick={() => handleOpenPoll(poll, index)} key={index}>See more</Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )).reverse().slice(69)}
                    </>
                </Row>
                
                <div className="text-center px-3 mt-5">
                    <Button className="btn btn-dark rounded-pill btn-lg"  onClick={() => handleOpenPollCreation()} type="submit">Add a Poll</Button>
                </div>

                <Modal show={showPollCreation} onHide={handleClosePollCreation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new poll</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <PollCreation></PollCreation>
                    </Modal.Body>
                </Modal>

                <Modal show={showPoll} onHide={handleClosePoll}>
                    <Modal.Header closeButton>
                        <Modal.Title>{currentTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Poll
                            address={address}
                            options={currentOptions}
                            appId={currentPoll.appId}
                            votes={currentVotes}
                            onOptionSelect={handleVote}
                            showResults = {handleResults}
                            showResultsFlag = {showResultsFl}
                            key={currentIndex}
                        />
                    </Modal.Body>
                </Modal>
            </div>
	    </>
	);
};

export default Polls;