import React, {useEffect, useState} from "react";
import Poll from "./Poll";
import {createNewPoll, getPolls} from "../../utils/pollCentre";
import PropTypes from "prop-types";
import {Row, Button, Form, Modal} from "react-bootstrap";
import CreatePoll from './CreatePoll';
// import { Modal, Button } from "react-bootstrap";



const Polls = ({address}) => {
    const [allPolls, setAllPolls] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [options, setOptions] = useState('');

    const handleTitleChange = event => {
        setTitle(event.target.value);
        console.log(title);
    };

    const handleOptionsChange = event => {
        setOptions(event.target.value);
        console.log(options);
    };

    const handleSubmit = event => {
        event.preventDefault();
        createNewPoll(address, title, options)
            .then(()=> getPollsUpdate())
            .catch(error => {
                console.log(error);
            });
        handleCloseModal();
    };

    const handleOpenModal = () => {
      setShowModal(true);
    };
  
    const handleCloseModal = () => {
      setShowModal(false);
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
	                    <Poll
	                        address={address}
	                        poll={poll}
	                        key={index}
	                    />
	                ))}
	            </>
	        </Row>
            <Button variant="primary" type="submit" onClick={handleOpenModal}>Add a Poll</Button>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Poll Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Label>Title:</Form.Label>
                        <Form.Group className="mb-3" onChange={handleTitleChange} value={title} >
                            <Form.Control placeholder="Title" />
                        </Form.Group>

                        <Form.Label>Options:</Form.Label>
                        <Form.Group className="mb-3" onChange={handleOptionsChange} value={options} >
                            <Form.Control placeholder="Options" />
                        </Form.Group>

                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            Create Poll
                        </Button>
                    </Form>
                </Modal.Body>
                {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCloseModal}>
                        Save Changes
                    </Button>
                </Modal.Footer> */}
            </Modal>
	    </>
	);
};

Polls.propTypes = {
    address: PropTypes.string.isRequired
};

export default Polls;