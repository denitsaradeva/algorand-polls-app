import React, {useState} from "react";
import PropTypes from "prop-types";
import {Button, Form} from "react-bootstrap";
import {createNewPoll} from "../../utils/pollCentre";
import ReactModal from 'react-modal';

const CreatePoll = ({address, onClose}) => {
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
            .catch(error => {
                console.log(error);
            });
        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <Form>
                    <Form.Group className="mb-3" onChange={handleTitleChange} value={title} >
                        <Form.Control placeholder="Title" />
                    </Form.Group>

                    <Form.Group className="mb-3" onChange={handleOptionsChange} value={options} >
                        <Form.Control placeholder="Options" />
                    </Form.Group>

                    <Button variant="primary" type="submit" onClick={handleSubmit}>
                        Create Poll
                    </Button>
                </Form>
            </div>
        </div>
    );
};

CreatePoll.propTypes = {
    address: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default CreatePoll;