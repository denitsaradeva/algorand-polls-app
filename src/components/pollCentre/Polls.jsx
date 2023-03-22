import React, {useState} from "react";
import {algodClient} from "../../utils/constants";
import PollInstance from "./Poll";
import Poll from "../../utils/pollCentre"
import {castVote, retrieveVotes, Optin} from "../../utils/pollCentre";
import {Button, Modal, Card} from "react-bootstrap";
import { useLocation } from 'react-router-dom';
import PollCreation from './PollCreation';
import '../../App.css'

const Polls = () => {
    let { state } = useLocation();

    const [allPolls, setAllPolls] = useState(state.polls);
    const [showPoll, setShowPoll] = useState(false);
    const [showPollCreation, setShowPollCreation] = useState(false);
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentEndTime, setCurrentEndTime] = useState(0);
    const [currentIndex, setCurrentIndex] = useState('');
    const [currentVotes, setCurrentVotes] = useState({});
    const [currentRound, setCurrentRound] = useState(0);
    const [globalLastRound, setGlobalLastRound] = useState(0);
    const [currentPoll, setCurrentPoll] = useState('')
    const [showResultsFl, setShowResultsFl] = useState(false);

    const address = state.address;

    const completedCreation = async (address, title, result, date, appId) => {
        let poll = new Poll(address, title, result, date, appId);
        const newPolls = [{ poll }, ...allPolls];
        setAllPolls(newPolls);
        setShowPollCreation(false);
    };

    const handleVote = async (choice, appId) => {
        if(choice !== ''){
            Optin(address, appId).then(() => {
                castVote(address, choice, appId)
                    .catch(error => {
                        console.log(error);
                });
            });
            console.log("done handling vote..");
        }else{
            alert('You should select an option to vote for.')
        }  
    };

    const handleResults = async (endTime, appId) => {
        await algodClient.status().do().then((value) => {
            console.log('valuee')
            console.log(value[['last-round']])
            setCurrentRound(value[['last-round']]);
        }).then(async () =>{
            await algodClient.block(currentRound).do().then((value) => {
                console.log('ress')
                console.log(value['block']['ts'])
                setGlobalLastRound(value['block']['ts'])
            });
        });

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
        console.log('fs')
        console.log(poll)
        const inputOptions = poll.votingChoices;
        const optionsData = inputOptions.split(",");
        setCurrentOptions(optionsData);
        setCurrentEndTime(poll.endTime)
        setCurrentIndex(index);
        setShowPoll(true);
    };
    
    const handleClosePoll = () => {
        setShowPoll(false);
    };

    const handleOpenPollCreation = async () => {
        console.log('ds')
        console.log(address)
        setShowPollCreation(true);
    };
    
    const handleClosePollCreation = () => {
        setShowPollCreation(false);
    };

	return (
	    <>
            <div className="container">
                <h1 className="text-dark display-3 text-center">{"Polls"}</h1>
            </div>

            <br></br>
            
            <div className="container">
                <div className="row justify-content-center">
                    <div class="col-md-6">
                        <div className="parent-container">
                            {allPolls.map((poll, index) => (
                                <div className="col-md-3" key={index}>
                                    <Card className="card" key={index}>
                                    <div className="bg-success card text-center">
                                        <div className="card-header" style={{height: '12em'}}>
                                            <h3>{poll.title}</h3>
                                        </div>
                                        <div className="card-body">
                                            <Button variant="dark" onClick={() => handleOpenPoll(poll, index)} key={index}>See more</Button>
                                        </div>
                                    </div>
                                    </Card>
                                    <br></br>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center px-3 mt-5">
                <Button className="btn btn-dark rounded-pill btn-lg"  onClick={() => handleOpenPollCreation()} type="submit">Add a Poll</Button>
            </div>

            <Modal show={showPollCreation} onHide={handleClosePollCreation}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a new poll</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-success">
                    <PollCreation 
                        address={address}
                        completedCreation = {completedCreation}
                    />
                </Modal.Body>
            </Modal>

            <Modal show={showPoll} onHide={handleClosePoll}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PollInstance
                        address={address}
                        options={currentOptions}
                        endTime={currentEndTime}
                        appId={currentPoll.appId}
                        votes={currentVotes}
                        onOptionSelect={handleVote}
                        showResults = {handleResults}
                        showResultsFlag = {showResultsFl}
                        key={currentIndex}
                    />
                </Modal.Body>
            </Modal>
	    </>
	);
};

export default Polls;