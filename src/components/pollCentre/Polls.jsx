import React, {useState} from "react";
import {algodClient} from "../../utils/constants";
import PollInstance from "./PollInstance";
import Poll from "../../utils/pollCentre"
import {castVote, retrieveVotes, Optin} from "../../utils/pollCentre";
import {Button, Modal, Card, ModalDialog, ModalBody} from "react-bootstrap";
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
    const [optedIn, setOptedIn] = useState(false);

    console.log(allPolls)

    const address = state.address;

    const completedCreation = async (address, titleName, result, date, appId) => {
        let newDate = Math.floor(date.getTime() / 1000);
        const newPolls = [{ title: titleName, owner: address, votingChoices: result, endTime: newDate, appId: appId }, ...allPolls];
        setAllPolls(newPolls);
        setShowPollCreation(false);
    };

    const handleVote = async (choice, appId) => {
        if(choice !== ''){
           castVote(address, choice, appId)
                    .catch(error => {
                        console.log(error);
                });
            console.log("done handling vote..");
        }else{
            alert('You should select an option to vote for.')
        }
        // else{
        //     alert('You should opt in.')
        // }

        //optin shouldn't be local var --> todo
    };

    const handleOptIn = async (appId) => {
        Optin(address, appId).then(() => {
           setOptedIn(true); 
        }).catch((error)=>{
            console.log(error);
        });
    };

    const handleResults = async (endTime, appId) => {
        const status = await algodClient.status().do();
        setCurrentRound(status[['last-round']]);

        const block = await algodClient.block(status['last-round']).do();
        console.log('ress');
        console.log(block['block']['ts']);
        setGlobalLastRound(block['block']['ts']);

        if(globalLastRound > endTime){
            const votes = await retrieveVotes(appId);
            setCurrentVotes(votes);
            setShowResultsFl(true);
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

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
        return formattedDate;
    };

	return (
        <div className="polls">
            <h1 className="text-dark display-3 text-center">{"Polls"}</h1>
            <br></br>
            <div className="row justify-content-center card-padding">
                {allPolls.map((poll, index) => (
                    <div className="col-md-2 mb-3" key={index}>
                        <Card key={index}>
                            <div className="card text-center">
                                <div className="card-header poll-body" style={{height: '7em'}}>
                                    <h3>{poll.title}</h3>
                                </div>
                                <div className="card-body poll-footer">
                                    <Button type="button" className="btn btn-light" onClick={() => handleOpenPoll(poll, index)} key={index}>See more</Button>
                                </div>
                            </div>
                        </Card>
                        <br></br>
                    </div>
                ))}

                <div className="text-center">
                    <Button className="btn btn-primary rounded-pill btn-lg"  onClick={() => handleOpenPollCreation()} type="submit">Add a Poll</Button>
                </div>
            </div>

            <Modal show={showPollCreation} onHide={handleClosePollCreation}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a new poll</Modal.Title>
                </Modal.Header>
                <Modal.Body className="poll-body">
                    <PollCreation 
                        address={address}
                        completedCreation = {completedCreation}
                    />
                </Modal.Body>
            </Modal>

            <Modal show={showPoll} onHide={handleClosePoll}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentTitle}</Modal.Title>
                    <ModalBody>Ends on {formatDate(currentEndTime)}</ModalBody>
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
                        optIn = {handleOptIn}
                        key={currentIndex}
                    />
                </Modal.Body>
            </Modal>
        </div>
	);
};

export default Polls;