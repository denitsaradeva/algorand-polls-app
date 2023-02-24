import React, {useEffect, useState} from "react";
import Poll from "./Poll";
import {createNewPoll, getPolls} from "../../utils/pollCentre";
import {Row, Button, Form, Modal, Card} from "react-bootstrap";

const Polls = ({address}) => {
    const [allPolls, setAllPolls] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showPoll, setShowPoll] = useState(false);

    const [currentTitle, setCurrentTitle] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState('');

    const [title, setTitle] = useState('');
    const [options, setOptions] = useState([]);

    const handleTitleChange = event => {
        setTitle(event.target.value);
    };

    const handleOptionsChange = (event, index) => {
        const newOptions = [...options];
        newOptions[index] = event.target.value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        let result = options.join(",");
        createNewPoll(address, title, result)
            .then(()=> getPollsUpdate())
            .catch(error => {
                console.log(error);
            });
        handleCloseModal();
    };

    const handleVote = event => {
        event.preventDefault();
        console.log("todo..");
    };

    const handleOpenModal = () => {
      setShowModal(true);
    };
  
    const handleCloseModal = () => {
      setShowModal(false);
    };
    
    const handleOpenPoll = (poll, index) => {
        setCurrentTitle(poll.title);
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
        console.log(address);
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
	                )).reverse().slice(20)}
	            </>
	        </Row>

            <Button variant="primary" type="submit" onClick={handleOpenModal}>Add a Poll</Button>

            
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Poll Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div>
                            <Form.Label htmlFor="title">Title:</Form.Label>
                            <Form.Group className="mb-3" onChange={handleTitleChange} value={title} >
                                <Form.Control placeholder="Title" />
                            </Form.Group>
                        </div>
                        <div>
                            <label htmlFor="options">Options:</label>
                            {options.map((option, index) => (
                                <div key={index}>
                                    <Form.Control placeholder="Option" onChange={(e) => handleOptionsChange(e, index)} value={option} />
                                </div>
                            ))}
                            <Button variant="secondary" type="button" onClick={addOption}>
                            Add Option
                            </Button>
                        </div>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            Create Poll
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showPoll} onHide={handleClosePoll}>
                <Modal.Header closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Poll
                        address={address}
                        title={currentTitle}
                        options={currentOptions}
                        key={currentIndex}
                    />
                    <Button variant="primary" type="submit" onClick={handleVote}>
                            Vote
                    </Button>
                </Modal.Body>
            </Modal>
	    </>
	);
};

export default Polls;