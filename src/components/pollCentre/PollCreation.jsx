import React, {useState} from "react";
import {Form, Button} from "react-bootstrap";
import {createNewPoll} from "../../utils/pollCentre";
import {Link, useLocation, useNavigate} from 'react-router-dom';

const PollCreation = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const address = searchParams.get('address');
    console.log('Address:', address);

    const [title, setTitle] = useState('');
    const [options, setOptions] = useState([]);
    const navigate = useNavigate();

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
        console.log('aa')
        console.log(address)
        createNewPoll(address, title, result)
            .then(() => {
                //`polls?address=${address}`, {replace: true}
                navigate(-1);
            })
            .catch(error => {
                console.log(error);
        });
    };

    return (
        <div>
            <h3>Poll Information</h3>
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
        </div>
    );
};

export default PollCreation;