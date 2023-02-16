import React, {useEffect, useState} from "react";
import Poll from "./Poll";
import {castVote, createNewPoll, removePoll, getPolls} from "../../utils/pollCentre";
import PropTypes from "prop-types";
import {Row, Button, Form, FormGroup} from "react-bootstrap";

const Polls = ({address}) => {
    const [allPolls, setAllPolls] = useState([]);
    const [title, setTitle] = useState('');
    const [options, setOptions] = useState('');
    
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

    const handleTitleChange = event => {
        setTitle(event.target.value);
        console.log(title);
    };

    const handleOptionsChange = event => {
        setOptions(event.target.value);
        console.log(options);
    };

    const handleSubmit = event => {
        createNewPoll(address, title, options)
            .then(() => {
                getPollsUpdate();
            })
            .catch(error => {
                console.log(error);
            })
        console.log(title);
        console.log(options);
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
	                    <Poll
	                        address={address}
	                        poll={poll}
	                        key={index}
	                    />
	                ))}
	            </>
	        </Row>

            <br></br>

            <Form>
                <Form.Group className="mb-3" onChange={handleTitleChange} value={title} >
                    <Form.Control placeholder="Title" />
                </Form.Group>

                <Form.Group className="mb-3" onChange={handleOptionsChange} value={options} >
                    <Form.Control placeholder="Options" />
                </Form.Group>

                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    Submit
                </Button>
            </Form>
	    </>
	);
};

Polls.propTypes = {
    address: PropTypes.string.isRequired
};

export default Polls;