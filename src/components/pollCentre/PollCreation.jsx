import React, {useState} from "react";
import {Form, Button} from "react-bootstrap";
import {createNewPoll} from "../../utils/pollCentre";
import {useLocation, useNavigate} from 'react-router-dom';

const PollCreation = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const address = searchParams.get('address');
    console.log('Address:', address);

    const [title, setTitle] = useState('');
    const [options, setOptions] = useState([]);
    const navigate = useNavigate();

    const [date, setDate] = useState(new Date());

    console.log("DATE", date);

    const handleTitleChange = event => {
        setTitle(event.target.value);
    };

    const handleOptionsChange = (event, index) => {
        const newOptions = [...options];
        newOptions[index] = event.target.value;
        setOptions(newOptions);
    };

    const removeOption = (indexToRemove) => {
        const newOptions = options.filter((option, index) => index !== indexToRemove);
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        let result = options.join(",");
        createNewPoll(address, title, result)
            .then(() => {
                navigate(-1);
            })
            .catch(error => {
                console.log(error);
        });
    };

    return (
        <div className="bg-success min-vh-100">
            <h3 className="text-black display-3 text-center">Poll Information</h3>
            <Form onSubmit={handleSubmit}>
                <div>
                    <Form.Label htmlFor="title">Title:</Form.Label>
                    <Form.Group className="mb-3" onChange={handleTitleChange} value={title} >
                        <Form.Control placeholder="Title" style={{width: "40%"}}/>
                    </Form.Group>
                </div>
                <div>
                    <Form.Label htmlFor="options">Options:</Form.Label>
                    {options.map((option, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <Form.Control placeholder="Option" onChange={(e) => handleOptionsChange(e, index)} value={option} style={{width: "40%"}}/>
                            <Button variant="secondary" onClick={() => removeOption(index)} className="remove-btn btn btn-dark">
                                X
                            </Button>
                        </div>
                    ))}
                    <br></br>
                    <Button variant="secondary" className="btn btn-dark" type="button" onClick={addOption}>
                    Add Option
                    </Button>
                </div>
                <br></br>
                <div>
                    <Form.Label htmlFor="duration">Duration:</Form.Label>
                    <Form.Group controlId="duedate">
                        <Form.Control
                            type="date"
                            name="duedate"
                            placeholder="Due date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{width: "40%"}}
                        />
                    </Form.Group>
                </div>
                <br></br>
                <Button className="btn btn-dark rounded-pill btn-lg" variant="secondary" type="submit" onClick={handleSubmit}>
                    Create Poll
                </Button>
            </Form>
        </div>
    );
};

export default PollCreation;