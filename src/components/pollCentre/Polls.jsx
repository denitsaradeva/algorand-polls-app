import React, {useEffect, useState} from "react";
import {algodClient} from "../../utils/constants";
import Poll from "./Poll";
import {getPolls, castVote, retrieveVotes, retrieveEndTime, Optin} from "../../utils/pollCentre";
import {Row, Button, Modal, Card} from "react-bootstrap";
import { Link, useLocation } from 'react-router-dom';

const Polls = () => {
    const [allPolls, setAllPolls] = useState([]);
    const [showPoll, setShowPoll] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const address = searchParams.get('address');

    const [currentTitle, setCurrentTitle] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState('');
    const [currentVotes, setCurrentVotes] = useState({});
    const [currentRound, setCurrentRound] = useState(0);
    const [endTime, setEndTime] = useState(0);

    const [currentPoll, setCurrentPoll] = useState('')

    const handleVote = (choice, appId) => {
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
            setCurrentRound(value[['last-round']]);
        });
        await retrieveEndTime(appId).then((value) => {
            setEndTime(value);
        });

        console.log('current')
        console.log(currentRound)
        console.log('end time')
        console.log(endTime)

        if(currentRound > endTime){
            retrieveVotes(appId).then((value) => {
                setCurrentVotes(value);
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
                <h1 className="text-light display-3 text-center">{"Polls"}</h1>

                <br></br>

                <Row xs={1} sm={2} lg={3} >
                    <>
                        {allPolls.map((poll, index) => (
                            <div>
                                <Card class="card h-100" style={{ width: '18rem' }} key={index}>
                                    <div class="card text-center">
                                        <div class="card-header">
                                            {poll.title}
                                        </div>
                                        <div class="card-body">
                                            <Button variant="secondary" onClick={() => handleOpenPoll(poll, index)} key={index}>See more</Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )).reverse().slice(65)}
                    </>
                </Row>
                
                <div class="text-center px-3 mt-5">
                    <Link to={`/create?address=${address}`}>
                        <Button class="btn btn-dark rounded-pill btn-lg" type="submit">Add a Poll</Button>
                    </Link>
                </div>


                <Modal show={showPoll} onHide={handleClosePoll}>
                    <Modal.Header closeButton>
                        <Modal.Title></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Poll

                            address={address}
                            title={currentTitle}
                            options={currentOptions}
                            appId={currentPoll.appId}
                            votes={currentVotes}
                            onOptionSelect={handleVote}
                            showResults = {handleResults}
                            key={currentIndex}
                        />
                    </Modal.Body>
                </Modal>
            </div>
	    </>
	);
};

export default Polls;