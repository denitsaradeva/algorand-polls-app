import React, {useEffect, useState} from "react";
import Poll from "./Poll";
import {getPolls, castVote, retrieveVotes, Optin} from "../../utils/pollCentre";
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
    
    const handleOpenPoll = (poll, index) => {
        setCurrentTitle(poll.title);
        setCurrentPoll(poll);
        retrieveVotes(poll.appId).then((value) => {
            setCurrentVotes(value);
        });
        console.log('aa')
        console.log(currentVotes)
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
	        <div className="d-flex justify-content-between align-items-center mb-4">
	            <h1 className="fs-4 fw-bold mb-0">Polls</h1>
	        </div>

	        <Row xs={1} sm={2} lg={3} className="g-3 mb-5 g-xl-4 g-xxl-5">
	            <>
	                {allPolls.map((poll, index) => (
                        <Card style={{ width: '18rem' }} key={index}>
                            <Card.Body>
                                <Card.Title>{poll.title}</Card.Title>
                                <Button variant="secondary" onClick={() => handleOpenPoll(poll, index)} key={index}>See more</Button>
                            </Card.Body>
                        </Card>
	                )).reverse().slice(58)}
	            </>
	        </Row>

            <Link to={`/create?address=${address}`}>
                <Button variant="primary" type="submit">Add a Poll</Button>
            </Link>

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
                        key={currentIndex}
                    />
                </Modal.Body>
            </Modal>
	    </>
	);
};

export default Polls;